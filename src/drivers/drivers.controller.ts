import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { DriversService } from './drivers.service'
import { CreateDriverDto, UpdateDriverDto, DriverResponseDto } from '../dtos/driver.dto'
import { DRIVER_URI } from '../uris/api.uri'

@Controller(DRIVER_URI.BASE)
export class DriversController {
  constructor(private driversService: DriversService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllDrivers(@Request() req): Promise<DriverResponseDto[]> {
    return this.driversService.findAll(req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createDriver(
    @Request() req,
    @Body() createDriverDto: CreateDriverDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.create(createDriverDto, req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(DRIVER_URI.BY_ID)
  async getDriver(@Request() req, @Param('id') id: string): Promise<DriverResponseDto> {
    return this.driversService.findById(parseInt(id), req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Put(DRIVER_URI.BY_ID)
  async updateDriver(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.update(parseInt(id), updateDriverDto, req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(DRIVER_URI.BY_ID)
  async deleteDriver(@Request() req, @Param('id') id: string): Promise<DriverResponseDto> {
    return this.driversService.delete(parseInt(id), req.user.organizationId)
  }
}
