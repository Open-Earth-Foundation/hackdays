"use client";

import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { POA_CENTER } from "../data/poaNeighborhoods";

export type MapPoint = { name: string; lat: number; lng: number; count: number };

export default function PoaMapInner({ points }: { points: MapPoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.count));

  return (
    <MapContainer
      center={POA_CENTER}
      zoom={11}
      minZoom={10}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: 14 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={p.name}
          center={[p.lat, p.lng]}
          radius={8 + (p.count / max) * 22}
          pathOptions={{ color: "#fff", weight: 1.5, fillColor: "#0f766e", fillOpacity: 0.65 }}
        >
          <Tooltip direction="top" offset={[0, -4]} opacity={1}>
            <strong>{p.name}</strong> · {p.count} commitment{p.count === 1 ? "" : "s"}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
