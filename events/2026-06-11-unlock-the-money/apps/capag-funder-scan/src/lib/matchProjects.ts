// Rule-based retrieval of comparable funded projects for a city.
// No LLM: deterministic scoring over the curated project set, so the demo can't drift.

export type Project = {
  id: number;
  city: string;
  state: string;
  country: string;
  title: string;
  typeOfAction: string;
  sectors: string[];
  instrument: string;
  amountUsd: number | null;
  funders: string[];
  status: string;
  summary: string;
  source: string;
  coords: [number, number] | null;
};

export type CityProfile = {
  capag: string;
  topSectors: string[]; // GPC sector codes from emissions, e.g. ["II","I"]
  highHazards: string[]; // hazard keys with score >= 0.5, e.g. ["floods","heatwaves"]
};

// GPC emission sector code -> project Sector (Categorical) vocabulary
const SECTOR_TO_PROJECT: Record<string, string[]> = {
  I: ["Energy"],
  II: ["Transport"],
  III: ["Solid Waste & Circular Economy", "Water & Sanitation / Water Management"],
  IV: ["Energy"],
  V: ["Environment & Nature-based Solutions"],
};

// climate hazard -> project Sector (Categorical) that addresses it
const HAZARD_TO_PROJECT: Record<string, string[]> = {
  floods: ["Resilience & Disaster Risk Management", "Water & Sanitation / Water Management"],
  landslides: ["Resilience & Disaster Risk Management", "Urban Development & Housing"],
  droughts: ["Water & Sanitation / Water Management", "Environment & Nature-based Solutions"],
  heatwaves: ["Environment & Nature-based Solutions"],
  diseases: ["Water & Sanitation / Water Management"],
  "sea-level-rise": ["Resilience & Disaster Risk Management", "Environment & Nature-based Solutions"],
};

// which instruments fit which CAPAG tiers (creditworthiness gates the financing channel)
function instrumentFitsCapag(instrument: string, capag: string): boolean {
  const bankable = ["A+", "A", "B+", "B"].includes(capag);
  const loanLike = ["Loan", "PPP / Concession", "Private / PPP", "Equity Investment"].includes(instrument);
  const grantLike = ["Grant / Technical Assistance", "Climate / Carbon Finance", "Municipal / Subnational Budget"].includes(instrument);
  if (capag === "n.d." || capag === "n.e." || capag === "D") return grantLike;
  if (bankable) return loanLike || instrument === "Climate / Carbon Finance";
  return grantLike; // CAPAG C
}

export function matchProjects(projects: Project[], city: CityProfile, limit = 4): (Project & { score: number; why: string[] })[] {
  const wantSectors = new Set<string>();
  for (const s of city.topSectors) (SECTOR_TO_PROJECT[s] ?? []).forEach((p) => wantSectors.add(p));
  for (const h of city.highHazards) (HAZARD_TO_PROJECT[h] ?? []).forEach((p) => wantSectors.add(p));

  const scored = projects.map((p) => {
    let score = 0;
    const why: string[] = [];

    const sectorHits = p.sectors.filter((s) => wantSectors.has(s));
    if (sectorHits.length) {
      score += sectorHits.length * 3;
      why.push(`sector match: ${sectorHits.join(", ")}`);
    }
    if (instrumentFitsCapag(p.instrument, city.capag)) {
      score += 2;
      why.push(`instrument fits CAPAG ${city.capag}: ${p.instrument}`);
    }
    if (p.country === "Brazil") {
      score += 1;
      why.push("Brazilian precedent");
    }
    if (p.status === "Under implementation / Operational" || p.status === "Completed") {
      score += 1; // proven, not just approved
    }
    return { ...p, score, why };
  });

  return scored
    .filter((p) => p.score >= 3) // require at least a sector match
    .sort((a, b) => b.score - a.score || (b.amountUsd ?? 0) - (a.amountUsd ?? 0))
    .slice(0, limit);
}
