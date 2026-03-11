"use client";

import { create } from "zustand";

/**
 * Map store — manages the state of the Mapbox map.
 *
 * Zustand is a state management library (think of it like a shared
 * whiteboard that any component can read from or write to). This store
 * tracks which map layers are visible, where the map is centered, and
 * what feature the user has selected.
 */

// All available map layers the user can toggle on/off
export type MapLayer =
  | "events"
  | "places"
  | "beaches"
  | "wineries"
  | "safety"
  | "sex-offenders"
  | "traffic-cams"
  | "garage-sales"
  | "tide-stations"
  | "outages"
  | "lirr-stations"
  | "incident-reports";

interface MapState {
  // Which layers are currently visible on the map
  activeLayers: MapLayer[];

  // Current map viewport (where the user is looking)
  viewport: {
    latitude: number;
    longitude: number;
    zoom: number;
  };

  // The feature (marker) the user has clicked on, if any
  selectedFeature: {
    type: string;
    id: string;
    coordinates: [number, number];
  } | null;

  // Whether to show the home zone circle
  showHomeZone: boolean;

  // Actions — functions to modify the state
  toggleLayer: (layer: MapLayer) => void;
  setViewport: (viewport: Partial<MapState["viewport"]>) => void;
  selectFeature: (feature: MapState["selectedFeature"]) => void;
  clearSelection: () => void;
  setShowHomeZone: (show: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  activeLayers: ["events"],
  viewport: {
    latitude: 40.75,
    longitude: -73.13,
    zoom: 9,
  },
  selectedFeature: null,
  showHomeZone: true,

  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: state.activeLayers.includes(layer)
        ? state.activeLayers.filter((l) => l !== layer)
        : [...state.activeLayers, layer],
    })),

  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  selectFeature: (feature) => set({ selectedFeature: feature }),
  clearSelection: () => set({ selectedFeature: null }),
  setShowHomeZone: (show) => set({ showHomeZone: show }),
}));
