export const API_BASE = '/api'

export const AUTH_URI = {
  BASE: `${API_BASE}/auth`,
  LOGIN: '/login',
  REGISTER: '/register',
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
