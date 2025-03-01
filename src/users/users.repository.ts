import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { User, Prisma, UserRole } from '@prisma/client'
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: number): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { organizationId },
    })
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async create(data: CreateUserDto, organizationId: number): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role || UserRole.USER,
        organizationId,
      },
    })
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    })
  }
}
