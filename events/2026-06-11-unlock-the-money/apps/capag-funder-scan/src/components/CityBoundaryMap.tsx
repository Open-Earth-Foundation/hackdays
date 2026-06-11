"use client";

import { useEffect } from "react";
import { CircleMarker, GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Geometry } from "geojson";

// Small read-only locator map for the selected city, shown inside the city panel.
function Fit({ boundary, center }: { boundary: Geometry | null; center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (boundary) {
      const b = L.geoJSON(boundary).getBounds();
      if (b.isValid()) {
        map.fitBounds(b, { padding: [16, 16], maxZoom: 11 });
        return;
      }
    }
    if (center) map.setView(center, 9);
  }, [boundary, center, map]);
  return null;
}

export default function CityBoundaryMap({
  boundary,
  center,
}: {
  boundary: Geometry | null;
  center: [number, number] | null;
}) {
  return (
    <MapContainer
      center={center ?? [-14.5, -53]}
      zoom={center ? 9 : 4}
      style={{ height: "100%", width: "100%", background: "#E8EAFB" }}
      preferCanvas
      attributionControl={false}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <Fit boundary={boundary} center={center} />
      {boundary ? (
        <GeoJSON data={boundary} style={{ color: "#2351DC", weight: 2, fillColor: "#2351DC", fillOpacity: 0.15 }} />
      ) : (
        center && (
          <CircleMarker
            center={center}
            radius={6}
            pathOptions={{ color: "#FFFFFF", weight: 1.5, fillColor: "#2351DC", fillOpacity: 0.9 }}
          />
        )
      )}
    </MapContainer>
  );
}
