"use client";

import { create } from "zustand";

/**
 * Filter store — manages active content filters across the app.
 *
 * When the user filters events by "family" or news by "nassau county,"
 * those filter choices are stored here so they persist across navigation
 * and can be shared between the map layers and the feed panels.
 */

export type EventCategory =
  | "all"
  | "family"
  | "nightlife"
  | "date_night"
  | "music"
  | "food"
  | "sports"
  | "outdoors"
  | "holiday";

export type PlaceContext =
  | "all"
  | "date_night"
  | "family_day"
  | "rainy_day"
  | "open_now";

export type NewsScope = "my_town" | "all_li" | "nassau" | "suffolk";

export type SafetySeverity = "all" | "low" | "medium" | "high" | "critical";

interface FilterState {
  // Which zip codes to filter content by (user's town filter)
  activeZipCodes: string[];

  // Event category filter
  eventCategory: EventCategory;

  // Place context filter (Date Night, Family Day, etc.)
  placeContext: PlaceContext;

  // News geographic scope
  newsScope: NewsScope;

  // Safety severity filter
  safetySeverity: SafetySeverity;

  // Search query (shared across features)
  searchQuery: string;

  // Actions
  setActiveZipCodes: (zips: string[]) => void;
  setEventCategory: (category: EventCategory) => void;
  setPlaceContext: (context: PlaceContext) => void;
  setNewsScope: (scope: NewsScope) => void;
  setSafetySeverity: (severity: SafetySeverity) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeZipCodes: [],
  eventCategory: "all",
  placeContext: "all",
  newsScope: "my_town",
  safetySeverity: "all",
  searchQuery: "",

  setActiveZipCodes: (zips) => set({ activeZipCodes: zips }),
  setEventCategory: (category) => set({ eventCategory: category }),
  setPlaceContext: (context) => set({ placeContext: context }),
  setNewsScope: (scope) => set({ newsScope: scope }),
  setSafetySeverity: (severity) => set({ safetySeverity: severity }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearFilters: () =>
    set({
      activeZipCodes: [],
      eventCategory: "all",
      placeContext: "all",
      newsScope: "my_town",
      safetySeverity: "all",
      searchQuery: "",
    }),
}));
