import { SECTOR_FILTER_TO_GPC } from "./chile-regions";
import type { ChileComuna } from "./types";

export interface ComunaFilters {
  query: string;
  region: string;
  sector: string;
  poolStatus: string;
  fiscal: string;
}

export function filterComunas(comunas: ChileComuna[], filters: ComunaFilters): ChileComuna[] {
  const q = filters.query.toLowerCase().trim();
  const gpc = filters.sector ? SECTOR_FILTER_TO_GPC[filters.sector] : "";

  return comunas.filter((c) => {
    const matchQ =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.locode.toLowerCase().includes(q);
    const matchRegion = !filters.region || c.region === filters.region;
    const matchSector = !gpc || c.salientSectors.includes(gpc);
    const matchPool = !filters.poolStatus || c.poolStatus === filters.poolStatus;
    const fiscalLetter = c.fiscalBand.charAt(0);
    const matchFiscal = !filters.fiscal || fiscalLetter === filters.fiscal;
    return matchQ && matchRegion && matchSector && matchPool && matchFiscal;
  });
}

export function similarComunas(comuna: ChileComuna, all: ChileComuna[], limit = 3): ChileComuna[] {
  return all
    .filter(
      (c) =>
        c.locode !== comuna.locode &&
        (c.region === comuna.region ||
          c.unitId === comuna.unitId ||
          c.salientSectors.some((s) => comuna.salientSectors.includes(s))),
    )
    .slice(0, limit);
}
