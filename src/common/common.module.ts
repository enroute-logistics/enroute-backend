import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TraccarApiClientService } from './services/traccar-api-client.service'
import { TraccarSocketService } from './services/traccar-socket.service'
import { MapboxService } from './services/mapbox.service'
import { AddressController } from './controllers/address.controller'

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AddressController],
  providers: [TraccarApiClientService, TraccarSocketService, MapboxService],
  exports: [TraccarApiClientService, TraccarSocketService, MapboxService],
})
export class CommonModule {}
