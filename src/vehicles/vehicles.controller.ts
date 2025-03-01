import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { VehiclesService } from './vehicles.service'
import { CreateVehicleDto, UpdateVehicleDto, VehicleResponseDto } from '../dtos/vehicle.dto'
import { VEHICLE_URI } from '../uris/api.uri'

@Controller(VEHICLE_URI.BASE)
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllVehicles(@Request() req): Promise<VehicleResponseDto[]> {
    return this.vehiclesService.findAll(req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createVehicle(
    @Request() req,
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.vehiclesService.create(createVehicleDto, req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(VEHICLE_URI.BY_ID)
  async getVehicle(@Request() req, @Param('id') id: string): Promise<VehicleResponseDto> {
    return this.vehiclesService.findById(parseInt(id), req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Put(VEHICLE_URI.BY_ID)
  async updateVehicle(
    @Request() req,
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.vehiclesService.update(parseInt(id), updateVehicleDto, req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(VEHICLE_URI.BY_ID)
  async deleteVehicle(@Request() req, @Param('id') id: string): Promise<VehicleResponseDto> {
    return this.vehiclesService.delete(parseInt(id), req.user.organizationId)
  }
}
