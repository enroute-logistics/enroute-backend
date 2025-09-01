import { Injectable, NotFoundException } from '@nestjs/common'
import { TraccarApiClientService } from '../common/services/traccar-api-client.service'
import Position from '../interfaces/position.interface'
import { normalizePositionTimestamps } from '../common/utils'

@Injectable()
export class PositionsService {
  constructor(private traccarApiClient: TraccarApiClientService) {}

  async findAll(): Promise<Position[]> {
    const positions = await this.traccarApiClient.getAllPositions()
    return positions.map((position) => normalizePositionTimestamps(position))
  }

  async findOne(id: number): Promise<Position> {
    try {
      const position = await this.traccarApiClient.getPositionById(id)
      return normalizePositionTimestamps(position)
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Position with ID ${id} not found`)
      }
      throw error
    }
  }

  async getPositionsByDeviceId(deviceId: number, limit?: number): Promise<Position[]> {
    const positions = await this.traccarApiClient.getPositionsByDeviceId(deviceId, limit)
    return positions.map((position) => normalizePositionTimestamps(position))
  }

  async getLatestPositionByDeviceId(deviceId: number): Promise<Position> {
    try {
      const positions = await this.traccarApiClient.getPositionsByDeviceId(deviceId, 1)
      if (!positions.length) {
        throw new NotFoundException(`No positions found for device with ID ${deviceId}`)
      }
      return normalizePositionTimestamps(positions[0])
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
      positions.push(normalizePositionTimestamps(position))
    }
    return positions
  }

  async getPositionsInTimeRange(deviceId: number, from: string, to: string): Promise<Position[]> {
    const positions = await this.traccarApiClient.getPositionsInTimeRange(deviceId, from, to)
    return positions.map((position) => normalizePositionTimestamps(position))
  }
}
