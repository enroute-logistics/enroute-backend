import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { VehiclesRepository } from './vehicles.repository'
import { CreateVehicleDto, UpdateVehicleDto, VehicleResponseDto } from '../dtos/vehicle.dto'
import { ShipmentsService } from '../shipments/shipments.service'
import { PositionsService } from '../positions/positions.service'
import { VehicleStatus } from '@prisma/client'
@Injectable()
export class VehiclesService {
  constructor(
    private vehiclesRepository: VehiclesRepository,
    private shipmentsService: ShipmentsService,
    private positionsService: PositionsService,
  ) {}

  async findAll(organizationId: number): Promise<VehicleResponseDto[]> {
    const allVehicles = await this.vehiclesRepository.findAll(organizationId)
    const deviceIds = allVehicles
      .map((vehicle) => Number(vehicle.deviceId))
      .filter((id): id is number => !!id)

    const [positions, shipments] = await Promise.all([
      this.positionsService.getLatestPositionByDeviceIds(deviceIds),
      this.shipmentsService.findAll(organizationId),
    ])

    const updates = allVehicles.map(async (vehicle) => {
      const vehicleShipments = shipments.filter((shipment) => shipment.vehicleId === vehicle.id)
      const vehiclePosition = positions.find(
        (position) => String(position.deviceId) === vehicle.deviceId,
      )

      const newStatus = this.determineVehicleStatus(vehicleShipments.length, vehiclePosition?.speed)

      if (newStatus) {
        await this.vehiclesRepository.update(vehicle.id, { status: newStatus }, organizationId)
        return true
      }
      return false
    })

    const hasUpdates = (await Promise.all(updates)).some(Boolean)
    return hasUpdates ? this.vehiclesRepository.findAll(organizationId) : allVehicles
  }

  private determineVehicleStatus(shipmentCount: number, speed?: number): VehicleStatus | undefined {
    if (shipmentCount > 0) {
      if (speed && speed > 0) return 'ACTIVE'
      if (speed === 0) return 'STOPPED'
    } else {
      if (speed && speed > 0) return 'UNASSIGNED'
      if (speed === 0) return 'INACTIVE'
    }
    return undefined
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
