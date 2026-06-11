import type { Geometry } from "geojson";

export type CityData = {
  total: number;
  sectors: { code: string; co2eq: number; share: number; sources: string[] }[];
  hazards: { hazard: string; score: number }[];
  boundary: Geometry | null;
  context: {
    area?: number | null;
    region?: string | null;
    regionName?: string | null;
    biome?: string | null;
    populationSize?: number | null;
  } | null;
};
