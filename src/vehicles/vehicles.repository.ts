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
      include: {
        driver: true,
      },
    })
  }

  async findById(id: number, organizationId: number): Promise<Vehicle | null> {
    return this.prisma.vehicle.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        driver: true,
      },
    })
  }

  async findByPlateNumber(plateNumber: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { plateNumber },
      include: {
        driver: true,
      },
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
    const resultVehicle = await this.prisma.vehicle.update({
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

    if (driver) {
      const deiverResult = await this.prisma.driver.create({
        data: {
          name: driver.name,
          organizationId,
        },
      })
      await this.prisma.vehicle.update({
        where: { id },
        data: { driverId: deiverResult.id },
      })
      resultVehicle.driver = deiverResult
    }

    return resultVehicle
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
