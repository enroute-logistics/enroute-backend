import { Injectable, NotFoundException } from '@nestjs/common'
import { CustomersRepository } from './customers.repository'
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto } from '../dtos/customer.dto'

@Injectable()
export class CustomersService {
  constructor(private customersRepository: CustomersRepository) {}

  async findAll(organizationId: number): Promise<CustomerResponseDto[]> {
    return this.customersRepository.findAll(organizationId)
  }

  async findById(id: number, organizationId: number): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findById(id, organizationId)
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`)
    }
    return customer
  }

  async create(data: CreateCustomerDto, organizationId: number): Promise<CustomerResponseDto> {
    return this.customersRepository.create(data, organizationId)
  }

  async update(
    id: number,
    data: UpdateCustomerDto,
    organizationId: number,
  ): Promise<CustomerResponseDto> {
    await this.findById(id, organizationId) // Validate customer exists
    return this.customersRepository.update(id, data, organizationId)
  }

  async delete(id: number, organizationId: number): Promise<CustomerResponseDto> {
    await this.findById(id, organizationId) // Validate customer exists
    return this.customersRepository.delete(id, organizationId)
  }
}
