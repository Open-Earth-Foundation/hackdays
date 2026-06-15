let regionsCache: string[] | null = null;

export async function loadChileRegions(): Promise<string[]> {
  if (!regionsCache) {
    const res = await fetch("/data/chile-regions.json");
    if (!res.ok) throw new Error("Failed to load Chile regions");
    regionsCache = (await res.json()) as string[];
  }
  return regionsCache;
}

export function locodeToSlug(locode: string): string {
  return locode.replace(/\s+/g, "-");
}

export function slugToLocode(slug: string): string {
  return slug.replace(/-/g, " ");
}

const GPC_LABELS: Record<string, string> = {
  waste: "Waste",
  transportation: "Transport",
  stationary_energy: "Energy",
  afolu: "AFOLU",
  ippu: "IPPU",
};

export function sectorLabels(sectors: string[]): string[] {
  return sectors.map((s) => GPC_LABELS[s] ?? s);
}

export const SECTOR_FILTER_TO_GPC: Record<string, string> = {
  "Transport & mobility": "transportation",
  "Energy transition": "stationary_energy",
  "Waste management": "waste",
  "Water & sanitation": "water",
  "Urban resilience": "cross_sector",
  "Nature-based solutions": "afolu",
  "Buildings & housing": "stationary_energy",
  "Air quality": "ippu",
};
