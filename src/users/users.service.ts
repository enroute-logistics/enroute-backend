import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto'
import { User } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(organizationId: number): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll(organizationId)
    return users.map(this.mapToUserResponse)
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return this.mapToUserResponse(user)
  }

  async create(data: CreateUserDto, organizationId: number): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByEmail(data.email)
    if (existingUser) {
      throw new ConflictException(`User with email ${data.email} already exists`)
    }

    const user = await this.usersRepository.create(data, organizationId)
    return this.mapToUserResponse(user)
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto> {
    await this.findById(id) // Validate user exists

    if (data.email) {
      const existingUser = await this.usersRepository.findByEmail(data.email)
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`User with email ${data.email} already exists`)
      }
    }

    const updatedUser = await this.usersRepository.update(id, data)
    return this.mapToUserResponse(updatedUser)
  }

  async delete(id: number): Promise<UserResponseDto> {
    await this.findById(id) // Validate user exists
    const deletedUser = await this.usersRepository.delete(id)
    return this.mapToUserResponse(deletedUser)
  }

  private mapToUserResponse(user: User): UserResponseDto {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword as UserResponseDto
  }
}
