import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto'
import { USER_URI } from '../uris/api.uri'

@Controller(USER_URI.BASE)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Request() req): Promise<UserResponseDto[]> {
    return this.usersService.findAll(req.user.organizationId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(USER_URI.PROFILE)
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return this.usersService.findById(req.user.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(USER_URI.BY_ID)
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(parseInt(id))
  }

  @UseGuards(JwtAuthGuard)
  @Put(USER_URI.BY_ID)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(parseInt(id), updateUserDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(USER_URI.BY_ID)
  async deleteUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.delete(parseInt(id))
  }
}
