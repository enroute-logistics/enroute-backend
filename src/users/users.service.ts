import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto'
import { User } from '@prisma/client'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(private usersRepository: UsersRepository) {}

  async findAll(organizationId: number): Promise<UserResponseDto[]> {
    this.logger.log(`Finding all users for organization ID: ${organizationId}`)
    const users = await this.usersRepository.findAll(organizationId)
    this.logger.debug(`Found ${users.length} users for organization ID: ${organizationId}`)
    return users.map(this.mapToUserResponse)
  }

  async findById(id: number): Promise<UserResponseDto> {
    this.logger.log(`Finding user with ID: ${id}`)
    const user = await this.usersRepository.findById(id)
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`)
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    this.logger.debug(`Found user: ${user.email}`)
    return this.mapToUserResponse(user)
  }

  async create(data: CreateUserDto, organizationId: number): Promise<UserResponseDto> {
    this.logger.log(
      `Creating new user with email: ${data.email} for organization ID: ${organizationId}`,
    )

    const existingUser = await this.usersRepository.findByEmail(data.email)
    if (existingUser) {
      this.logger.warn(`User with email ${data.email} already exists`)
      throw new ConflictException(`User with email ${data.email} already exists`)
    }

    const user = await this.usersRepository.create(data, organizationId)
    this.logger.log(`User created successfully with ID: ${user.id}`)
    return this.mapToUserResponse(user)
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Updating user with ID: ${id}`)
    await this.findById(id) // Validate user exists

    if (data.email) {
      this.logger.debug(`Checking if email ${data.email} is already in use`)
      const existingUser = await this.usersRepository.findByEmail(data.email)
      if (existingUser && existingUser.id !== id) {
        this.logger.warn(`User with email ${data.email} already exists`)
        throw new ConflictException(`User with email ${data.email} already exists`)
      }
    }

    const updatedUser = await this.usersRepository.update(id, data)
    this.logger.log(`User with ID: ${id} updated successfully`)
    return this.mapToUserResponse(updatedUser)
  }

  async delete(id: number): Promise<UserResponseDto> {
    this.logger.log(`Deleting user with ID: ${id}`)
    await this.findById(id) // Validate user exists
    const deletedUser = await this.usersRepository.delete(id)
    this.logger.log(`User with ID: ${id} deleted successfully`)
    return this.mapToUserResponse(deletedUser)
  }

  private mapToUserResponse(user: User): UserResponseDto {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword as UserResponseDto
  }
}
