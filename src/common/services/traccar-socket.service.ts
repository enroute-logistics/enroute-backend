import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as WebSocket from 'ws'
import axios from 'axios'

@Injectable()
export class TraccarSocketService implements OnModuleDestroy {
  private readonly logger = new Logger(TraccarSocketService.name)
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000 // 5 seconds
  private messageCallback: ((data: any) => void) | null = null

  constructor(private configService: ConfigService) {}

  async initialize() {
    if (this.ws) {
      this.logger.warn('WebSocket connection already initialized')
      return
    }

    await this.connect()
  }

  private async initializeSession() {
    const baseUrl = this.configService.get<string>('TRACCAR_API_URL')
    const username = this.configService.get<string>('TRACCAR_API_USERNAME')
    const password = this.configService.get<string>('TRACCAR_API_PASSWORD')

    if (!baseUrl || !username || !password) {
      this.logger.error('Traccar configuration is missing')
      return
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/session`,
        {
          email: username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      )

      const cookies = response.headers['set-cookie']
      const sessionCookie = cookies?.find((cookie) => cookie.startsWith('JSESSIONID'))

      if (!sessionCookie) {
        throw new Error('Session cookie not found')
      }

      return sessionCookie.split(';')[0]
    } catch (error) {
      this.logger.error('Error establishing session:', error.message)
      throw error
    }
  }

  private async connect() {
    const sessionCookie = await this.initializeSession()
    if (!sessionCookie) {
      this.logger.error('Failed to get session cookie')
      return
    }
    const baseUrl = this.configService.get<string>('TRACCAR_API_URL')

    if (!baseUrl) {
      this.logger.error('Traccar API URL is missing')
      return
    }

    // Convert HTTP URL to WebSocket URL
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/api/socket'
    this.logger.debug(`WebSocket URL: ${wsUrl}`)

    try {
      this.ws = new WebSocket(wsUrl, {
        headers: {
          Cookie: sessionCookie,
        },
      })

      this.ws.on('open', () => {
        this.logger.log('Connected to Traccar WebSocket server')
        this.reconnectAttempts = 0
      })

      this.ws.on('message', (data: WebSocket.Data) => {
        if (this.messageCallback) {
          this.logger.log(`Received message: ${data}`)
          this.messageCallback(data)
        }
      })

      this.ws.on('error', (error) => {
        this.logger.error(`WebSocket error: ${error.message}`)
        this.scheduleReconnect()
      })

      this.ws.on('close', (code, reason) => {
        this.logger.log(`WebSocket connection closed with code ${code} and reason: ${reason}`)
        this.scheduleReconnect()
      })
    } catch (error) {
      this.logger.error(`Failed to connect to Traccar WebSocket server: ${error.message}`)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached. Giving up.')
      return
    }

    this.reconnectAttempts++
    this.logger.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${this.reconnectInterval}ms`,
    )

    setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)
  }

  onMessage(callback: (data: any) => void) {
    this.messageCallback = callback
  }

  onModuleDestroy() {
    this.logger.log('Closing Traccar WebSocket connection')
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
