import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { AddressSearchResponseDto } from 'src/dtos/address.dto'
import { RouteSearchRequestDto, RouteSearchResponseDto } from 'src/dtos/route.dto'

@Injectable()
export class MapboxService {
  private readonly logger = new Logger(MapboxService.name)
  private readonly apiClient
  private readonly accessToken: string

  constructor(private configService: ConfigService) {
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
      const response = await this.apiClient.get(
        `/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
      )
      const features = response.data.features

      if (features && features.length > 0) {
        // Return the most relevant result (usually the first one)
        return features[0].place_name
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

  async searchAddress(query: string, limit: number = 5): Promise<AddressSearchResponseDto[]> {
    try {
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

      return features.map((feature) => ({
        id: feature.id,
        placeName: feature.place_name,
        longitude: feature.center[0],
        latitude: feature.center[1],
      }))
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
      return result
    } catch (error) {
      this.logger.error(`Error searching route from Mapbox: ${error.message}`)
      throw error
    }
  }
}
