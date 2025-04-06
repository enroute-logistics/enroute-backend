import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Customer } from '@prisma/client'
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/customer.dto'

@Injectable()
export class CustomersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: number): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      where: { organizationId },
    })
  }

  async findById(id: number, organizationId: number): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: {
        id,
        organizationId,
      },
    })
  }

  async create(data: CreateCustomerDto, organizationId: number): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        organizationId,
      },
    })
  }

  async update(id: number, data: UpdateCustomerDto, organizationId: number): Promise<Customer> {
    return this.prisma.customer.update({
      where: {
        id,
        organizationId,
      },
      data,
    })
  }

  async delete(id: number, organizationId: number): Promise<Customer> {
    return this.prisma.customer.delete({
      where: {
        id,
        organizationId,
      },
    })
  }
}
