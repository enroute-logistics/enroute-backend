import { Injectable, NotFoundException } from '@nestjs/common'
import { TraccarApiClientService } from '../common/services/traccar-api-client.service'
import Device from '../interfaces/device.interface'
import Position from '../interfaces/position.interface'
import { MapboxService } from '../common/services/mapbox.service'

const DEFAULT_DAYS_AGO = 1

@Injectable()
export class DevicesService {
  constructor(
    private traccarApiClient: TraccarApiClientService,
    private mapboxService: MapboxService,
  ) {}

  async findAll(): Promise<Device[]> {
    return this.traccarApiClient.getAllDevices()
  }

  async findOne(id: number): Promise<Device> {
    try {
      return await this.traccarApiClient.getDeviceById(id)
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Device with ID ${id} not found`)
      }
      throw error
    }
  }

  async findByUniqueId(uniqueId: string): Promise<Device> {
    try {
      const devices = await this.traccarApiClient.getDeviceByUniqueId(uniqueId)
      if (!devices.length) {
        throw new NotFoundException(`Device with uniqueId ${uniqueId} not found`)
      }
      return devices[0]
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Device with uniqueId ${uniqueId} not found`)
      }
      throw error
    }
  }

  async getPositionsByDeviceId(deviceId: number, limit?: number): Promise<Position[]> {
    try {
      const positions = await this.traccarApiClient.getPositionsByDeviceId(deviceId, limit)
      for (const position of positions) {
        if (!position.address) {
          position.address = await this.mapboxService.getAddressFromCoordinates(
            position.latitude,
            position.longitude,
          )
        }
      }
      return positions
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Positions for device with ID ${deviceId} not found`)
      }
      throw error
    }
  }

  async getPositionsInTimeRange(deviceId: number, from?: string, to?: string): Promise<Position[]> {
    if (!from) {
      from = new Date(Date.now() - 1000 * 60 * 60 * 24 * DEFAULT_DAYS_AGO).toISOString()
    }
    if (!to) {
      to = new Date().toISOString()
    }
    return this.traccarApiClient.getPositionsInTimeRange(deviceId, from, to)
  }
}
