import { Module } from '@nestjs/common'
import { VehiclesController } from './vehicles.controller'
import { VehiclesService } from './vehicles.service'
import { VehiclesRepository } from './vehicles.repository'
import { PrismaService } from '../prisma/prisma.service'
import { DriversModule } from '../drivers/drivers.module'
import { DevicesService } from '../devices/devices.service'
import { ShipmentsModule } from '../shipments/shipments.module'
import { PositionsModule } from '../positions/positions.module'
@Module({
  imports: [DriversModule, ShipmentsModule, PositionsModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesRepository, PrismaService, DevicesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
