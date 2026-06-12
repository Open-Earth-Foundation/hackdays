"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, TileLayer, useMap } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Mode = "national" | "losrios";

const NATIONAL_COLORS: Record<string, string> = {
  anchor: "#001ea7",
  "in viable pool": "#4f75e0",
  "needs TA": "#e08a3c",
  "not scored": "#d7d8fa",
};
const LOSRIOS_COLORS: Record<string, string> = {
  anchor: "#001ea7",
  "pool member": "#4f75e0",
  other: "#d7d8fa",
};

function FitBounds({ data }: { data: FeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    const layer = L.geoJSON(data);
    const b = layer.getBounds();
    if (b.isValid()) map.fitBounds(b, { padding: [16, 16] });
  }, [data, map]);
  return null;
}

export default function ChoroplethMap({
  url,
  mode,
  height = 460,
}: {
  url: string;
  mode: Mode;
  height?: number;
}) {
  const [data, setData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(url)
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, [url]);

  const colorFor = (f?: Feature<Geometry>) => {
    const p = (f?.properties ?? {}) as Record<string, string>;
    if (mode === "national") return NATIONAL_COLORS[p.pool_status] ?? "#d7d8fa";
    return LOSRIOS_COLORS[p.pool_role] ?? "#d7d8fa";
  };

  if (!data) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4fd",
          color: "#7a7b9a",
        }}
      >
        Loading map…
      </div>
    );
  }

  return (
    <MapContainer
      style={{ height, width: "100%" }}
      zoomControl={mode === "losrios"}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <FitBounds data={data} />
      <GeoJSON
        data={data}
        style={(f) => ({
          fillColor: colorFor(f as Feature<Geometry>),
          fillOpacity: 0.9,
          color: "#ffffff",
          weight: 0.7,
        })}
        onEachFeature={(feature, layer) => {
          const p = feature.properties as Record<string, string | number | boolean>;
          const status = mode === "national" ? p.pool_status : p.pool_role;
          const cf =
            p.cofinance_score != null
              ? `<br/>co-finance: <b>${p.cofinance_score}</b>`
              : "";
          layer.bindTooltip(
            `<b>${p.comuna}</b><br/>${status}${cf}`,
            { sticky: true, className: "map-tip" }
          );
          layer.on({
            mouseover: (e) => e.target.setStyle({ weight: 2, color: "#00001f", fillOpacity: 1 }),
            mouseout: (e) => e.target.setStyle({ weight: 0.7, color: "#ffffff", fillOpacity: 0.9 }),
          });
        }}
      />
    </MapContainer>
  );
}
