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
export class TotalShipmentsHandler extends BaseReportHandler {
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
      },
    })

    const results: TimeSeriesDataPoint[] = []

    if (request.granularity) {
      const groupedData = this.groupDataByGranularity(
        shipments.map((s) => ({ createdAt: s.createdAt, value: 1 })),
        request.granularity,
        startDate,
        endDate,
      )

      for (const [timestamp, count] of groupedData.entries()) {
        results.push({
          timestamp,
          value: count,
        })
      }
    } else {
      results.push({
        timestamp: startDate.toISOString(),
        value: shipments.length,
      })
    }

    return {
      type: ReportType.TOTAL_SHIPMENTS,
      chartType: request.granularity ? ChartType.LINE : ChartType.COLUMN,
      title: 'Total Shipments',
      description: 'Number of shipments created over time',
      timeRange: {
        startDateTime: request.timeRange.startDateTime,
        endDateTime: request.timeRange.endDateTime,
      },
      granularity: request.granularity,
      totalCount: shipments.length,
      results,
      generatedAt: new Date(),
    }
  }
}
