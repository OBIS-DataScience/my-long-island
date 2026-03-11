/**
 * Long Island geographic constants and reference data.
 *
 * This file contains the core reference data about Long Island's
 * communities, LIRR stations, and geographic zones. This data is
 * used for filtering content by town, populating the onboarding
 * town picker, and matching news/events to locations.
 *
 * Long Island has ~200 hamlets/villages across 2 counties (Nassau & Suffolk),
 * organized into 13 towns.
 */

// The 13 towns of Long Island (2 counties)
export const NASSAU_TOWNS = [
  "Town of Hempstead",
  "Town of North Hempstead",
  "Town of Oyster Bay",
  "City of Glen Cove",
  "City of Long Beach",
] as const;

export const SUFFOLK_TOWNS = [
  "Town of Babylon",
  "Town of Brookhaven",
  "Town of East Hampton",
  "Town of Huntington",
  "Town of Islip",
  "Town of Riverhead",
  "Town of Shelter Island",
  "Town of Smithtown",
  "Town of Southampton",
  "Town of Southold",
] as const;

/**
 * Popular hamlets/villages with their approximate center coordinates.
 * This is a starter set — the full locations table in Supabase will
 * have all ~200 communities with zip codes and school districts.
 */
export const POPULAR_HAMLETS = [
  { name: "Smithtown", county: "suffolk", lat: 40.8557, lng: -73.2007, zips: ["11787"] },
  { name: "Huntington", county: "suffolk", lat: 40.8682, lng: -73.4257, zips: ["11743"] },
  { name: "Babylon", county: "suffolk", lat: 40.6957, lng: -73.3257, zips: ["11702"] },
  { name: "Islip", county: "suffolk", lat: 40.7298, lng: -73.2104, zips: ["11751"] },
  { name: "Bay Shore", county: "suffolk", lat: 40.7251, lng: -73.2454, zips: ["11706"] },
  { name: "Patchogue", county: "suffolk", lat: 40.7654, lng: -73.0154, zips: ["11772"] },
  { name: "Riverhead", county: "suffolk", lat: 40.9170, lng: -72.6621, zips: ["11901"] },
  { name: "Montauk", county: "suffolk", lat: 41.0359, lng: -71.9545, zips: ["11954"] },
  { name: "Greenport", county: "suffolk", lat: 41.1034, lng: -72.3593, zips: ["11944"] },
  { name: "Port Jefferson", county: "suffolk", lat: 40.9465, lng: -73.0690, zips: ["11777"] },
  { name: "Commack", county: "suffolk", lat: 40.8426, lng: -73.2929, zips: ["11725"] },
  { name: "Lindenhurst", county: "suffolk", lat: 40.6868, lng: -73.3732, zips: ["11757"] },
  { name: "West Islip", county: "suffolk", lat: 40.7062, lng: -73.3068, zips: ["11795"] },
  { name: "Hauppauge", county: "suffolk", lat: 40.8254, lng: -73.2026, zips: ["11788"] },
  { name: "Centereach", county: "suffolk", lat: 40.8584, lng: -73.0996, zips: ["11720"] },
  { name: "Massapequa", county: "nassau", lat: 40.6807, lng: -73.4737, zips: ["11758"] },
  { name: "Levittown", county: "nassau", lat: 40.7260, lng: -73.5143, zips: ["11756"] },
  { name: "Hicksville", county: "nassau", lat: 40.7682, lng: -73.5249, zips: ["11801"] },
  { name: "Garden City", county: "nassau", lat: 40.7268, lng: -73.6343, zips: ["11530"] },
  { name: "Freeport", county: "nassau", lat: 40.6576, lng: -73.5832, zips: ["11520"] },
  { name: "Rockville Centre", county: "nassau", lat: 40.6587, lng: -73.6410, zips: ["11570"] },
  { name: "Mineola", county: "nassau", lat: 40.7490, lng: -73.6410, zips: ["11501"] },
  { name: "Great Neck", county: "nassau", lat: 40.8007, lng: -73.7285, zips: ["11021"] },
  { name: "Manhasset", county: "nassau", lat: 40.7976, lng: -73.7001, zips: ["11030"] },
  { name: "Syosset", county: "nassau", lat: 40.8265, lng: -73.5001, zips: ["11791"] },
  { name: "Bethpage", county: "nassau", lat: 40.7437, lng: -73.4832, zips: ["11714"] },
  { name: "Wantagh", county: "nassau", lat: 40.6837, lng: -73.5101, zips: ["11793"] },
  { name: "Merrick", county: "nassau", lat: 40.6626, lng: -73.5515, zips: ["11566"] },
  { name: "Long Beach", county: "nassau", lat: 40.5884, lng: -73.6579, zips: ["11561"] },
  { name: "Oyster Bay", county: "nassau", lat: 40.8654, lng: -73.5318, zips: ["11771"] },
] as const;

