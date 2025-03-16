export default interface Position {
  id: number
  deviceId: number
  protocol: string
  deviceTime: string
  fixTime: string
  serverTime: string
  outdated: boolean
  valid: boolean
  latitude: number
  longitude: number
  altitude: number
  speed: number
  course: number
  address: string
  accuracy: number
  geofenceIds: number[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: Record<string, any>
}
