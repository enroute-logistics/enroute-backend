import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { OrganizationsRepository } from './organizations.repository'
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
} from '../dtos/organization.dto'

@Injectable()
export class OrganizationsService {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async findAll(): Promise<OrganizationResponseDto[]> {
    return this.organizationsRepository.findAll()
  }

  async findById(id: number): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsRepository.findById(id)
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`)
    }
    return organization
  }

  async create(data: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    return this.organizationsRepository.create(data)
  }

  async update(id: number, data: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    await this.findById(id) // Validate organization exists
    return this.organizationsRepository.update(id, data)
  }

  async delete(id: number): Promise<OrganizationResponseDto> {
    await this.findById(id) // Validate organization exists
    return this.organizationsRepository.delete(id)
  }
}
