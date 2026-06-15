import type { CityRecord } from "./types";
import { cities } from "./cities";

export interface CityFilters {
  query: string;
  region: string;
  sector: string;
  impact: string;
  risk: string;
}

export function filterCities(filters: CityFilters): CityRecord[] {
  const q = filters.query.toLowerCase();
  return cities.filter((c) => {
    const matchQ =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q);
    const matchRegion = !filters.region || c.region === filters.region;
    const matchSector = !filters.sector || c.sector === filters.sector;
    const matchImpact = !filters.impact || c.impact === filters.impact;
    const matchRisk = !filters.risk || c.risk === filters.risk;
    return matchQ && matchRegion && matchSector && matchImpact && matchRisk;
  });
}

export function similarCities(city: CityRecord, limit = 3): CityRecord[] {
  return cities
    .filter(
      (ci) =>
        ci.id !== city.id &&
        (ci.region === city.region || ci.sector === city.sector || ci.impact === city.impact)
    )
    .slice(0, limit);
}
