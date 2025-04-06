import { IsString, IsInt, IsOptional, IsNotEmpty, IsEmail } from 'class-validator'

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phoneNumber?: string

  @IsString()
  @IsOptional()
  address?: string
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phoneNumber?: string

  @IsString()
  @IsOptional()
  address?: string
}

export class CustomerResponseDto {
  id: number
  name: string
  email: string | null
  phoneNumber: string | null
  address: string | null
  organizationId: number
  createdAt: Date
  updatedAt: Date
}
