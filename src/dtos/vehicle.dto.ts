import { VehicleStatus } from '@prisma/client'
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Min,
  IsDate,
  isNotEmpty,
  ValidateIf,
} from 'class-validator'
import { CreateDriverDto, UpdateDriverDto } from './driver.dto'
import { DriverResponseDto } from './driver.dto'
import * as moment from 'moment'

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  name: string

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
  status: VehicleStatus

  @ValidateIf((o) => o.maintenanceDate !== undefined)
  @IsString()
  @IsNotEmpty()
  maintenanceDate?: string

  @IsNotEmpty()
  @ValidateIf((o) => !o.driverId)
  driver: CreateDriverDto

  @IsNumber()
  @ValidateIf((o) => !o.driver)
  driverId?: number

  @IsString()
  @IsOptional()
  description?: string
}

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  name?: string

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

  @ValidateIf((o) => o.maintenanceDate !== undefined)
  @IsString()
  @IsNotEmpty()
  maintenanceDate?: string

  @IsOptional()
  driver?: CreateDriverDto

  @IsOptional()
  @IsNumber()
  driverId?: number

  @IsString()
  @IsOptional()
  description?: string
}

export class VehicleResponseDto {
  id: number
  name: string
  plateNumber: string
  model: string
  capacity: number
  deviceId: string | null
  status: VehicleStatus
  organizationId: number
  createdAt: Date
  updatedAt: Date
  maintenanceDate?: Date | null
  driver: DriverResponseDto
  description: string
}
