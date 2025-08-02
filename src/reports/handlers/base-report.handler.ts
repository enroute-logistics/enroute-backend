import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ReportRequestDto, ReportResponseDto, ReportGranularity } from '../../dtos/report.dto'

@Injectable()
export abstract class BaseReportHandler {
  constructor(protected prisma: PrismaService) {}

  abstract generateReport(
    startDate: Date,
    endDate: Date,
    organizationId: number,
    request: ReportRequestDto,
  ): Promise<ReportResponseDto>

  protected groupDataByGranularity(
    data: Array<{ createdAt: Date; value: number }>,
    granularity: ReportGranularity,
    startDate: Date,
    endDate: Date,
  ): Map<string, number> {
    const grouped = new Map<string, number>()

    // Initialize all time periods with 0
    const current = new Date(startDate)
    while (current <= endDate) {
      const key = this.formatDateByGranularity(current, granularity)
      grouped.set(key, 0)
      this.incrementDateByGranularity(current, granularity)
    }

    // Aggregate actual data
    data.forEach((item) => {
      const key = this.formatDateByGranularity(item.createdAt, granularity)
      const currentValue = grouped.get(key) || 0
      grouped.set(key, currentValue + item.value)
    })

    return grouped
  }

  protected formatDateByGranularity(date: Date, granularity: ReportGranularity): string {
    switch (granularity) {
      case ReportGranularity.MINUTE:
        return date.toISOString().substring(0, 16) // YYYY-MM-DDTHH:mm
      case ReportGranularity.HOURLY:
        return date.toISOString().substring(0, 13) // YYYY-MM-DDTHH
      case ReportGranularity.DAILY:
        return date.toISOString().substring(0, 10) // YYYY-MM-DD
      case ReportGranularity.WEEKLY:
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
        return weekStart.toISOString().substring(0, 10)
      case ReportGranularity.MONTHLY:
        return date.toISOString().substring(0, 7) // YYYY-MM
      default:
        return date.toISOString().substring(0, 10)
    }
  }

  protected incrementDateByGranularity(date: Date, granularity: ReportGranularity): void {
    switch (granularity) {
      case ReportGranularity.MINUTE:
        date.setMinutes(date.getMinutes() + 1)
        break
      case ReportGranularity.HOURLY:
        date.setHours(date.getHours() + 1)
        break
      case ReportGranularity.DAILY:
        date.setDate(date.getDate() + 1)
        break
      case ReportGranularity.WEEKLY:
        date.setDate(date.getDate() + 7)
        break
      case ReportGranularity.MONTHLY:
        date.setMonth(date.getMonth() + 1)
        break
    }
  }

  protected roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100
  }
}
