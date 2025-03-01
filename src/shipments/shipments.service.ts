import { Injectable, NotFoundException } from '@nestjs/common'
import { ShipmentsRepository } from './shipments.repository'
import { CreateShipmentDto, UpdateShipmentDto, ShipmentResponseDto } from '../dtos/shipment.dto'

@Injectable()
export class ShipmentsService {
  constructor(private shipmentsRepository: ShipmentsRepository) {}

  async findAll(organizationId: number): Promise<ShipmentResponseDto[]> {
    return this.shipmentsRepository.findAll(organizationId)
  }

  async findById(id: number, organizationId: number): Promise<ShipmentResponseDto> {
    const shipment = await this.shipmentsRepository.findById(id, organizationId)
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`)
    }
    return shipment
  }

  async create(
    data: CreateShipmentDto,
    userId: number,
    organizationId: number,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentsRepository.create(data, userId, organizationId)
  }

  async update(
    id: number,
    data: UpdateShipmentDto,
    organizationId: number,
  ): Promise<ShipmentResponseDto> {
    await this.findById(id, organizationId) // Validate shipment exists
    return this.shipmentsRepository.update(id, data, organizationId)
  }

  async delete(id: number, organizationId: number): Promise<ShipmentResponseDto> {
    await this.findById(id, organizationId) // Validate shipment exists
    return this.shipmentsRepository.delete(id, organizationId)
  }
}
