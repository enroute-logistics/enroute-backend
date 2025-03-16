import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { TRACCAR_API_URLS } from '../constants/api.urls'
import Device from '../../interfaces/device.interface'
import Position from '../../interfaces/position.interface'

@Injectable()
export class TraccarApiClientService {
  private readonly apiClient: AxiosInstance
  private readonly logger = new Logger(TraccarApiClientService.name)
  constructor(private configService: ConfigService) {
    const baseURL = this.configService.get<string>('TRACCAR_API_URL')
    const username = this.configService.get<string>('TRACCAR_API_USERNAME')
    const password = this.configService.get<string>('TRACCAR_API_PASSWORD')

    this.logger.log(`Initializing Traccar API client with base URL: ${baseURL}`)

    if (!baseURL || !username || !password) {
      this.logger.error('Traccar API configuration is missing')
      throw new Error('Traccar API configuration is missing')
    }

    this.apiClient = axios.create({
      baseURL: baseURL + '/api',
      auth: {
        username,
        password,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        const message = error.response?.data?.message || error.message || 'Traccar API error'

        this.logger.error(`API Error: ${message}`, error.stack)
        throw new HttpException(message, status)
      },
    )

    this.logger.log('Traccar API client initialized successfully')
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    this.logger.log(`GET request to: ${url}`)
    try {
      const response = await this.apiClient.get<T>(url, config)
      this.logger.debug(
        `GET response from ${url}: ${JSON.stringify(response.data).substring(0, 200)}...`,
      )
      return response.data
    } catch (error) {
      this.logger.error(`GET request to ${url} failed: ${error.message}`)
      throw error
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    this.logger.log(`POST request to: ${url}`)
    try {
      const response = await this.apiClient.post<T>(url, data, config)
      this.logger.debug(
        `POST response from ${url}: ${JSON.stringify(response.data).substring(0, 200)}...`,
      )
      return response.data
    } catch (error) {
      this.logger.error(`POST request to ${url} failed: ${error.message}`)
      throw error
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    this.logger.log(`PUT request to: ${url}`)
    try {
      const response = await this.apiClient.put<T>(url, data, config)
      this.logger.debug(
        `PUT response from ${url}: ${JSON.stringify(response.data).substring(0, 200)}...`,
      )
      return response.data
    } catch (error) {
      this.logger.error(`PUT request to ${url} failed: ${error.message}`)
      throw error
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    this.logger.log(`DELETE request to: ${url}`)
    try {
      const response = await this.apiClient.delete<T>(url, config)
      this.logger.debug(
        `DELETE response from ${url}: ${JSON.stringify(response.data).substring(0, 200)}...`,
      )
      return response.data
    } catch (error) {
      this.logger.error(`DELETE request to ${url} failed: ${error.message}`)
      throw error
    }
  }

  // Device-specific API methods
  async getAllDevices(): Promise<Device[]> {
    return await this.get<Device[]>(TRACCAR_API_URLS.DEVICES)
  }

  async getDeviceById(id: number): Promise<Device> {
    return this.get<Device>(TRACCAR_API_URLS.DEVICE_BY_ID(id))
  }

  async getDeviceByUniqueId(uniqueId: string): Promise<Device[]> {
    return this.get<Device[]>(TRACCAR_API_URLS.DEVICES_BY_UNIQUE_ID(uniqueId))
  }

  // Position-specific API methods
  async getAllPositions(): Promise<Position[]> {
    return this.get<Position[]>(TRACCAR_API_URLS.POSITIONS)
  }

  async getPositionById(id: number): Promise<Position> {
    return this.get<Position>(TRACCAR_API_URLS.POSITION_BY_ID(id))
  }

  async getPositionsByDeviceId(deviceId: number, limit?: number): Promise<Position[]> {
    return this.get<Position[]>(TRACCAR_API_URLS.POSITIONS_BY_DEVICE_ID(deviceId, limit))
  }

  async getPositionsInTimeRange(deviceId: number, from: string, to: string): Promise<Position[]> {
    return this.get<Position[]>(TRACCAR_API_URLS.POSITIONS_IN_TIME_RANGE(deviceId, from, to))
  }
}
