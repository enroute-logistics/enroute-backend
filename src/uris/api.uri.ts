export const API_BASE = '/api'

export const AUTH_URI = {
  BASE: `${API_BASE}/auth`,
  LOGIN: '/login',
  REGISTER: '/signup',
}

export const CORS_URI = {
  // Get allowed origins from env or default to localhost:3000
  ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
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
}
