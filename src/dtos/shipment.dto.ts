import { ShipmentStatus } from '@prisma/client'
import { IsString, IsEnum, IsInt, IsOptional, IsNotEmpty } from 'class-validator'

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  origin: string

  @IsString()
  @IsNotEmpty()
  destination: string

  @IsInt()
  @IsNotEmpty()
  vehicleId: number

  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus
}

export class UpdateShipmentDto {
  @IsString()
  @IsOptional()
  origin?: string

  @IsString()
  @IsOptional()
  destination?: string

  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus

  @IsInt()
  @IsOptional()
  vehicleId?: number
}

export class ShipmentResponseDto {
  id: number
  origin: string
  destination: string
  status: ShipmentStatus
  userId: number
  vehicleId: number
  organizationId: number
  createdAt: Date
  updatedAt: Date
}
