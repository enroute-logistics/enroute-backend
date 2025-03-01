import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Vehicle, Prisma, VehicleStatus } from '@prisma/client'
import { CreateVehicleDto, UpdateVehicleDto } from '../dtos/vehicle.dto'

@Injectable()
export class VehiclesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: number): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: { organizationId },
    })
  }

  async findById(id: number, organizationId: number): Promise<Vehicle | null> {
    return this.prisma.vehicle.findFirst({
      where: {
        id,
        organizationId,
      },
    })
  }

  async findByPlateNumber(plateNumber: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { plateNumber },
    })
  }

  async create(data: CreateVehicleDto, organizationId: number): Promise<Vehicle> {
    return this.prisma.vehicle.create({
      data: {
        plateNumber: data.plateNumber,
        model: data.model,
        capacity: data.capacity,
        deviceId: data.deviceId,
        status: data.status || VehicleStatus.ACTIVE,
        organizationId,
      },
    })
  }

  async update(id: number, data: UpdateVehicleDto, organizationId: number): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: {
        id,
        organizationId,
      },
      data,
    })
  }

  async delete(id: number, organizationId: number): Promise<Vehicle> {
    return this.prisma.vehicle.delete({
      where: {
        id,
        organizationId,
      },
    })
  }
}
