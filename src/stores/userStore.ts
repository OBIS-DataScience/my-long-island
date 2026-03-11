"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * User store — manages the user's preferences and home zone.
 *
 * Uses Zustand's "persist" middleware, which saves the state to
 * localStorage. This means the user's settings survive page refreshes
 * and come back when they reopen the app — even before they sign in.
 */

export type UserMode = "local" | "tourist";

interface UserState {
  // Home zone — where the user lives
  homeZone: {
    latitude: number | null;
    longitude: number | null;
    radiusMiles: number;
    zip: string | null;
    hamlet: string | null;
  };

  // User's preferred LIRR station
  lirrStationId: string | null;

  // School district for school-related news/closings
  schoolDistrict: string | null;

  // Local vs Tourist mode — changes what content is prioritized
  mode: UserMode;

  // Display name (set during onboarding or from Supabase profile)
  displayName: string | null;

  // Whether user has completed the onboarding flow
  hasOnboarded: boolean;

  // Theme preference
  theme: "dark" | "light" | "system";

  // Actions
  setHomeZone: (zone: Partial<UserState["homeZone"]>) => void;
  setLirrStation: (stationId: string | null) => void;
  setSchoolDistrict: (district: string | null) => void;
  setMode: (mode: UserMode) => void;
  setDisplayName: (name: string) => void;
  completeOnboarding: () => void;
  setTheme: (theme: UserState["theme"]) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      homeZone: {
        latitude: null,
        longitude: null,
        radiusMiles: 5,
        zip: null,
        hamlet: null,
      },
      lirrStationId: null,
      schoolDistrict: null,
      mode: "local",
      displayName: null,
      hasOnboarded: false,
      theme: "dark",

      setHomeZone: (zone) =>
        set((state) => ({
          homeZone: { ...state.homeZone, ...zone },
        })),

      setLirrStation: (stationId) => set({ lirrStationId: stationId }),
      setSchoolDistrict: (district) => set({ schoolDistrict: district }),
      setMode: (mode) => set({ mode }),
      setDisplayName: (name) => set({ displayName: name }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "mli-user-preferences",
    }
  )
);
