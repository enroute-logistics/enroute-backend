import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient()
      const token = this.extractTokenFromHeader(client)

      if (!token) {
        throw new UnauthorizedException('Authentication token is missing')
      }

      const payload = await this.jwtService.verifyAsync(token)

      // Attach the user to the socket for later use
      client['user'] = payload

      return true
    } catch (error) {
      throw new WsException({
        status: 'error',
        message: 'Unauthorized',
      })
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const [type, token] = client.handshake.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
