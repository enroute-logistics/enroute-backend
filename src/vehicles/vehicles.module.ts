import { Module } from '@nestjs/common'
import { VehiclesController } from './vehicles.controller'
import { VehiclesService } from './vehicles.service'
import { VehiclesRepository } from './vehicles.repository'
import { PrismaService } from '../prisma/prisma.service'
import { DriversModule } from '../drivers/drivers.module'

@Module({
  imports: [DriversModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesRepository, PrismaService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
