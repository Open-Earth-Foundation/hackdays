"use client";

import { useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { TIER_HEX } from "../lib/display";
import type { Row } from "./Explorer";

type Props = {
  rows: Row[];               // all cities (dimmed background)
  matchIbge: Set<string>;    // current filter matches (full color)
  hazards: Set<string>;      // selected risk chips — scale dot size by score
  onSelect: (row: Row) => void;
};

function riskScore(row: Row, hazards: Set<string>) {
  if (!row.risks || hazards.size === 0) return 0;
  let max = 0;
  for (const h of hazards) max = Math.max(max, row.risks[h] ?? 0);
  return max;
}

export default function CityMap({ rows, matchIbge, hazards, onSelect }: Props) {
  const placed = useMemo(() => rows.filter((r) => r.lat != null && r.lng != null), [rows]);

  return (
    <MapContainer
      center={[-14.5, -53]}
      zoom={4}
      style={{ height: 420, width: "100%", background: "#E8EAFB" }}
      preferCanvas
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {/* dimmed non-matches first so matches draw on top */}
      {placed.map((r) => {
        const match = matchIbge.has(r.ibge);
        if (match) return null;
        return (
          <CircleMarker
            key={r.ibge}
            center={[r.lat as number, r.lng as number]}
            radius={1.5}
            pathOptions={{ color: "#C5CBF5", fillColor: "#C5CBF5", fillOpacity: 0.4, weight: 0 }}
          />
        );
      })}
      {placed.map((r) => {
        if (!matchIbge.has(r.ibge)) return null;
        const score = riskScore(r, hazards);
        const radius = hazards.size > 0 ? 2 + score * 6 : 4;
        return (
          <CircleMarker
            key={r.ibge}
            center={[r.lat as number, r.lng as number]}
            radius={radius}
            pathOptions={{
              color: "#FFFFFF",
              weight: 0.8,
              fillColor: TIER_HEX[r.capag] ?? "#7A7B9A",
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect(r) }}
          >
            <Tooltip>
              {r.name} ({r.uf}) — CAPAG {r.capag}
              {hazards.size > 0 ? ` · risk ${(score * 100).toFixed(0)}` : ""}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
