import { Injectable, NotFoundException } from '@nestjs/common'
import { ShipmentsRepository } from './shipments.repository'
import { CreateShipmentDto, UpdateShipmentDto, ShipmentResponseDto } from '../dtos/shipment.dto'
import { Shipment, Customer } from '@prisma/client'
import { CustomersService } from '../customers/customers.service'

@Injectable()
export class ShipmentsService {
  constructor(
    private shipmentsRepository: ShipmentsRepository,
    private customersService: CustomersService,
  ) {}

  private toResponseDto(shipment: Shipment & { customer: Customer | null }): ShipmentResponseDto {
    const {
      originLat,
      originLng,
      originName,
      destinationLat,
      destinationLng,
      destinationName,
      customer,
      ...rest
    } = shipment
    return {
      origin: {
        lat: originLat,
        lng: originLng,
        name: originName,
      },
      destination: {
        lat: destinationLat,
        lng: destinationLng,
        name: destinationName,
      },
      customer: customer
        ? {
            id: customer.id,
            name: customer.name,
            email: customer.email ?? undefined,
            phoneNumber: customer.phoneNumber ?? undefined,
            address: customer.address ?? undefined,
          }
        : null,
      ...rest,
    }
  }

  async findAll(organizationId: number): Promise<ShipmentResponseDto[]> {
    const shipments = await this.shipmentsRepository.findAll(organizationId)
    return shipments.map((shipment) => this.toResponseDto(shipment))
  }

  async findById(id: number, organizationId: number): Promise<ShipmentResponseDto> {
    const shipment = await this.shipmentsRepository.findById(id, organizationId)
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`)
    }
    return this.toResponseDto(shipment)
  }

  async findByVehicleId(vehicleId: number, organizationId: number): Promise<ShipmentResponseDto[]> {
    const shipments = await this.shipmentsRepository.findByVehicleId(vehicleId, organizationId)
    return shipments.map((shipment) => this.toResponseDto(shipment))
  }

  async create(
    data: CreateShipmentDto,
    userId: number,
    organizationId: number,
  ): Promise<ShipmentResponseDto> {
    const { customerName, customerEmail, customerPhoneNumber, customerId, ...rest } = data
    let customerIdToUse = customerId

    if (!customerId && customerName && customerEmail && customerPhoneNumber) {
      const customer = await this.customersService.create(
        {
          name: customerName,
          email: customerEmail,
          phoneNumber: customerPhoneNumber,
        },
        organizationId,
      )
      customerIdToUse = customer.id
    }

    const shipment = await this.shipmentsRepository.create(
      { ...rest, customerId: customerIdToUse },
      userId,
      organizationId,
    )
    return this.toResponseDto(shipment)
  }

  async update(
    id: number,
    data: UpdateShipmentDto,
    organizationId: number,
  ): Promise<ShipmentResponseDto> {
    const currentShipment = await this.findById(id, organizationId) // Validate shipment exists

    const { customerName, customerEmail, customerPhoneNumber, customerId, vehicleId, ...rest } =
      data
    let customerIdToUse = customerId
    let vehicleIdToUse = currentShipment.vehicleId
    if (!vehicleId) {
      vehicleIdToUse = null
    } else {
      vehicleIdToUse = vehicleId
    }

    if (!customerId && customerName && customerEmail && customerPhoneNumber) {
      const customer = await this.customersService.create(
        {
          name: customerName,
          email: customerEmail,
          phoneNumber: customerPhoneNumber,
        },
        organizationId,
      )
      customerIdToUse = customer.id
    }

    const shipment = await this.shipmentsRepository.update(
      id,
      { ...rest, customerId: customerIdToUse, vehicleId: vehicleIdToUse ?? undefined },
      organizationId,
    )
    return this.toResponseDto(shipment)
  }

  async delete(id: number, organizationId: number): Promise<ShipmentResponseDto> {
    await this.findById(id, organizationId) // Validate shipment exists
    const shipment = await this.shipmentsRepository.delete(id, organizationId)
    return this.toResponseDto(shipment)
  }
}
