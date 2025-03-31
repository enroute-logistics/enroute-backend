import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { VehiclesRepository } from './vehicles.repository'
import { CreateVehicleDto, UpdateVehicleDto, VehicleResponseDto } from '../dtos/vehicle.dto'
import { DriversService } from '../drivers/drivers.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class VehiclesService {
  constructor(
    private vehiclesRepository: VehiclesRepository,
    private driversService: DriversService,
    private prisma: PrismaService,
  ) {}

  async findAll(organizationId: number): Promise<VehicleResponseDto[]> {
    return this.vehiclesRepository.findAll(organizationId)
  }

  async findById(id: number, organizationId: number): Promise<VehicleResponseDto> {
    const vehicle = await this.vehiclesRepository.findById(id, organizationId)
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`)
    }
    return vehicle
  }

  async create(
    createVehicleDto: CreateVehicleDto,
    organizationId: number,
  ): Promise<VehicleResponseDto> {
    const { driver, ...vehicleData } = createVehicleDto

    return this.vehiclesRepository.create(createVehicleDto, organizationId)
  }

  async update(
    id: number,
    data: UpdateVehicleDto,
    organizationId: number,
  ): Promise<VehicleResponseDto> {
    await this.findById(id, organizationId) // Validate vehicle exists

    if (data.plateNumber) {
      const existingVehicle = await this.vehiclesRepository.findByPlateNumber(data.plateNumber)
      if (existingVehicle && existingVehicle.id !== id) {
        throw new ConflictException(`Vehicle with plate number ${data.plateNumber} already exists`)
      }
    }

    return this.vehiclesRepository.update(id, data, organizationId)
  }

  async delete(id: number, organizationId: number): Promise<VehicleResponseDto> {
    await this.findById(id, organizationId) // Validate vehicle exists
    return this.vehiclesRepository.delete(id, organizationId)
  }
}
