import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ShipmentsService } from './shipments.service'
import { CreateShipmentDto, UpdateShipmentDto, ShipmentResponseDto } from '../dtos/shipment.dto'
import { SHIPMENT_URI } from '../uris/api.uri'

@Controller(SHIPMENT_URI.BASE)
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllShipments(@Request() req): Promise<ShipmentResponseDto[]> {
    return this.shipmentsService.findAll(req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createShipment(
    @Request() req,
    @Body() createShipmentDto: CreateShipmentDto,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentsService.create(createShipmentDto, req.user.userId, req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(SHIPMENT_URI.BY_ID)
  async getShipment(@Request() req, @Param('id') id: string): Promise<ShipmentResponseDto> {
    return this.shipmentsService.findById(parseInt(id), req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Put(SHIPMENT_URI.BY_ID)
  async updateShipment(
    @Request() req,
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentsService.update(parseInt(id), updateShipmentDto, req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(SHIPMENT_URI.BY_ID)
  async deleteShipment(@Request() req, @Param('id') id: string): Promise<ShipmentResponseDto> {
    return this.shipmentsService.delete(parseInt(id), req.user.organizationId)
  }
}
