"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { FunderReadout } from "../lib/pledgeStore";
import { neighborhoodCoords } from "../data/poaNeighborhoods";
import type { MapPoint } from "./PoaMapInner";

// Leaflet touches `window`, so the map must not server-render.
const PoaMapInner = dynamic(() => import("./PoaMapInner"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "grid", placeItems: "center", background: "var(--bg-soft)", borderRadius: 14, color: "var(--ink-faint)" }}>
      Loading map…
    </div>
  ),
});

export default function PoaEngagementMap({ height = 360 }: { height?: number }) {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/funders?city=porto-alegre")
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          const readout: FunderReadout | undefined = d.readout;
          const pts: MapPoint[] = (readout?.byNeighborhood ?? [])
            .map((h) => {
              const c = neighborhoodCoords(h.name);
              return c ? { name: h.name, lat: c[0], lng: c[1], count: h.count } : null;
            })
            .filter((p): p is MapPoint => p !== null);
          setPoints(pts);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <div>
      <div style={{ height, border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        <PoaMapInner points={points} />
      </div>
      <p style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: "0.6rem" }}>
        {loaded && points.length === 0
          ? "No mappable neighborhoods recorded yet."
          : "Circle size = signed commitments per neighborhood. Map © OpenStreetMap, CARTO."}
      </p>
    </div>
  );
}
