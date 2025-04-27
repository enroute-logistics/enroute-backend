import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TraccarApiClientService } from './services/traccar-api-client.service'
import { TraccarSocketService } from './services/traccar-socket.service'
import { MapboxService } from './services/mapbox.service'
import { AddressController } from './controllers/address.controller'
import { RouteController } from './controllers/route.controller'
import { RedisCacheService } from './services/redis-cache.service'
import { RedisCacheInterceptor } from './interceptors/redis-cache.interceptor'

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AddressController, RouteController],
  providers: [
    TraccarApiClientService,
    TraccarSocketService,
    MapboxService,
    RedisCacheService,
    RedisCacheInterceptor,
  ],
  exports: [
    TraccarApiClientService,
    TraccarSocketService,
    MapboxService,
    RedisCacheService,
    RedisCacheInterceptor,
  ],
})
export class CommonModule {}
