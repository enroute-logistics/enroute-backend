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
export class CustomerShipmentsHandler extends BaseReportHandler {
  async generateReport(
    startDate: Date,
    endDate: Date,
    organizationId: number,
    request: ReportRequestDto,
  ): Promise<ReportResponseDto> {
    const customerShipments = await this.prisma.shipment.groupBy({
      by: ['customerId'],
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        price: true,
      },
    })

    const customers = await this.prisma.customer.findMany({
      where: {
        id: {
          in: customerShipments.map((cs) => cs.customerId),
        },
      },
    })

    const customerMap = new Map(customers.map((c) => [c.id, c]))

    const results: ReportDataPoint[] = customerShipments.map((item) => {
      const customer = customerMap.get(item.customerId)
      return {
        label: customer?.name || 'Unknown Customer',
        value: item._count.id,
        metadata: {
          customerId: item.customerId,
          totalRevenue: item._sum.price || 0,
        },
      }
    })

    return {
      type: ReportType.CUSTOMER_SHIPMENTS,
      chartType: ChartType.BAR,
      title: 'Customer Shipments',
      description: 'Number of shipments per customer',
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
