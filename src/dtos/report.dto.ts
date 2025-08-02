import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum ReportGranularity {
  MINUTE = 'minute',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum ReportType {
  TOTAL_SHIPMENTS = 'total-shipments',
  SHIPMENTS_BY_STATUS = 'shipments-by-status',
  TOTAL_DISTANCE_COVERED = 'total-distance-covered',
  VEHICLE_UTILIZATION = 'vehicle-utilization',
  CUSTOMER_SHIPMENTS = 'customer-shipments',
  REVENUE_OVER_TIME = 'revenue-over-time',
  DRIVER_PERFORMANCE = 'driver-performance',
}

export enum ChartType {
  PIE = 'pie',
  BAR = 'bar',
  LINE = 'line',
  AREA = 'area',
  DONUT = 'donut',
  COLUMN = 'column',
}

class TimeRangeDto {
  @IsDateString()
  @IsNotEmpty()
  startDateTime: string

  @IsDateString()
  @IsNotEmpty()
  endDateTime: string
}

export class ReportRequestDto {
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange: TimeRangeDto

  @IsEnum(ReportGranularity)
  @IsOptional()
  granularity?: ReportGranularity

  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType
}

export interface ReportDataPoint {
  label: string
  value: number
  percentage?: number
  metadata?: Record<string, any>
}

export interface TimeSeriesDataPoint {
  timestamp: string
  value: number
  metadata?: Record<string, any>
}

export class ReportResponseDto {
  type: ReportType
  chartType: ChartType
  title: string
  description?: string
  timeRange: {
    startDateTime: string
    endDateTime: string
  }
  granularity?: ReportGranularity
  totalCount?: number
  totalValue?: number
  results: ReportDataPoint[] | TimeSeriesDataPoint[]
  generatedAt: Date
  metadata?: Record<string, any>
}
