import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { AddressSearchResponseDto } from 'src/dtos/address.dto'
import { RouteSearchRequestDto, RouteSearchResponseDto } from 'src/dtos/route.dto'
import { RedisCacheService } from './redis-cache.service'

interface Coordinates {
  latitude: number
  longitude: number
}

@Injectable()
export class MapboxService {
  private readonly logger = new Logger(MapboxService.name)
  private readonly apiClient
  private readonly accessToken: string
  private readonly GEOCODING_CACHE_TTL = 60 * 60 * 24 * 7 // 7 days in seconds
  private readonly ADDRESS_SEARCH_CACHE_TTL = 60 * 60 * 24 * 7 // 7 days in seconds
  private readonly ROUTE_SEARCH_CACHE_TTL = 60 * 60 * 24 // 1 day in seconds
  private readonly COORDINATE_THRESHOLD = 0.001 // ~100 meters

  constructor(
    private configService: ConfigService,
    private redisCacheService: RedisCacheService,
  ) {
    const token = this.configService.get<string>('MAPBOX_ACCESS_TOKEN')
    if (!token) {
      this.logger.error('Mapbox access token is missing')
      throw new Error('Mapbox access token is missing')
    }
    this.accessToken = token

    this.apiClient = axios.create({
      baseURL: this.configService.get<string>('MAPBOX_API_URL'),
      params: {
        access_token: this.accessToken,
      },
    })
  }

  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      // First check if we have a cached result for these exact coordinates
      const exactCacheKey = this.generateGeocodingCacheKey({ latitude, longitude })
      const cachedAddress = await this.redisCacheService.get<string>(exactCacheKey)

      if (cachedAddress) {
        this.logger.debug(`Cache hit for exact coordinates: ${latitude},${longitude}`)
        return cachedAddress
      }

      // If not found, check for nearby coordinates
      const nearbyAddress = await this.findNearbyCachedAddress({ latitude, longitude })
      if (nearbyAddress) {
        this.logger.debug(`Using nearby cached address for: ${latitude},${longitude}`)
        return nearbyAddress
      }

