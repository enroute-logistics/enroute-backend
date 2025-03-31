import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto, AuthResponseDto } from '../dtos/auth.dto'
import { UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    })

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(user: any): Promise<AuthResponseDto> {
    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    }

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        code: user.organization.code,
        createdAt: user.organization.createdAt,
        updatedAt: user.organization.updatedAt,
      },
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    })

    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    // Create a unique code for the organization based on the name
    const orgCode =
      registerDto.organization.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 8) +
      '-' +
      Math.random().toString(36).substring(2, 7)

    // Use a transaction to ensure both organization and user are created or neither
    return this.prisma.$transaction(async (prisma): Promise<AuthResponseDto> => {
      // Create the organization
      const organization = await prisma.organization.create({
        data: {
          name: registerDto.organization.name,
          code: orgCode,
          description: registerDto.organization.description || '',
        },
      })

      // Hash the password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10)

      // Create the user with admin role and link to the organization
      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          password: hashedPassword,
          role: UserRole.ADMIN, // First user is the admin of the organization
          organizationId: organization.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      })

      console.log('new user is', user)

      return this.login(user)
    })
  }

  async logout(): Promise<void> {
    // TODO: Implement logout
  }
}
