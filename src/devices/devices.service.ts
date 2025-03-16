import { Injectable, NotFoundException } from '@nestjs/common'
import { TraccarApiClientService } from '../common/services/traccar-api-client.service'
import Device from '../interfaces/device.interface'

@Injectable()
export class DevicesService {
  constructor(private traccarApiClient: TraccarApiClientService) {}

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
}
