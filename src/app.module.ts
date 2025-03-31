import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

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

// Prisma Service
import { PrismaService } from './prisma/prisma.service'
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*') // Apply to all routes
  }
}
