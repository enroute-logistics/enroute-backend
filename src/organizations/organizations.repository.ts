import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Organization, Prisma } from '@prisma/client'
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos/organization.dto'

@Injectable()
export class OrganizationsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Organization[]> {
    return this.prisma.organization.findMany()
  }

  async findById(id: number): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
    })
  }

  async findByCode(code: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { code },
    })
  }

  async create(data: CreateOrganizationDto): Promise<Organization> {
    // Create a unique code for the organization based on the name
    const orgCode =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 8) +
      '-' +
      Math.random().toString(36).substring(2, 7)

    return this.prisma.organization.create({
      data: {
        name: data.name,
        code: orgCode,
        description: data.description || '',
      },
    })
  }

  async update(id: number, data: UpdateOrganizationDto): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data,
    })
  }

  async delete(id: number): Promise<Organization> {
    return this.prisma.organization.delete({
      where: { id },
    })
  }
}
