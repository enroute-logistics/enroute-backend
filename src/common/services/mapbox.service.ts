import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

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
      const response = await this.apiClient.get(`/${longitude},${latitude}.json`)
      console.log('response', response.data)
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
}
