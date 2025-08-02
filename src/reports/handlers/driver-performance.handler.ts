import { Injectable } from '@nestjs/common'
import { BaseReportHandler } from './base-report.handler'
import {
  ReportRequestDto,
  ReportResponseDto,
  ReportType,
  ChartType,
  ReportDataPoint,
} from '../../dtos/report.dto'
import { ShipmentStatus } from '@prisma/client'

@Injectable()
export class DriverPerformanceHandler extends BaseReportHandler {
  async generateReport(
    startDate: Date,
    endDate: Date,
    organizationId: number,
    request: ReportRequestDto,
  ): Promise<ReportResponseDto> {
    const drivers = await this.prisma.driver.findMany({
      where: {
        vehicle: {
          organizationId,
        },
      },
      include: {
        vehicle: {
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
        },
      },
    })

    const results: ReportDataPoint[] = drivers.map((driver) => {
      const shipments = driver.vehicle?.shipments || []
      const completedShipments = shipments.filter((s) => s.status === ShipmentStatus.DELIVERED)
      const totalDistance = shipments.reduce((sum, s) => sum + (s.distance || 0), 0)

      return {
        label: driver.name,
        value: completedShipments.length,
        metadata: {
          driverId: driver.id,
          totalShipments: shipments.length,
          totalDistance: this.roundToTwoDecimals(totalDistance),
          completionRate:
            shipments.length > 0
              ? Math.round((completedShipments.length / shipments.length) * 100)
              : 0,
        },
      }
    })

    return {
      type: ReportType.DRIVER_PERFORMANCE,
      chartType: ChartType.BAR,
      title: 'Driver Performance',
      description: 'Number of completed shipments per driver',
      timeRange: {
        startDateTime: request.timeRange.startDateTime,
        endDateTime: request.timeRange.endDateTime,
      },
      totalCount: results.reduce((sum, item) => sum + item.value, 0),
      results,
      generatedAt: new Date(),
    }
  }
}
