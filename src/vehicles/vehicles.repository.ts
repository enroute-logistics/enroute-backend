import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Vehicle, Prisma, VehicleStatus, Driver } from '@prisma/client'
import { CreateVehicleDto, UpdateVehicleDto, VehicleResponseDto } from '../dtos/vehicle.dto'
import * as moment from 'moment'

@Injectable()
export class VehiclesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: number): Promise<VehicleResponseDto[]> {
    return this.prisma.vehicle.findMany({
      where: { organizationId },
      include: { driver: true },
    })
  }

  async findById(id: number, organizationId: number): Promise<VehicleResponseDto | null> {
    return this.prisma.vehicle.findFirst({
      where: { id, organizationId },
      include: { driver: true },
    })
  }

  async findByPlateNumber(plateNumber: string): Promise<VehicleResponseDto | null> {
    return this.prisma.vehicle.findUnique({
      where: { plateNumber },
      include: { driver: true },
    })
  }

  async create(data: CreateVehicleDto, organizationId: number): Promise<VehicleResponseDto> {
    const { driver, driverId, ...vehicleData } = data

    if (!driver && !driverId) {
      throw new Error('Either driver or driverId must be provided')
    }

    let finalDriverId: number
    if (driverId) {
      finalDriverId = driverId
    } else {
      const driverResult = await this.prisma.driver.create({
        data: {
          name: driver.name,
          organizationId,
        },
      })
      finalDriverId = driverResult.id
    }

    return this.prisma.vehicle.create({
      data: {
        ...vehicleData,
        maintenanceDate: vehicleData.maintenanceDate
          ? moment(vehicleData.maintenanceDate).toDate()
          : null,
        organizationId,
        driverId: finalDriverId,
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
    const { driver, driverId, ...vehicleData } = data

    let finalDriverId = driverId

    if (driver) {
      const driverResult = await this.prisma.driver.create({
        data: {
          name: driver.name,
          organizationId,
        },
      })
      finalDriverId = driverResult.id
    }

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
        ...(finalDriverId !== undefined && { driverId: finalDriverId }),
      },
      include: {
        driver: true,
      },
    })
  }

  async delete(id: number, organizationId: number): Promise<VehicleResponseDto> {
    return this.prisma.vehicle.delete({
      where: { id, organizationId },
      include: { driver: true },
    })
  }
}
