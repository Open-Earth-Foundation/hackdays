// Per-city prioritization of the HIAP action library.
//
// CityCatalyst's climate_actions are city-agnostic; we rank them for a given
// city by matching adaptation actions to the city's top CCRA hazards and
// mitigation actions to its dominant emitting sectors (GHGI). Pure + deterministic.

import type { City, RiskLevel } from "../data/types";
import type {
  ClimateAction,
  HazardKey,
  GhgSectorKey,
  Effectiveness,
} from "../data/climateActions";
import { normalizeHazard, normalizeSector } from "./hazardNormalize";

export type SourceSignal = {
  kind: "hazard" | "sector";
  cityValue: string; // e.g. "Heatwaves (Very High)" or "Transportation (81%)"
  matchedOn: string; // the canonical key the action matched on
  weight: number; // contribution to the score (for an honest "why")
};

export type RankedAction = {
  action: ClimateAction;
  score: number;
  sourceSignals: SourceSignal[];
};

const RISK_WEIGHT: Record<RiskLevel, number> = {
  "Very High": 1.0,
  High: 0.75,
  Medium: 0.45,
  Low: 0.2,
};

const EFF_SCORE: Record<Effectiveness, number> = { high: 1, medium: 0.6, low: 0.3 };

function effScore(e: Effectiveness | null | undefined): number {
  return e ? EFF_SCORE[e] : 0.5; // unknown effectiveness → neutral midpoint
}

// "20-39" → 0.295 ; "80-100" → 0.9 ; null → 0
function ghgScore(range: string | null | undefined): number {
  if (!range) return 0;
  const m = range.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return 0;
  return (Number(m[1]) + Number(m[2])) / 2 / 100;
}

const SECTOR_LABEL: Record<GhgSectorKey, string> = {
  stationary_energy: "Stationary Energy",
  transportation: "Transportation",
  waste: "Waste",
  ippu: "IPPU",
  afolu: "AFOLU",
};

type HazardCtx = { key: HazardKey; level: RiskLevel; label: string };
type SectorCtx = { key: GhgSectorKey; share: number; label: string };

// Deduplicate by canonical key (several prose hazards can map to the same key),
// keeping the highest-severity context so each key is scored once.
function cityHazards(city: City): HazardCtx[] {
  const byKey = new Map<HazardKey, HazardCtx>();
  for (const h of city.risk?.topHazards ?? []) {
    for (const key of normalizeHazard(h.hazard)) {
      const prev = byKey.get(key);
      if (!prev || RISK_WEIGHT[h.level] > RISK_WEIGHT[prev.level]) {
        byKey.set(key, { key, level: h.level, label: h.hazard });
      }
    }
  }
  return [...byKey.values()];
}

function citySectors(city: City): SectorCtx[] {
  const e = city.emissions;
  if (!e) return [];
  const byKey = new Map<GhgSectorKey, SectorCtx>();
  if (e.sectors?.length) {
    for (const s of e.sectors) {
      const key = normalizeSector(s.sector);
      if (!key) continue;
      const prev = byKey.get(key);
      if (!prev || s.sharePct / 100 > prev.share) {
        byKey.set(key, { key, share: s.sharePct / 100, label: s.sector });
      }
    }
  } else if (e.topSector) {
    const key = normalizeSector(e.topSector);
    if (key) byKey.set(key, { key, share: 0.6, label: e.topSector });
  }
  return [...byKey.values()];
}

export function prioritizeActions(
  city: City,
  actions: ClimateAction[],
  opts: { topN?: number } = {}
): RankedAction[] {
  const topN = opts.topN ?? 6;
  const hazards = cityHazards(city);
  const sectors = citySectors(city);

  const ranked: RankedAction[] = [];

  for (const action of actions) {
    let score = 0;
    const signals: SourceSignal[] = [];

    if (action.actionType === "adaptation") {
      for (const h of hazards) {
        if (!action.hazards.includes(h.key)) continue;
        const eff = effScore(action.adaptationPerHazard?.[h.key] ?? action.adaptationEffectiveness);
        const contrib = RISK_WEIGHT[h.level] * eff;
        score += contrib;
        signals.push({
          kind: "hazard",
          cityValue: `${h.label} (${h.level})`,
          matchedOn: h.key,
          weight: contrib,
        });
      }
    } else {
      for (const s of sectors) {
        const ghg = action.ghgReductionPotential?.[s.key];
        const matchesSector = action.sectors.includes(s.key);
        if (ghg == null && !matchesSector) continue;
        const contrib = s.share * (ghgScore(ghg) || 0.5);
        score += contrib;
        signals.push({
          kind: "sector",
          cityValue: `${s.label} (${Math.round(s.share * 100)}%)`,
          matchedOn: s.key,
          weight: contrib,
        });
      }
    }

    if (score <= 0) continue;

    // Tie-breaker: reward the stakeholder-engagement co-benefit (the fundable signal).
    score += 0.05 * (action.coBenefits?.stakeholder_engagement ?? 0);

    ranked.push({ action, score, sourceSignals: signals });
  }

  ranked.sort((a, b) => b.score - a.score);

  // Balance the result so both adaptation (matches risks) and mitigation
  // (matches emissions) are represented — adaptation scores are on a larger
  // scale and would otherwise crowd out every mitigation action.
  const adapt = ranked.filter((r) => r.action.actionType === "adaptation");
  const mitig = ranked.filter((r) => r.action.actionType === "mitigation");
  const target = Math.ceil(topN / 2);
  const out = [...adapt.slice(0, target), ...mitig.slice(0, topN - target)];
  // Backfill if one type was short.
  if (out.length < topN) {
    const used = new Set(out);
    for (const r of ranked) {
      if (out.length >= topN) break;
      if (!used.has(r)) out.push(r);
    }
  }
  return out;
}
