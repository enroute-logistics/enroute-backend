import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Vehicle, Prisma, VehicleStatus } from '@prisma/client'
import { CreateVehicleDto, UpdateVehicleDto, VehicleResponseDto } from '../dtos/vehicle.dto'
import * as moment from 'moment'

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

  async create(data: CreateVehicleDto, organizationId: number): Promise<VehicleResponseDto> {
    const { driver, ...vehicleData } = data
    return this.prisma.vehicle.create({
      data: {
        ...vehicleData,
        maintenanceDate: vehicleData.maintenanceDate
          ? moment(vehicleData.maintenanceDate).toDate()
          : null,
        organizationId,
      },
      include: {
        driver: true,
      },
    })
  }

  async update(
    id: number,
    data: UpdateVehicleDto,
    organizationId: number,
  ): Promise<VehicleResponseDto> {
    const { driver, ...vehicleData } = data
    return this.prisma.vehicle.update({
      where: {
        id,
        organizationId,
      },
      data: {
        ...vehicleData,
        maintenanceDate: vehicleData.maintenanceDate
          ? moment(vehicleData.maintenanceDate).toDate()
          : undefined,
      },
      include: {
        driver: true,
      },
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
