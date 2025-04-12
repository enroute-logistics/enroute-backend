import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { MapboxService } from '../services/mapbox.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ROUTE_URI } from '../../uris/api.uri'
import { RouteSearchRequestDto, RouteSearchResponseDto } from 'src/dtos/route.dto'

@ApiTags('Route')
@Controller(ROUTE_URI.BASE)
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(private readonly mapboxService: MapboxService) {}

  @Get(ROUTE_URI.SEARCH)
  @ApiOperation({ summary: 'Search for routes between two coordinates' })
  @ApiQuery({
    name: 'startLatitude',
    required: true,
    description: 'Starting latitude',
    type: Number,
  })
  @ApiQuery({
    name: 'startLongitude',
    required: true,
    description: 'Starting longitude',
    type: Number,
  })
  @ApiQuery({ name: 'endLatitude', required: true, description: 'Ending latitude', type: Number })
  @ApiQuery({ name: 'endLongitude', required: true, description: 'Ending longitude', type: Number })
  @ApiQuery({
    name: 'alternatives',
    required: false,
    description: 'Whether to return alternative routes',
    type: Boolean,
  })
  @ApiQuery({
    name: 'steps',
    required: false,
    description: 'Whether to return step-by-step instructions',
    type: Boolean,
  })
  @ApiQuery({
    name: 'geometries',
    required: false,
    description: 'Format of the route geometry',
    enum: ['geojson', 'polyline', 'polyline6'],
  })
  async searchRoute(
    @Query('startLatitude') startLatitude: number,
    @Query('startLongitude') startLongitude: number,
    @Query('endLatitude') endLatitude: number,
    @Query('endLongitude') endLongitude: number,
    @Query('alternatives') alternatives?: boolean,
    @Query('steps') steps?: boolean,
    @Query('geometries') geometries?: 'geojson' | 'polyline' | 'polyline6',
  ): Promise<RouteSearchResponseDto> {
    const params: RouteSearchRequestDto = {
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
      alternatives,
      steps,
      geometries,
    }

    return this.mapboxService.searchRoute(params)
  }
}
