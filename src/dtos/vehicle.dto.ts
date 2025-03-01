import { VehicleStatus } from '@prisma/client'
import { IsString, IsNumber, IsEnum, IsOptional, IsNotEmpty, Min } from 'class-validator'

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  plateNumber: string

  @IsString()
  @IsNotEmpty()
  model: string

  @IsNumber()
  @Min(0)
  capacity: number

  @IsString()
  @IsOptional()
  deviceId?: string

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus
}

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  plateNumber?: string

  @IsString()
  @IsOptional()
  model?: string

  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number

  @IsString()
  @IsOptional()
  deviceId?: string

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus
}

export class VehicleResponseDto {
  id: number
  plateNumber: string
  model: string
  capacity: number
  deviceId: string | null
  status: VehicleStatus
  organizationId: number
  createdAt: Date
  updatedAt: Date
}
