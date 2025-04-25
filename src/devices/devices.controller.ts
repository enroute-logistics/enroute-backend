import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common'
import { DevicesService } from './devices.service'
import Device from '../interfaces/device.interface'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { DEVICE_URI } from '../uris/api.uri'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'
import Position from '../interfaces/position.interface'

@ApiTags('devices')
@Controller(DEVICE_URI.BASE)
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({ status: 200, description: 'Return all devices' })
  @ApiQuery({ name: 'uniqueId', required: false, type: String })
  async findAll(@Query('uniqueId') uniqueId?: string): Promise<Device[]> {
    if (uniqueId) {
      return [await this.devicesService.findByUniqueId(uniqueId)]
    }
    return this.devicesService.findAll()
  }

  // Get positions by device ID
  @Get(DEVICE_URI.POSITIONS)
  @ApiOperation({ summary: 'Get positions by device ID' })
  @ApiResponse({ status: 200, description: 'Return the positions' })
  @ApiParam({ name: 'id', type: 'number' })
  async getPositionsByDeviceId(@Param('id') id: number): Promise<Position[]> {
    return this.devicesService.getPositionsByDeviceId(id)
  }

  // Get past positions by device ID
  @Get(DEVICE_URI.PAST_POSITIONS)
  @ApiOperation({ summary: 'Get past positions by device ID' })
  @ApiResponse({ status: 200, description: 'Return the past positions' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Start date in ISO format',
  })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date in ISO format' })
  async getPastPositionsByDeviceId(
    @Param('id') id: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<Position[]> {
    return this.devicesService.getPositionsInTimeRange(id, from, to)
  }

  @Get(DEVICE_URI.BY_ID)
  @ApiOperation({ summary: 'Get a device by ID' })
  @ApiResponse({ status: 200, description: 'Return the device' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: number): Promise<Device> {
    return this.devicesService.findOne(id)
  }
}
