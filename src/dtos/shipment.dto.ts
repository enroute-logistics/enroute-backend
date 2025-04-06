import { ShipmentStatus } from '@prisma/client'
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
  IsObject,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

class LocationDto {
  @IsNumber()
  @IsOptional()
  lat?: number

  @IsNumber()
  @IsOptional()
  lng?: number

  @IsString()
  @IsNotEmpty()
  name: string
}

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  origin: LocationDto

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  destination: LocationDto

  @IsInt()
  @IsOptional()
  customerId?: number

  // Create a new customer if customer details are provided
  @IsString()
  @IsOptional()
  customerName?: string

  @IsString()
  @IsOptional()
  customerEmail?: string

  @IsString()
  @IsOptional()
  customerPhoneNumber?: string

  @IsNumber()
  @IsOptional()
  distance?: number

  @IsInt()
  @IsOptional()
  vehicleId?: number

  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedPickupDate?: Date

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedDeliveryDate?: Date

  @IsNumber()
  @IsOptional()
  weight?: number

  @IsBoolean()
  @IsOptional()
  isShared?: boolean

  @IsNumber()
  @IsOptional()
  price?: number
}

export class UpdateShipmentDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  origin?: LocationDto

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  destination?: LocationDto

  @IsInt()
  @IsOptional()
  customerId?: number

  // Create a new customer if customer details are provided
  @IsString()
  @IsOptional()
  customerName?: string

  @IsString()
  @IsOptional()
  customerEmail?: string

  @IsString()
  @IsOptional()
  customerPhoneNumber?: string

  @IsNumber()
  @IsOptional()
  distance?: number

  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus

  @IsInt()
  @IsOptional()
  vehicleId?: number

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedPickupDate?: Date

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  plannedDeliveryDate?: Date

  @IsNumber()
  @IsOptional()
  weight?: number

  @IsBoolean()
  @IsOptional()
  isShared?: boolean

  @IsNumber()
  @IsOptional()
  price?: number
}

export class ShipmentResponseDto {
  id: number
  name: string
  description: string | null
  origin: {
    lat: number | null
    lng: number | null
    name: string
  }
  destination: {
    lat: number | null
    lng: number | null
    name: string
  }
  customer: {
    id: number
    name: string
    email?: string
    phoneNumber?: string
    address?: string
  } | null
  distance: number | null
  status: ShipmentStatus
  userId: number
  vehicleId: number | null
  organizationId: number
  createdAt: Date
  updatedAt: Date
  plannedPickupDate: Date | null
  plannedDeliveryDate: Date | null
  weight: number | null
  isShared: boolean
  price: number | null
}
