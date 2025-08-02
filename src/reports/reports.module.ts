import { Module } from '@nestjs/common'
import { ReportsController } from './reports.controller'
import { ReportsService } from './reports.service'
import { PrismaService } from '../prisma/prisma.service'
import {
  TotalShipmentsHandler,
  ShipmentsByStatusHandler,
  TotalDistanceHandler,
  VehicleUtilizationHandler,
  CustomerShipmentsHandler,
  RevenueOverTimeHandler,
  DriverPerformanceHandler,
} from './handlers'

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    PrismaService,
    TotalShipmentsHandler,
    ShipmentsByStatusHandler,
    TotalDistanceHandler,
    VehicleUtilizationHandler,
    CustomerShipmentsHandler,
    RevenueOverTimeHandler,
    DriverPerformanceHandler,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
