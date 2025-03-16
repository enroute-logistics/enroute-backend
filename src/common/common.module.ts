import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TraccarApiClientService } from './services/traccar-api-client.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TraccarApiClientService],
  exports: [TraccarApiClientService],
})
export class CommonModule {}
