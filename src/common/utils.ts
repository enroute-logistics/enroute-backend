export function convertKnotsToKmH(speed: number): number {
  return Math.round(speed * 1.852)
}

/**
 * Normalizes a timestamp by adding 6 hours to account for timezone offset
 * and converting it to a proper UTC ISO string
 */
export function normalizeTimestampToUtc(timestamp: string): string {
  if (!timestamp) return timestamp

  try {
    // Parse the timestamp
    const date = new Date(timestamp)

    // If the date is invalid, return the original timestamp
    if (isNaN(date.getTime())) {
      return timestamp
    }

    // Add 3 hours (3 * 60 * 60 * 1000 milliseconds)
    const adjustedDate = new Date(date.getTime() + 3 * 60 * 60 * 1000)

    // Return as UTC ISO string
    return adjustedDate.toISOString()
  } catch (error) {
    // If any error occurs, return the original timestamp
    return timestamp
  }
}

/**
 * Normalizes all timestamp fields in a position object to UTC
 */
export function normalizePositionTimestamps(position: any): any {
  if (!position) return position

  const normalizedPosition = { ...position }

  // Normalize common timestamp fields
  if (normalizedPosition.deviceTime) {
    normalizedPosition.deviceTime = normalizeTimestampToUtc(normalizedPosition.deviceTime)
  }
  if (normalizedPosition.fixTime) {
    normalizedPosition.fixTime = normalizeTimestampToUtc(normalizedPosition.fixTime)
  }
  if (normalizedPosition.serverTime) {
    normalizedPosition.serverTime = normalizeTimestampToUtc(normalizedPosition.serverTime)
  }

  return normalizedPosition
}
