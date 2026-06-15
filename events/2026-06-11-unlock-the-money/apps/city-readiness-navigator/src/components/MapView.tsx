"use client";

import { useEffect, useRef } from "react";
import type { MapPoint } from "@/lib/adapters";

const COLOR: Record<string, string> = {
  Ready: "#2ca36a", bankable: "#2ca36a",
  Developing: "#d9942a", constrained: "#d9942a",
  Early: "#cf4b41", unrated: "#9aa5b1",
};

export default function MapView({
  scopeId, points, center, zoom, onSelect,
}: {
  scopeId: string;
  points: MapPoint[];
  center: [number, number];
  zoom: number;
  onSelect: (id: string) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    function init() {
      const L = (window as any).L;
      if (!L) { setTimeout(init, 150); return; }
      if (cancelled) return;
      if (!mapRef.current && elRef.current) {
        mapRef.current = L.map(elRef.current, { scrollWheelZoom: false }).setView(center, zoom);
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: "© OpenStreetMap © CARTO", maxZoom: 19,
        }).addTo(mapRef.current);
      }
      const map = mapRef.current;
      map.setView(center, zoom);
      if (layerRef.current) { map.removeLayer(layerRef.current); }
      const group = L.layerGroup();
      for (const p of points) {
        const m = L.circleMarker([p.lat, p.lon], {
          radius: p.isHero ? 9 : 5,
          color: p.isHero ? "#0f172a" : "#ffffff",
          weight: p.isHero ? 2 : 1,
          fillColor: COLOR[p.tierClass] || "#9aa5b1",
          fillOpacity: 0.9,
        });
        const tag = p.capag ? `CAPAG ${p.capag}` : p.tier;
        m.bindTooltip(`<b>${p.name}</b><br/>${tag}${p.journeyable ? " · click to open" : ""}`, { direction: "top" });
        if (p.journeyable) m.on("click", () => onSelect(p.id));
        group.addLayer(m);
      }
      group.addTo(map);
      layerRef.current = group;
    }
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeId, points]);

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  return <div id="map" ref={elRef} />;
}
