import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import * as redisStore from 'cache-manager-redis-store'

// Feature Modules
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { VehiclesModule } from './vehicles/vehicles.module'
import { ShipmentsModule } from './shipments/shipments.module'
import { DevicesModule } from './devices/devices.module'
import { PositionsModule } from './positions/positions.module'
import { CommonModule } from './common/common.module'
import { DriversModule } from './drivers/drivers.module'
import { CustomersModule } from './customers/customers.module'

// Prisma Service
import { PrismaService } from './prisma/prisma.service'
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        max: 100, // maximum number of items in cache
        prefix: 'enroute:', // prefix for all cache keys
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    VehiclesModule,
    ShipmentsModule,
    DevicesModule,
    PositionsModule,
    CommonModule,
    DriversModule,
    CustomersModule,
  ],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*') // Apply to all routes
  }
}
