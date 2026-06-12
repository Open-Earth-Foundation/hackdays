"use client";

import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { City } from "../data/types";

function FlyTo({ city }: { city: City | null }) {
  const map = useMap();
  useEffect(() => {
    if (city) map.flyTo([city.lat, city.lng], 5, { duration: 0.8 });
  }, [city, map]);
  return null;
}

export default function CityMap({
  cities,
  selectedId,
  onSelect,
}: {
  cities: City[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selected = cities.find((c) => c.id === selectedId) ?? null;

  return (
    <MapContainer
      center={[5, -20]}
      zoom={2}
      minZoom={2}
      scrollWheelZoom={false}
      worldCopyJump
      style={{ height: "100%", width: "100%", borderRadius: 14 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyTo city={selected} />
      {cities.map((c) => {
        const active = c.id === selectedId;
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={active ? 9 : 6}
            pathOptions={{
              color: "#fff",
              weight: active ? 2 : 1,
              fillColor: active ? "#0f766e" : "#14b8a6",
              fillOpacity: active ? 1 : 0.8,
            }}
            eventHandlers={{ click: () => onSelect(c.id) }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={1}>
              <strong>{c.name}</strong>, {c.country}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
