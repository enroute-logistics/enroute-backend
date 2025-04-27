import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { DevicesService } from './devices.service'
import { TraccarSocketService } from '../common/services/traccar-socket.service'
import { MapboxService } from '../common/services/mapbox.service'
import { UseGuards } from '@nestjs/common'
import { WsJwtAuthGuard } from '../auth/ws-jwt-auth.guard'
import { NotFoundException } from '@nestjs/common'
import { convertKnotsToKmH } from '../common/utils'
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(','),
    credentials: true,
  },
  path: '/socket.io',
})
@UseGuards(WsJwtAuthGuard)
export class DevicesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private readonly logger = new Logger(DevicesGateway.name)
  private deviceSubscriptions: Map<string, Set<string>> = new Map() // deviceId -> Set of socket IDs
  private subscribedDevices: Set<number> = new Set() // Set of all subscribed device IDs

  constructor(
    private readonly devicesService: DevicesService,
    private readonly traccarSocketService: TraccarSocketService,
    private readonly mapboxService: MapboxService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized')

    // Initialize the Traccar socket connection
    this.traccarSocketService.initialize()

    // Set up message handler for Traccar socket
    this.traccarSocketService.onMessage((message) => {
      this.handleTraccarMessage(message)
    })
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)

    // Clean up subscriptions when a client disconnects
    this.deviceSubscriptions.forEach((socketIds, deviceId) => {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id)

        // If no more clients are subscribed to this device, remove from subscribed devices
        if (socketIds.size === 0) {
          this.deviceSubscriptions.delete(deviceId)
          this.subscribedDevices.delete(parseInt(deviceId))
        }
      }
    })
  }

  @SubscribeMessage('subscribeToDevice')
  async handleSubscribeToDevice(client: Socket, deviceId: number) {
    this.logger.log(`Client ${client.id} subscribing to device ${deviceId}`)

    try {
      // Verify the device exists
      const device = await this.devicesService.findOne(deviceId)
      // Add the client to the device's subscription list
      const deviceIdStr = deviceId.toString()
      if (!this.deviceSubscriptions.has(deviceIdStr)) {
        this.deviceSubscriptions.set(deviceIdStr, new Set())
        this.subscribedDevices.add(deviceId)
      }

      const socketIds = this.deviceSubscriptions.get(deviceIdStr)
      if (socketIds) {
        socketIds.add(client.id)
      }

      // Send confirmation to the client
      client.emit('subscriptionConfirmed', { deviceId })

      // Send the latest position data
      const positions = await this.devicesService.getPositionsByDeviceId(deviceId, 1)

      if (positions.length > 0) {
        client.emit('positionUpdate', positions[0])
      } else {
        this.logger.error(`No position data available for device ${deviceId}`)
      }
    } catch (error) {
      this.logger.error(`Error subscribing to device ${deviceId}: ${error.message}`)
      client.emit('error', { message: `Failed to subscribe to device ${deviceId}` })
    }
  }

  @SubscribeMessage('unsubscribeFromDevice')
  handleUnsubscribeFromDevice(client: Socket, deviceId: number) {
    this.logger.log(`Client ${client.id} unsubscribing from device ${deviceId}`)

    const deviceIdStr = deviceId.toString()
    if (this.deviceSubscriptions.has(deviceIdStr)) {
      const socketIds = this.deviceSubscriptions.get(deviceIdStr)
      if (socketIds) {
        socketIds.delete(client.id)

        // If no more clients are subscribed to this device, remove from subscribed devices
        if (socketIds.size === 0) {
          this.deviceSubscriptions.delete(deviceIdStr)
          this.subscribedDevices.delete(deviceId)
        }
      }

      client.emit('unsubscriptionConfirmed', { deviceId })
    }
  }

  private handleTraccarMessage(messageRaw: any) {
    const message = JSON.parse(messageRaw)
    // Handle positions array from Traccar
    if (message.positions && Array.isArray(message.positions)) {
      // Filter positions for subscribed devices
      const filteredPositions = message.positions.filter((position) =>
        this.subscribedDevices.has(position.deviceId),
      )

      if (filteredPositions.length > 0) {
        this.broadcastPositionUpdates(filteredPositions)
      }
    }

    // Handle devices array from Traccar
    if (message.devices && Array.isArray(message.devices)) {
      // Filter devices for subscribed devices
      const filteredDevices = message.devices.filter((device) =>
        this.subscribedDevices.has(device.id),
      )

      if (filteredDevices.length > 0) {
        this.broadcastDeviceUpdates(filteredDevices)
      }
    }

    // Handle events array from Traccar
    if (message.events && Array.isArray(message.events)) {
      // Filter events for subscribed devices
      const filteredEvents = message.events.filter((event) =>
        this.subscribedDevices.has(event.deviceId),
      )

      if (filteredEvents.length > 0) {
        this.broadcastEventUpdates(filteredEvents)
      }
    }
  }

  private async broadcastPositionUpdates(positions: any[]) {
    for (const position of positions) {
      const deviceId = position.deviceId.toString()
      if (this.deviceSubscriptions.has(deviceId)) {
        const socketIds = this.deviceSubscriptions.get(deviceId)
        if (socketIds) {
          for (const socketId of socketIds) {
            const client = this.server.sockets.sockets.get(socketId)
            if (client) {
              await this.populateAddress(position)
              client.emit('positionUpdate', position)
            }
          }
        }
      }
    }
  }

  private broadcastDeviceUpdates(devices: any[]) {
    devices.forEach((device) => {
      const deviceId = device.id.toString()
      if (this.deviceSubscriptions.has(deviceId)) {
        const socketIds = this.deviceSubscriptions.get(deviceId)
        if (socketIds) {
          socketIds.forEach((socketId) => {
            const client = this.server.sockets.sockets.get(socketId)
            if (client) {
              client.emit('deviceUpdate', device)
            }
          })
        }
      }
    })
  }

  private broadcastEventUpdates(events: any[]) {
    events.forEach((event) => {
      const deviceId = event.deviceId.toString()
      if (this.deviceSubscriptions.has(deviceId)) {
        const socketIds = this.deviceSubscriptions.get(deviceId)
        if (socketIds) {
          socketIds.forEach((socketId) => {
            const client = this.server.sockets.sockets.get(socketId)
            if (client) {
              client.emit('eventUpdate', event)
            }
          })
        }
      }
    })
  }

  private async populateAddress(position: any) {
    // Get address from Mapbox if not already present
    if (!position.address && position.latitude && position.longitude) {
      try {
        const result = await this.mapboxService.getAddressFromCoordinates(
          position.latitude,
          position.longitude,
        )
        position.address = result
      } catch (error) {
        if (error instanceof NotFoundException) {
          // Set address as undefined when no address is found
          position.address = undefined
          this.logger.debug(
            `No address found for position at lat: ${position.latitude}, lon: ${position.longitude}`,
          )
        } else {
          this.logger.error(`Error getting address for position: ${error.message}`)
        }
      }
    }
    if (position.speed) {
      // Convert speed from knots to km/h
      position.speed = convertKnotsToKmH(position.speed)
    }
  }
}
