import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ReportsService } from './reports.service'
import { ReportRequestDto, ReportResponseDto } from '../dtos/report.dto'
import { REPORT_URI } from '../uris/api.uri'

@Controller(REPORT_URI.BASE)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(REPORT_URI.GENERATE)
  async generateReport(
    @Request() req,
    @Body() reportRequest: ReportRequestDto,
  ): Promise<ReportResponseDto> {
    return this.reportsService.generateReport(reportRequest, req.user.organizationId)
  }
}
