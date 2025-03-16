import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common'
import { DevicesService } from './devices.service'
import Device from '../interfaces/device.interface'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { DEVICE_URI } from '../uris/api.uri'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'

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

  @Get(DEVICE_URI.BY_ID)
  @ApiOperation({ summary: 'Get a device by ID' })
  @ApiResponse({ status: 200, description: 'Return the device' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: number): Promise<Device> {
    return this.devicesService.findOne(id)
  }
}
