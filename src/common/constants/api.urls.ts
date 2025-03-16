export const TRACCAR_API_URLS = {
  // Device endpoints
  DEVICES: '/devices',
  DEVICE_BY_ID: (id: number) => `/devices/${id}`,
  DEVICES_BY_UNIQUE_ID: (uniqueId: string) => `/devices?uniqueId=${uniqueId}`,
  DEVICES_BY_ORGANIZATION: (organizationId: number) => `/devices?organizationId=${organizationId}`,

  // Position endpoints
  POSITIONS: '/positions',
  POSITION_BY_ID: (id: number) => `/positions/${id}`,
  POSITIONS_BY_DEVICE_ID: (deviceId: number, limit?: number) =>
    limit ? `/positions?deviceId=${deviceId}&limit=${limit}` : `/positions?deviceId=${deviceId}`,
  POSITIONS_IN_TIME_RANGE: (deviceId: number, from: string, to: string) =>
    `/positions?deviceId=${deviceId}&from=${from}&to=${to}`,
}
