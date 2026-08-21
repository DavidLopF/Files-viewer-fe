const DEFAULT_API_BASE_URL = 'http://localhost:3000'

export const API_BASE_URL =
  typeof process !== 'undefined' && process.env && process.env.API_BASE_URL
    ? process.env.API_BASE_URL
    : DEFAULT_API_BASE_URL

export const REQUEST_TIMEOUT_MS = 15000
