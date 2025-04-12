export class RouteSearchRequestDto {
  startLatitude: number
  startLongitude: number
  endLatitude: number
  endLongitude: number
  alternatives?: boolean
  steps?: boolean
  geometries?: 'geojson' | 'polyline' | 'polyline6'
}

export class RouteLegDto {
  distance: number
  duration: number
  summary: string
  steps: RouteStepDto[]
}

export class RouteStepDto {
  distance: number
  duration: number
  instruction: string
  name: string
  type: number
  way_points: number[]
}

export class RouteSearchResponseDto {
  code: string
  routes: {
    distance: number
    duration: number
    geometry: string
    legs: RouteLegDto[]
  }[]
  waypoints: {
    location: [number, number]
    name: string
  }[]
}
