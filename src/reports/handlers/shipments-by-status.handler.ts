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
export class ShipmentsByStatusHandler extends BaseReportHandler {
  async generateReport(
    startDate: Date,
    endDate: Date,
    organizationId: number,
    request: ReportRequestDto,
  ): Promise<ReportResponseDto> {
    const shipmentsByStatus = await this.prisma.shipment.groupBy({
      by: ['status'],
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        status: true,
      },
    })

    const total = shipmentsByStatus.reduce((sum, item) => sum + item._count.status, 0)

    const results: ReportDataPoint[] = shipmentsByStatus.map((item) => ({
      label: item.status,
      value: item._count.status,
      percentage: Math.round((item._count.status / total) * 100),
    }))

    return {
      type: ReportType.SHIPMENTS_BY_STATUS,
      chartType: ChartType.PIE,
      title: 'Shipments by Status',
      description: 'Distribution of shipments by their current status',
      timeRange: {
        startDateTime: request.timeRange.startDateTime,
        endDateTime: request.timeRange.endDateTime,
      },
      totalCount: total,
      results,
      generatedAt: new Date(),
    }
  }
}
