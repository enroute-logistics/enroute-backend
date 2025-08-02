import { Injectable } from '@nestjs/common'
import { ReportRequestDto, ReportResponseDto, ReportType } from '../dtos/report.dto'
import {
  TotalShipmentsHandler,
  ShipmentsByStatusHandler,
  TotalDistanceHandler,
  VehicleUtilizationHandler,
  CustomerShipmentsHandler,
  RevenueOverTimeHandler,
  DriverPerformanceHandler,
} from './handlers'

@Injectable()
export class ReportsService {
  constructor(
    private totalShipmentsHandler: TotalShipmentsHandler,
    private shipmentsByStatusHandler: ShipmentsByStatusHandler,
    private totalDistanceHandler: TotalDistanceHandler,
    private vehicleUtilizationHandler: VehicleUtilizationHandler,
    private customerShipmentsHandler: CustomerShipmentsHandler,
    private revenueOverTimeHandler: RevenueOverTimeHandler,
    private driverPerformanceHandler: DriverPerformanceHandler,
  ) {}

  async generateReport(
    reportRequest: ReportRequestDto,
    organizationId: number,
  ): Promise<ReportResponseDto> {
    const { startDateTime, endDateTime } = reportRequest.timeRange
    const startDate = new Date(startDateTime)
    const endDate = new Date(endDateTime)

    switch (reportRequest.type) {
      case ReportType.TOTAL_SHIPMENTS:
        return this.totalShipmentsHandler.generateReport(
          startDate,
          endDate,
          organizationId,
          reportRequest,
        )
      case ReportType.SHIPMENTS_BY_STATUS:
        return this.shipmentsByStatusHandler.generateReport(
          startDate,
          endDate,
          organizationId,
          reportRequest,
        )
      case ReportType.TOTAL_DISTANCE_COVERED:
        return this.totalDistanceHandler.generateReport(
          startDate,
          endDate,
          organizationId,
          reportRequest,
        )
      case ReportType.VEHICLE_UTILIZATION:
        return this.vehicleUtilizationHandler.generateReport(
          startDate,
          endDate,
          organizationId,
          reportRequest,
        )
      case ReportType.CUSTOMER_SHIPMENTS:
        return this.customerShipmentsHandler.generateReport(
          startDate,
          endDate,
          organizationId,
          reportRequest,
        )
      case ReportType.REVENUE_OVER_TIME:
        return this.revenueOverTimeHandler.generateReport(
          startDate,
          endDate,
          organizationId,
          reportRequest,
        )
      case ReportType.DRIVER_PERFORMANCE:
        return this.driverPerformanceHandler.generateReport(
          startDate,
          endDate,
          organizationId,
          reportRequest,
        )
      default:
        throw new Error(`Unsupported report type: ${reportRequest.type}`)
    }
  }
}
