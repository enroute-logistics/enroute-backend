import { Injectable, NotFoundException } from '@nestjs/common'
import { TraccarApiClientService } from '../common/services/traccar-api-client.service'
import Position from '../interfaces/position.interface'

@Injectable()
export class PositionsService {
  constructor(private traccarApiClient: TraccarApiClientService) {}

  async findAll(): Promise<Position[]> {
    return this.traccarApiClient.getAllPositions()
  }

  async findOne(id: number): Promise<Position> {
    try {
      return await this.traccarApiClient.getPositionById(id)
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Position with ID ${id} not found`)
      }
      throw error
    }
  }

  async getPositionsByDeviceId(deviceId: number, limit?: number): Promise<Position[]> {
    return this.traccarApiClient.getPositionsByDeviceId(deviceId, limit)
  }

  async getLatestPositionByDeviceId(deviceId: number): Promise<Position> {
    try {
      const positions = await this.traccarApiClient.getPositionsByDeviceId(deviceId, 1)
      if (!positions.length) {
        throw new NotFoundException(`No positions found for device with ID ${deviceId}`)
      }
      return positions[0]
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`No positions found for device with ID ${deviceId}`)
      }
      throw error
    }
  }

  async getLatestPositionByDeviceIds(deviceIds: number[]): Promise<Position[]> {
    const positions: Position[] = []
    for (const deviceId of deviceIds) {
      const position = await this.getLatestPositionByDeviceId(deviceId)
      positions.push(position)
    }
    return positions
  }

  async getPositionsInTimeRange(deviceId: number, from: string, to: string): Promise<Position[]> {
    return this.traccarApiClient.getPositionsInTimeRange(deviceId, from, to)
  }
}
