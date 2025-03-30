import { Controller, Post, Body, UnauthorizedException, Delete } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto, AuthResponseDto } from '../dtos/auth.dto'
import { AUTH_URI } from '../uris/api.uri'

@Controller(AUTH_URI.BASE)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(AUTH_URI.REGISTER)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.authService.register(registerDto)
    return this.authService.login(user)
  }

  @Post(AUTH_URI.LOGIN)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return this.authService.login(user)
  }

  @Delete(AUTH_URI.LOGOUT)
  async logout(): Promise<void> {
    return this.authService.logout()
  }
}
