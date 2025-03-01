import { CreateOrganizationDto } from './organization.dto'
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  organization: CreateOrganizationDto
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string
}

export class AuthResponseDto {
  access_token: string
  user: {
    id: number
    email: string
    name: string
    role: string
    organizationId: number
    organization?: {
      id: number
      name: string
      code: string
    }
  }
}
