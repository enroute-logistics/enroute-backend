import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDriverDto, UpdateDriverDto, DriverResponseDto } from '../dtos/driver.dto'

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: number): Promise<DriverResponseDto[]> {
    return this.prisma.driver.findMany({
      where: { organizationId },
    })
  }

  async create(
    createDriverDto: CreateDriverDto,
    organizationId: number,
  ): Promise<DriverResponseDto> {
    return this.prisma.driver.create({
      data: {
        ...createDriverDto,
        organizationId,
      },
    })
  }

  async findById(id: number, organizationId: number): Promise<DriverResponseDto> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
    })
    if (!driver) throw new NotFoundException(`Driver with ID ${id} not found`)
    return driver
  }

  async update(
    id: number,
    updateDriverDto: UpdateDriverDto,
    organizationId: number,
  ): Promise<DriverResponseDto> {
    await this.findById(id, organizationId)
    return this.prisma.driver.update({
      where: { id },
      data: updateDriverDto,
    })
  }

  async delete(id: number, organizationId: number): Promise<DriverResponseDto> {
    await this.findById(id, organizationId)
    return this.prisma.driver.delete({
      where: { id },
    })
  }
}