      // If no cached result found, fetch from API
      const response = await this.apiClient.get(
        `/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
      )
      const features = response.data.features

      if (features && features.length > 0) {
        // Return the most relevant result (usually the first one)
        const address = features[0].place_name

        // Cache the result
        await this.redisCacheService.set(exactCacheKey, address, this.GEOCODING_CACHE_TTL)

        return address
      }

      throw new NotFoundException('No address found for the given coordinates')
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      this.logger.error(`Error fetching address from Mapbox: ${error.message}`)
      throw error
    }
  }

  private async findNearbyCachedAddress(coords: Coordinates): Promise<string | null> {
    try {
      // Get all geocoding cache keys
      const keys = await this.redisCacheService.getKeysByPattern('geocoding:*')

      for (const key of keys) {
        const cachedCoords = this.parseCoordinatesFromCacheKey(key)
        if (!cachedCoords) continue

        // Check if coordinates are within threshold
        if (this.areCoordinatesNearby(coords, cachedCoords)) {
          return await this.redisCacheService.get<string>(key.replace('enroute:', ''))
        }
      }

      return null
    } catch (error) {
      this.logger.error(`Error finding nearby cached address: ${error.message}`)
      return null
    }
  }

  async searchAddress(query: string, limit: number = 5): Promise<AddressSearchResponseDto[]> {
    try {
      // Create a cache key based on the query and limit
      const cacheKey = this.generateAddressSearchCacheKey(query, limit)

      // Check if we have a cached result
      const cachedResults = await this.redisCacheService.get<AddressSearchResponseDto[]>(cacheKey)
      if (cachedResults) {
        this.logger.debug(`Cache hit for address search: ${query}`)
        return cachedResults
      }

      // If not found in cache, fetch from API
      const response = await this.apiClient.get(
        '/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json',
        {
          params: {
            limit,
            types: 'address,place,poi',
            proximity: '38.761253,9.010793',
          },
        },
      )

      const features = response.data.features
      if (!features || features.length === 0) {
        return []
      }

      const results = features.map((feature) => ({
        id: feature.id,
        placeName: feature.place_name,
        longitude: feature.center[0],
        latitude: feature.center[1],
      }))

      // Cache the results
      await this.redisCacheService.set(cacheKey, results, this.ADDRESS_SEARCH_CACHE_TTL)

      return results
    } catch (error) {
      this.logger.error(`Error searching address from Mapbox: ${error.message}`)
      throw error
    }
  }

  async searchRoute(params: RouteSearchRequestDto): Promise<RouteSearchResponseDto> {
    try {
      const {
        startLongitude,
        startLatitude,
        endLongitude,
        endLatitude,
        alternatives = true,
        steps = true,
        geometries = 'geojson',
      } = params

      // Create a cache key based on the route parameters
      const cacheKey = this.generateRouteSearchCacheKey({
        start: { latitude: startLatitude, longitude: startLongitude },
        end: { latitude: endLatitude, longitude: endLongitude },
        alternatives,
        steps,
        geometries,
      })

      // Check if we have a cached result
      const cachedRoute = await this.redisCacheService.get<RouteSearchResponseDto>(cacheKey)
      if (cachedRoute) {
        this.logger.debug(
          `Cache hit for route search: ${startLongitude},${startLatitude} to ${endLongitude},${endLatitude}`,
        )
        return cachedRoute
      }

      const coordinates = encodeURIComponent(
        `${startLongitude},${startLatitude};${endLongitude},${endLatitude}`,
      )

      const response = await this.apiClient.get(`/directions/v5/mapbox/driving/${coordinates}`, {
        params: {
          alternatives,
          steps,
          geometries,
          overview: 'full',
          language: 'en',
        },
      })
      const result = response.data
      result.routes = result.routes[0]

      // Cache the result
      await this.redisCacheService.set(cacheKey, result, this.ROUTE_SEARCH_CACHE_TTL)

      return result
    } catch (error) {
      this.logger.error(`Error searching route from Mapbox: ${error.message}`)
      throw error
    }
  }

  /**
   * Utility function to generate a cache key for geocoding requests
   */
  private generateGeocodingCacheKey(coords: Coordinates): string {
    return `geocoding:${coords.latitude}:${coords.longitude}`
  }

  /**
   * Utility function to generate a cache key for address search requests
   */
  private generateAddressSearchCacheKey(query: string, limit: number): string {
    return `address-search:${query}:${limit}`
  }

  /**
   * Utility function to generate a cache key for route search requests
   */
  private generateRouteSearchCacheKey(params: {
    start: Coordinates
    end: Coordinates
    alternatives: boolean
    steps: boolean
    geometries: string
  }): string {
    const { start, end, alternatives, steps, geometries } = params
    return `route-search:${start.longitude}:${start.latitude}:${end.longitude}:${end.latitude}:${alternatives}:${steps}:${geometries}`
  }

  /**
   * Utility function to parse coordinates from a cache key
   */
  private parseCoordinatesFromCacheKey(key: string): Coordinates | null {
    try {
      const parts = key.split(':')
      if (parts.length !== 4) return null

      const latitude = parseFloat(parts[2])
      const longitude = parseFloat(parts[3])

      if (isNaN(latitude) || isNaN(longitude)) return null

      return { latitude, longitude }
    } catch (error) {
      this.logger.error(`Error parsing coordinates from cache key: ${error.message}`)
      return null
    }
  }

  /**
   * Utility function to check if two coordinates are nearby
   */
  private areCoordinatesNearby(coords1: Coordinates, coords2: Coordinates): boolean {
    return (
      Math.abs(coords1.latitude - coords2.latitude) <= this.COORDINATE_THRESHOLD &&
      Math.abs(coords1.longitude - coords2.longitude) <= this.COORDINATE_THRESHOLD
    )
  }
}
