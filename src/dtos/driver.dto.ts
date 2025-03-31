import { IsString, IsNotEmpty } from 'class-validator'

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name: string
}

export class UpdateDriverDto {
  @IsString()
  @IsNotEmpty()
  name: string
}

export class DriverResponseDto {
  id: number
  name: string
  organizationId: number
  createdAt: Date
  updatedAt: Date
}
