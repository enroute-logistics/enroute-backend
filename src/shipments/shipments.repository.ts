import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Shipment, Prisma, ShipmentStatus, Customer } from '@prisma/client'
import { CreateShipmentDto, UpdateShipmentDto } from '../dtos/shipment.dto'

@Injectable()
export class ShipmentsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: number): Promise<(Shipment & { customer: Customer | null })[]> {
    return this.prisma.shipment.findMany({
      where: { organizationId },
      include: {
        customer: true,
      },
    })
  }

  async findById(
    id: number,
    organizationId: number,
  ): Promise<(Shipment & { customer: Customer | null }) | null> {
    return this.prisma.shipment.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        customer: true,
      },
    })
  }

  async create(
    data: CreateShipmentDto,
    userId: number,
    organizationId: number,
  ): Promise<Shipment & { customer: Customer | null }> {
    const { customerName, customerEmail, customerPhoneNumber, ...rest } = data

    return this.prisma.shipment.create({
      data: {
        name: rest.name,
        description: rest.description,
        originLat: rest.origin.lat,
        originLng: rest.origin.lng,
        originName: rest.origin.name,
        destinationLat: rest.destination.lat,
        destinationLng: rest.destination.lng,
        destinationName: rest.destination.name,
        ...(rest.customerId && { customerId: rest.customerId }),
        ...(rest.vehicleId && { vehicleId: rest.vehicleId }),
        distance: rest.distance,
        status: rest.status || ShipmentStatus.PENDING,
        userId,
        organizationId,
        plannedPickupDate: rest.plannedPickupDate,
        plannedDeliveryDate: rest.plannedDeliveryDate,
        weight: rest.weight,
        isShared: rest.isShared || false,
        price: rest.price,
      },
      include: {
        customer: true,
      },
    })
  }

  async update(
    id: number,
    data: UpdateShipmentDto,
    organizationId: number,
  ): Promise<Shipment & { customer: Customer | null }> {
    const updateData: Prisma.ShipmentUpdateInput = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.origin) {
      updateData.originLat = data.origin.lat
      updateData.originLng = data.origin.lng
      updateData.originName = data.origin.name
    }
    if (data.destination) {
      updateData.destinationLat = data.destination.lat
      updateData.destinationLng = data.destination.lng
      updateData.destinationName = data.destination.name
    }
    if (data.customerId !== undefined) updateData.customer = { connect: { id: data.customerId } }
    if (data.distance !== undefined) updateData.distance = data.distance
    if (data.status !== undefined) updateData.status = data.status
    if (data.vehicleId !== undefined) updateData.vehicle = { connect: { id: data.vehicleId } }
    if (data.plannedPickupDate !== undefined) updateData.plannedPickupDate = data.plannedPickupDate
    if (data.plannedDeliveryDate !== undefined)
      updateData.plannedDeliveryDate = data.plannedDeliveryDate
    if (data.weight !== undefined) updateData.weight = data.weight
    if (data.isShared !== undefined) updateData.isShared = data.isShared
    if (data.price !== undefined) updateData.price = data.price

    return this.prisma.shipment.update({
      where: {
        id,
        organizationId,
      },
      data: updateData,
      include: {
        customer: true,
      },
    })
  }

  async delete(
    id: number,
    organizationId: number,
  ): Promise<Shipment & { customer: Customer | null }> {
    return this.prisma.shipment.delete({
      where: {
        id,
        organizationId,
      },
      include: {
        customer: true,
      },
    })
  }
}
