"use client";

import { useRef, useCallback } from "react";
import Map, { NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import { useMapStore } from "@/stores/mapStore";
import { MAPBOX_CONFIG } from "@/lib/mapbox/config";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * MapCanvas — the core Mapbox map component.
 *
 * This is the heart of the entire app. It renders a full-screen interactive
 * map of Long Island using Mapbox GL JS. Everything else (panels, cards,
 * navigation) sits on top of this map.
 *
 * The map uses a dark style by default to match the Deep Ocean palette.
 * It's constrained to Long Island's bounding box so users can't scroll
 * away to Antarctica.
 */
export default function MapCanvas() {
  const mapRef = useRef(null);
  const { viewport, setViewport } = useMapStore();

  const handleMove = useCallback(
    (evt: { viewState: { latitude: number; longitude: number; zoom: number } }) => {
      setViewport({
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
      });
    },
    [setViewport]
  );

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_CONFIG.accessToken}
      initialViewState={{
        latitude: viewport.latitude,
        longitude: viewport.longitude,
        zoom: viewport.zoom,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAPBOX_CONFIG.style}
      maxBounds={MAPBOX_CONFIG.maxBounds as [[number, number], [number, number]]}
      minZoom={MAPBOX_CONFIG.minZoom}
      maxZoom={MAPBOX_CONFIG.maxZoom}
      onMove={handleMove}
      attributionControl={false}
    >
      {/* Zoom +/- buttons — positioned top-right */}
      <NavigationControl position="top-right" showCompass={false} />

      {/* "Locate me" button — uses GPS to center on user's position */}
      <GeolocateControl
        position="top-right"
        trackUserLocation
        showUserHeading
      />
    </Map>
  );
}
