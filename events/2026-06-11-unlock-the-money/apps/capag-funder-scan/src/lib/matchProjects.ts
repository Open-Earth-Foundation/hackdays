// Rule-based retrieval of comparable funded projects for a city.
// No LLM: deterministic, weighted scoring over the curated project set so the demo can't drift,
// and every match exposes *why* it matched (see `.why`).

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
  sectors: { code: string; share: number }[]; // emission sectors with their share of city total
  hazards: { key: string; score: number }[]; // CCRA hazards with normalized score
};

export type MatchedProject = Project & { score: number; why: string[] };

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

const HIGH_RISK = 0.5;
// a high climate risk contributes at most this much weight — below a dominant emission sector,
// so a city's main emissions source drives the match, with risk as a secondary signal.
const RISK_CAP = 0.5;
// minimum emission share for a sector to count — drops 1%-of-total noise sectors
const MIN_SECTOR_SHARE = 0.1;
// a project must clear this combined weight to be shown at all
const SCORE_FLOOR = 0.4;

function instrumentFitsCapag(instrument: string, capag: string): boolean {
  const tokens = instrument.split(";").map((s) => s.trim());
  const loanLike = ["Loan", "PPP / Concession", "Private / PPP", "Equity Investment", "Public Works", "Municipal / Subnational Budget"];
  const grantLike = ["Grant / Technical Assistance", "Climate / Carbon Finance", "Municipal / Subnational Budget"];
  const has = (list: string[]) => tokens.some((tk) => list.includes(tk));
  if (capag === "n.d." || capag === "n.e." || capag === "D") return has(grantLike);
  if (["A+", "A", "B+", "B"].includes(capag)) return has(loanLike) || tokens.includes("Climate / Carbon Finance");
  return has(grantLike); // CAPAG C
}

export function matchProjects(projects: Project[], city: CityProfile, limit = 4): MatchedProject[] {
  // build a weight per project-sector category: max of (emission share) and (capped risk score)
  // that maps onto it, plus a label of where the weight came from for transparency.
  const weight: Record<string, number> = {};
  const source: Record<string, string> = {};
  const bump = (cat: string, w: number, label: string) => {
    if (w > (weight[cat] ?? 0)) {
      weight[cat] = w;
      source[cat] = label;
    }
  };
  for (const s of city.sectors) {
    if (s.share < MIN_SECTOR_SHARE) continue;
    for (const cat of SECTOR_TO_PROJECT[s.code] ?? []) bump(cat, s.share, `${s.code} emissions`);
  }
  for (const h of city.hazards) {
    if (h.score < HIGH_RISK) continue;
    for (const cat of HAZARD_TO_PROJECT[h.key] ?? []) bump(cat, Math.min(h.score, RISK_CAP), `${h.key} risk`);
  }

  const scored = projects.map((p) => {
    let score = 0;
    const matchedCats: string[] = [];
    for (const cat of p.sectors) {
      if (weight[cat]) {
        score += weight[cat];
        matchedCats.push(cat);
      }
    }
    const why: string[] = [];
    if (matchedCats.length) {
      // dedupe the "source" labels (e.g. "V emissions", "droughts risk")
      const reasons = Array.from(new Set(matchedCats.map((c) => source[c])));
      why.push(...reasons);
    }
    if (instrumentFitsCapag(p.instrument, city.capag)) {
      score += 0.4;
      why.push(`instrument fits CAPAG ${city.capag}`);
    }
    if (p.country === "Brazil") score += 0.25;
    if (p.status === "Under implementation / Operational" || p.status === "Completed") score += 0.15;
    return { ...p, score, why, _hasSectorMatch: matchedCats.length > 0 };
  });

  return scored
    .filter((p) => p._hasSectorMatch && p.score >= SCORE_FLOOR)
    .sort((a, b) => b.score - a.score || (b.amountUsd ?? 0) - (a.amountUsd ?? 0))
    .slice(0, limit)
    .map(({ _hasSectorMatch, ...p }) => p);
}
