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
export class RevenueOverTimeHandler extends BaseReportHandler {
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
        price: {
          not: null,
        },
      },
      select: {
        price: true,
        createdAt: true,
      },
    })

    const totalRevenue = shipments.reduce((sum, shipment) => sum + (shipment.price || 0), 0)

    const results: TimeSeriesDataPoint[] = []

    if (request.granularity) {
      const groupedData = this.groupDataByGranularity(
        shipments.map((s) => ({ createdAt: s.createdAt, value: s.price || 0 })),
        request.granularity,
        startDate,
        endDate,
      )

      for (const [timestamp, revenue] of groupedData.entries()) {
        results.push({
          timestamp,
          value: this.roundToTwoDecimals(revenue),
        })
      }
    } else {
      results.push({
        timestamp: startDate.toISOString(),
        value: this.roundToTwoDecimals(totalRevenue),
      })
    }

    return {
      type: ReportType.REVENUE_OVER_TIME,
      chartType: request.granularity ? ChartType.LINE : ChartType.COLUMN,
      title: 'Revenue Over Time',
      description: 'Total revenue generated from shipments',
      timeRange: {
        startDateTime: request.timeRange.startDateTime,
        endDateTime: request.timeRange.endDateTime,
      },
      granularity: request.granularity,
      totalValue: this.roundToTwoDecimals(totalRevenue),
      results,
      generatedAt: new Date(),
      metadata: {
        currency: 'USD', // This should come from organization settings
      },
    }
  }
}
