import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { PositionsService } from './positions.service'
import Position from '../interfaces/position.interface'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { POSITION_URI } from '../uris/api.uri'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'

@ApiTags('positions')
@Controller(POSITION_URI.BASE)
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'Return all positions' })
  @ApiQuery({ name: 'deviceId', required: false, type: Number })
  async findAll(@Query('deviceId') deviceId?: number): Promise<Position[]> {
    if (deviceId) {
      return this.positionsService.getPositionsByDeviceId(deviceId)
    }
    return this.positionsService.findAll()
  }

  @Get(POSITION_URI.BY_ID)
  @ApiOperation({ summary: 'Get a position by ID' })
  @ApiResponse({ status: 200, description: 'Return the position' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: number): Promise<Position> {
    return this.positionsService.findOne(id)
  }

  @Get(POSITION_URI.LATEST)
  @ApiOperation({ summary: 'Get latest position for a device' })
  @ApiResponse({ status: 200, description: 'Return the latest position' })
  @ApiResponse({ status: 404, description: 'No positions found for device' })
  @ApiParam({ name: 'deviceId', type: 'number' })
  async getLatestPositionByDeviceId(@Param('deviceId') deviceId: number): Promise<Position> {
    return this.positionsService.getLatestPositionByDeviceId(deviceId)
  }

  @Get(POSITION_URI.HISTORY)
  @ApiOperation({ summary: 'Get position history for a device in a time range' })
  @ApiResponse({ status: 200, description: 'Return positions in the time range' })
  @ApiParam({ name: 'deviceId', type: 'number' })
  @ApiQuery({ name: 'from', required: true, type: String })
  @ApiQuery({ name: 'to', required: true, type: String })
  async getPositionsInTimeRange(
    @Param('deviceId') deviceId: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<Position[]> {
    return this.positionsService.getPositionsInTimeRange(deviceId, from, to)
  }
}
