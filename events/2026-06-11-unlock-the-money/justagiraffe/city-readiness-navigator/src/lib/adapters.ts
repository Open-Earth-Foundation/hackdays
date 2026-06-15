// Fiscal Data Adapter layer — normalizes country-specific fiscal sources into the
// readiness model, keyed by city id (locode / IBGE). Chile = SINIM/FCM (via the
// City-Funder Matching Engine); Brazil = CAPAG (Tesouro Nacional). New countries
// add an adapter without touching the rest of the app.
import { SM, type Comuna, type Scored } from "./engine";
import clData from "@/data/valdivia.json";
import brData from "@/data/brazil.json";

export interface Scope {
  id: string;
  country: string;
  region: string;
  adapter: string; // the fiscal data source
  center: [number, number];
  zoom: number;
  tierKind: "readiness" | "capag";
}

export const SCOPES: Scope[] = [
  { id: "cl-losrios", country: "Chile", region: "Los Ríos", adapter: "SINIM / FCM", center: [-39.85, -72.9], zoom: 8, tierKind: "readiness" },
  { id: "br-rs", country: "Brazil", region: "Rio Grande do Sul", adapter: "CAPAG (Tesouro Nacional)", center: [-29.7, -53.2], zoom: 6, tierKind: "capag" },
];

// Approx coordinates for the Chilean unit-11 comunas (by locode, name fallback).
const CL_COORDS: Record<string, [number, number]> = {
  "CL ZAL": [-39.814, -73.246], "CL PAO": [-40.069, -72.872], "CL LLG": [-39.851, -72.831],
  "CL CRR": [-39.887, -73.43], "CL MAF": [-39.665, -72.949], Mariquina: [-39.526, -72.969],
};

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  tier: string;          // readiness tier OR capag tier
  tierClass: string;     // css class for color
  isHero: boolean;
  capag?: string | null;
  journeyable: boolean;  // can you enter the journey for this city?
}

const clComunas = (clData as any).comunas as Comuna[];
const brHero = (brData as any).hero as Comuna;
const brStateMap = (brData as any).stateMap as any[];

function readinessTierClass(t: string) {
  return t; // "Ready" | "Developing" | "Early" map to css .tier.<t>
}

export function mapPoints(scopeId: string): MapPoint[] {
  if (scopeId === "cl-losrios") {
    return clComunas
      .map((c) => {
        const co = CL_COORDS[c.locode || ""] || CL_COORDS[c.name];
        if (!co) return null;
        const s = SM.scoreSNG(c);
        return { id: c.id, name: c.name, lat: co[0], lon: co[1], tier: s.tier, tierClass: readinessTierClass(s.tier), isHero: c.isAnchor, journeyable: c.isAnchor };
      })
      .filter(Boolean) as MapPoint[];
  }
  // Brazil — CAPAG tiers across RS (cheap; uses precomputed tier, only hero is journeyable)
  return brStateMap.map((m) => ({
    id: `SNG-BR-${m.codIbge}`, name: m.name, lat: m.lat, lon: m.lon,
    tier: m.tier, tierClass: m.tier, isHero: m.isHero, capag: m.capag, journeyable: m.isHero,
  }));
}

export function scopeLegend(scopeId: string): { cls: string; label: string }[] {
  if (scopeId === "cl-losrios")
    return [
      { cls: "Ready", label: "Ready" },
      { cls: "Developing", label: "Developing" },
      { cls: "Early", label: "Early" },
    ];
  const lg = (brData as any).legend as any[];
  return lg.map((l) => ({ cls: l.tier, label: l.label }));
}

// The cities you can actually run the journey for (have full readiness detail).
export function journeyCity(cityId: string): Scored | null {
  const c = clComunas.find((x) => x.id === cityId) || (brHero.id === cityId ? brHero : null);
  return c ? SM.scoreSNG(c) : null;
}

export function heroFor(scopeId: string): Scored {
  return scopeId === "br-rs" ? SM.scoreSNG(brHero) : SM.scoreSNG(clComunas.find((c) => c.isAnchor)!);
}

export const DATA = { cl: clData as any, br: brData as any };
