import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { MapboxService } from '../services/mapbox.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ADDRESS_URI } from '../../uris/api.uri'
import { AddressSearchResponseDto } from 'src/dtos/address.dto'

@ApiTags('Address')
@Controller(ADDRESS_URI.BASE)
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly mapboxService: MapboxService) {}

  @Get(ADDRESS_URI.SEARCH)
  @ApiOperation({ summary: 'Search for addresses' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query for address' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results to return',
    type: Number,
  })
  async searchAddress(
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ): Promise<AddressSearchResponseDto[]> {
    return this.mapboxService.searchAddress(query, limit)
  }
}
