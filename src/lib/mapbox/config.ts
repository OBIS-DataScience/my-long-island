/**
 * Mapbox configuration for Long Island.
 *
 * The default view centers on the middle of Long Island and constrains
 * the map to only show the LI area (from western Queens to Orient Point).
 * Uses a dark map style to match the app's dark-mode-default design.
 */

export const MAPBOX_CONFIG = {
  // Your Mapbox token — loaded from environment variable
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",

  // Center of Long Island (roughly Farmingdale area)
  defaultCenter: [-73.13, 40.75] as [number, number],

  // Zoom level 9 shows most of LI at once
  defaultZoom: 9,

  // Restrict panning so users can't scroll away from LI
  maxBounds: [
    [-74.1, 40.4] as [number, number], // SW corner (west of Queens)
    [-71.7, 41.2] as [number, number], // NE corner (east of Orient Point)
  ],

  // Dark style that matches our Deep Ocean palette
  style: "mapbox://styles/mapbox/dark-v11",

  // Min/max zoom levels
  minZoom: 7,
  maxZoom: 18,
};

/**
 * Long Island geographic constants.
 * Useful for filtering data and determining if a point is "on Long Island."
 */
export const LONG_ISLAND_BOUNDS = {
  west: -73.95, // Western edge (Queens/Nassau border area)
  east: -71.85, // Eastern tip (Montauk Point)
  south: 40.55, // Southern coast (south shore beaches)
  north: 41.15, // Northern coast (north shore/sound)
};
