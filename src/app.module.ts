import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

// Feature Modules
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { VehiclesModule } from './vehicles/vehicles.module'
import { ShipmentsModule } from './shipments/shipments.module'

// Prisma Service
import { PrismaService } from './prisma/prisma.service'

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
  ],
  providers: [PrismaService],
})
export class AppModule {}
