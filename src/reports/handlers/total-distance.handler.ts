import { Injectable } from '@nestjs/common'
import { BaseReportHandler } from './base-report.handler'
import {
  ReportRequestDto,
  ReportResponseDto,
  ReportType,
  ChartType,
  TimeSeriesDataPoint,
} from '../../dtos/report.dto'

@Injectable()
export class TotalDistanceHandler extends BaseReportHandler {
  async generateReport(
    startDate: Date,
    endDate: Date,
    organizationId: number,
    request: ReportRequestDto,
  ): Promise<ReportResponseDto> {
    const shipments = await this.prisma.shipment.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        distance: {
          not: null,
        },
      },
      select: {
        distance: true,
        createdAt: true,
      },
    })

    const totalDistance = shipments.reduce((sum, shipment) => sum + (shipment.distance || 0), 0)

    const results: TimeSeriesDataPoint[] = []

    if (request.granularity) {
      const groupedData = this.groupDataByGranularity(
        shipments.map((s) => ({ createdAt: s.createdAt, value: s.distance || 0 })),
        request.granularity,
        startDate,
        endDate,
      )

      for (const [timestamp, distance] of groupedData.entries()) {
        results.push({
          timestamp,
          value: this.roundToTwoDecimals(distance),
        })
      }
    } else {
      results.push({
        timestamp: startDate.toISOString(),
        value: this.roundToTwoDecimals(totalDistance),
      })
    }

    return {
      type: ReportType.TOTAL_DISTANCE_COVERED,
      chartType: request.granularity ? ChartType.AREA : ChartType.COLUMN,
      title: 'Total Distance Covered',
      description: 'Cumulative distance covered by all shipments (km)',
      timeRange: {
        startDateTime: request.timeRange.startDateTime,
        endDateTime: request.timeRange.endDateTime,
      },
      granularity: request.granularity,
      totalValue: this.roundToTwoDecimals(totalDistance),
      results,
      generatedAt: new Date(),
      metadata: {
        unit: 'km',
      },
    }
  }
}
