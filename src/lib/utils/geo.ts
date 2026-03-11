/**
 * Geographic utility functions for "My Long Island."
 *
 * These help with distance calculations, bounding boxes, and
 * determining if a point is within a user's home zone.
 */

/**
 * Calculate the distance between two GPS coordinates using the
 * Haversine formula. Returns the distance in miles.
 *
 * The Haversine formula accounts for the curvature of the Earth —
 * it's more accurate than just subtracting lat/lng values.
 *
 * Args:
 *   lat1, lng1: First point (latitude, longitude in degrees)
 *   lat2, lng2: Second point (latitude, longitude in degrees)
 *
 * Returns:
 *   Distance in miles (e.g., 3.42 means 3.42 miles apart)
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a point is within a given radius of a center point.
 *
 * Used to determine if a news article, event, or incident is
 * within the user's "home zone" radius.
 */
export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  pointLat: number,
  pointLng: number,
  radiusMiles: number
): boolean {
  return haversineDistance(centerLat, centerLng, pointLat, pointLng) <= radiusMiles;
}

/**
 * Calculate a bounding box around a center point.
 *
 * Returns the min/max lat/lng that forms a square around the center.
 * Used for efficient database queries — instead of calculating distance
 * for every row, we first filter by bounding box (fast), then calculate
 * exact distance on the smaller result set.
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusMiles: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // 1 degree of latitude = ~69 miles
  const latDelta = radiusMiles / 69;
  // 1 degree of longitude varies by latitude
  const lngDelta = radiusMiles / (69 * Math.cos(toRad(lat)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/** Convert degrees to radians */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format a distance value for display.
 * Under 0.1 miles shows "nearby", otherwise shows "X.X mi"
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return "Nearby";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
