import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Shipment, Prisma, ShipmentStatus } from '@prisma/client'
import { CreateShipmentDto, UpdateShipmentDto } from '../dtos/shipment.dto'

@Injectable()
export class ShipmentsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: number): Promise<Shipment[]> {
    return this.prisma.shipment.findMany({
      where: { organizationId },
    })
  }

  async findById(id: number, organizationId: number): Promise<Shipment | null> {
    return this.prisma.shipment.findFirst({
      where: {
        id,
        organizationId,
      },
    })
  }

  async create(data: CreateShipmentDto, userId: number, organizationId: number): Promise<Shipment> {
    return this.prisma.shipment.create({
      data: {
        origin: data.origin,
        destination: data.destination,
        status: data.status || ShipmentStatus.PENDING,
        vehicleId: data.vehicleId,
        userId,
        organizationId,
      },
    })
  }

  async update(id: number, data: UpdateShipmentDto, organizationId: number): Promise<Shipment> {
    return this.prisma.shipment.update({
      where: {
        id,
        organizationId,
      },
      data,
    })
  }

  async delete(id: number, organizationId: number): Promise<Shipment> {
    return this.prisma.shipment.delete({
      where: {
        id,
        organizationId,
      },
    })
  }
}
