import { Module } from '@nestjs/common'
import { VehiclesController } from './vehicles.controller'
import { VehiclesService } from './vehicles.service'
import { VehiclesRepository } from './vehicles.repository'
import { PrismaService } from '../prisma/prisma.service'
import { DriversModule } from '../drivers/drivers.module'
import { DevicesService } from '../devices/devices.service'
@Module({
  imports: [DriversModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesRepository, PrismaService, DevicesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
