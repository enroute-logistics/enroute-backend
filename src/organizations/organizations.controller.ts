import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OrganizationsService } from './organizations.service'
import { UsersService } from '../users/users.service'
import { UpdateOrganizationDto, OrganizationResponseDto } from '../dtos/organization.dto'
import { CreateUserDto, UserResponseDto } from '../dtos/user.dto'
import { ORGANIZATION_URI } from '../uris/api.uri'
import { UserRole } from '@prisma/client'

@Controller(ORGANIZATION_URI.BASE)
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getOrganization(@Request() req): Promise<OrganizationResponseDto> {
    return this.organizationsService.findById(req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateOrganization(
    @Request() req,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    // Only ADMIN can update organization
    if (req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only administrators can update organization details')
    }

    return this.organizationsService.update(req.user.organizationId, updateOrganizationDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get(ORGANIZATION_URI.USERS)
  async getOrganizationUsers(@Request() req): Promise<UserResponseDto[]> {
    return this.usersService.findAll(req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Post(ORGANIZATION_URI.USERS)
  async addOrganizationUser(
    @Request() req,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    // Only ADMIN can add users
    if (req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only administrators can add users')
    }

    return this.usersService.create(createUserDto, req.user.organizationId)
  }
}
