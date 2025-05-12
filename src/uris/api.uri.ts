export const API_BASE = '/api'

export const AUTH_URI = {
  BASE: `${API_BASE}/auth`,
  LOGIN: '/login',
  REGISTER: '/signup',
  LOGOUT: '/logout',
}

export const USER_URI = {
  BASE: `${API_BASE}/users`,
  PROFILE: '/profile',
  BY_ID: '/:id',
}

export const ORGANIZATION_URI = {
  BASE: `${API_BASE}/organizations`,
  USERS: '/users',
  BY_ID: '/:id',
}

export const VEHICLE_URI = {
  BASE: `${API_BASE}/vehicles`,
  BY_ID: '/:id',
}

export const SHIPMENT_URI = {
  BASE: `${API_BASE}/shipments`,
  BY_ID: '/:id',
}

export const POSITION_URI = {
  BASE: `${API_BASE}/positions`,
  LATEST: '/latest',
  HISTORY: '/history',
  BY_ID: '/:id',
}

export const DEVICE_URI = {
  BASE: `${API_BASE}/devices`,
  BY_ID: '/:id',
  POSITIONS: '/:id/positions',
  PAST_POSITIONS: '/:id/past-positions',
}

export const DRIVER_URI = {
  BASE: `${API_BASE}/drivers`,
  BY_ID: '/:id',
}

export const ADDRESS_URI = {
  BASE: `${API_BASE}/address`,
  SEARCH: '/search',
}

export const ROUTE_URI = {
  BASE: `${API_BASE}/route`,
  SEARCH: '/search',
}

export const CUSTOMER_URI = {
  BASE: `${API_BASE}/customers`,
  BY_ID: '/:id',
}

export const FILE_URI = {
  BASE: `${API_BASE}/files`,
  UPLOAD: '/upload',
  UPLOAD_VEHICLE: '/vehicle/:vehicleId/upload',
  UPLOAD_SHIPMENT: '/shipment/:shipmentId/upload',
  DOWNLOAD: '/:fileId/download',
  VEHICLE_FILES: '/vehicle/:vehicleId',
  SHIPMENT_FILES: '/shipment/:shipmentId',
  DELETE_FILE: '/:fileId',
}
