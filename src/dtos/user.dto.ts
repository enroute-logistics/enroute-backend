import { UserRole } from '@prisma/client'

export class CreateUserDto {
  email: string
  password: string
  name: string
  role?: UserRole
  phoneNumber?: string
}

export class UpdateUserDto {
  email?: string
  name?: string
  role?: UserRole
  phoneNumber?: string
}

export class UserResponseDto {
  id: number
  email: string
  name: string
  role: UserRole
  organizationId: number
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
}
