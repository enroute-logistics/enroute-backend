import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TraccarApiClientService } from './services/traccar-api-client.service'
import { TraccarSocketService } from './services/traccar-socket.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TraccarApiClientService, TraccarSocketService],
  exports: [TraccarApiClientService, TraccarSocketService],
})
export class CommonModule {}
