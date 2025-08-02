import { Injectable } from '@nestjs/common'
import { BaseReportHandler } from './base-report.handler'
import {
  ReportRequestDto,
  ReportResponseDto,
  ReportType,
  ChartType,
  ReportDataPoint,
} from '../../dtos/report.dto'

@Injectable()
export class VehicleUtilizationHandler extends BaseReportHandler {
  async generateReport(
    startDate: Date,
    endDate: Date,
    organizationId: number,
    request: ReportRequestDto,
  ): Promise<ReportResponseDto> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { organizationId },
      include: {
        shipments: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    })

    const results: ReportDataPoint[] = vehicles.map((vehicle) => ({
      label: vehicle.name,
      value: vehicle.shipments.length,
      metadata: {
        vehicleId: vehicle.id,
        plateNumber: vehicle.plateNumber,
      },
    }))

    const totalShipments = results.reduce((sum, item) => sum + item.value, 0)

    return {
      type: ReportType.VEHICLE_UTILIZATION,
      chartType: ChartType.BAR,
      title: 'Vehicle Utilization',
      description: 'Number of shipments assigned to each vehicle',
      timeRange: {
        startDateTime: request.timeRange.startDateTime,
        endDateTime: request.timeRange.endDateTime,
      },
      totalCount: totalShipments,
      results,
      generatedAt: new Date(),
    }
  }
}