/**
 * LIRR Branches and major stations.
 * Used for the LIRR Tracker feature and onboarding station picker.
 */
export const LIRR_BRANCHES = [
  {
    name: "Babylon Branch",
    stations: ["Jamaica", "St. Albans", "Lynbrook", "Rockville Centre", "Baldwin", "Freeport", "Merrick", "Bellmore", "Wantagh", "Seaford", "Massapequa", "Massapequa Park", "Amityville", "Copiague", "Lindenhurst", "Babylon"],
  },
  {
    name: "Ronkonkoma Branch",
    stations: ["Jamaica", "Mineola", "Hicksville", "Bethpage", "Farmingdale", "Pinelawn", "Wyandanch", "Deer Park", "Brentwood", "Central Islip", "Ronkonkoma"],
  },
  {
    name: "Port Jefferson Branch",
    stations: ["Hicksville", "Syosset", "Cold Spring Harbor", "Huntington", "Greenlawn", "Northport", "Kings Park", "Smithtown", "St. James", "Stony Brook", "Port Jefferson"],
  },
  {
    name: "Montauk Branch",
    stations: ["Jamaica", "Babylon", "Bay Shore", "Islip", "Great River", "Oakdale", "Sayville", "Patchogue", "Bellport", "Mastic-Shirley", "Speonk", "Westhampton", "Hampton Bays", "Southampton", "Bridgehampton", "East Hampton", "Amagansett", "Montauk"],
  },
  {
    name: "Oyster Bay Branch",
    stations: ["Jamaica", "Mineola", "East Williston", "Albertson", "Roslyn", "Greenvale", "Glen Head", "Sea Cliff", "Glen Street", "Glen Cove", "Locust Valley", "Oyster Bay"],
  },
  {
    name: "Long Beach Branch",
    stations: ["Jamaica", "Lynbrook", "Centre Avenue", "East Rockaway", "Oceanside", "Island Park", "Long Beach"],
  },
  {
    name: "Hempstead Branch",
    stations: ["Jamaica", "Floral Park", "Bellerose", "Queens Village", "Hollis", "St. Albans", "West Hempstead", "Hempstead"],
  },
  {
    name: "Far Rockaway Branch",
    stations: ["Jamaica", "Locust Manor", "Laurelton", "Rosedale", "Valley Stream", "Gibson", "Hewlett", "Woodmere", "Cedarhurst", "Lawrence", "Inwood", "Far Rockaway"],
  },
] as const;

/**
 * Weather zones — Long Island has microclimates that can vary
 * 10+ degrees from one end to the other.
 */
export const WEATHER_ZONES = [
  { id: "south_shore", name: "South Shore", description: "Atlantic coast beaches" },
  { id: "north_shore", name: "North Shore", description: "Long Island Sound coast" },
  { id: "central_li", name: "Central LI", description: "Interior communities" },
  { id: "north_fork", name: "North Fork", description: "Wine country" },
  { id: "south_fork", name: "South Fork", description: "The Hamptons" },
  { id: "fire_island", name: "Fire Island", description: "Barrier island" },
  { id: "jones_beach", name: "Jones Beach", description: "State park beaches" },
] as const;
