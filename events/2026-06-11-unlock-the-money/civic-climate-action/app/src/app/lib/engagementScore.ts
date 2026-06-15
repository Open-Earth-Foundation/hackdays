// Civic Engagement Readiness — a transparent, per-city prototype index that turns
// a funder's hardest question ("is this city engaged?") into a visible, sourced
// number. NO black box: every input and its point contribution is exposed.
//
// Inputs (all already in the repo):
//   - Resident commitments (pledges, captured via /api/pledge)
//   - Engagement co-benefit of the city's top actions (HIAP stakeholder_engagement,
//     the signal funders already score, −2..+2)
//   - Local civic infrastructure (curated official/community channels)
//   - Proven precedent (matched real success stories)

import type { City } from "../data/types";
import type { Lang as L } from "../data/climateActions";
import { climateActions } from "../data/climateActions";
import { prioritizeActions } from "./prioritize";
import { localSourcesByCity } from "../data/localSources";
import { matchStories } from "./matchStories";
import { stories } from "../data/stories";

export type ReadinessBand = "Emerging" | "Developing" | "Strong";

export type ReadinessInput = {
  label: Record<L, string>;
  value: string;
  contribution: number; // points out of `weight`
  weight: number;
};

export type Readiness = {
  score: number; // 0-100
  band: ReadinessBand;
  inputs: ReadinessInput[];
  pledgeCount: number;
  coBenefitAvg: number; // −2..+2
};

const WEIGHTS = { pledges: 40, coBenefit: 25, infra: 20, precedent: 15 };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function engagementReadiness(city: City, pledgeCount: number): Readiness {
  const ranked = prioritizeActions(city, climateActions, { topN: 6 });

  // 1. Participation — log-scaled (≈200 pledges saturates).
  const pledgeScore = clamp01(Math.log10(pledgeCount + 1) / Math.log10(201));

  // 2. Engagement co-benefit of the prioritized actions (−2..+2 → 0..1).
  const seVals = ranked.map((r) => r.action.coBenefits?.stakeholder_engagement ?? 0);
  const coBenefitAvg = mean(seVals);
  const coBenefitScore = clamp01((coBenefitAvg + 2) / 4);

  // 3. Local civic infrastructure (official weighted higher).
  const srcs = localSourcesByCity[city.id] ?? [];
  const official = srcs.filter((s) => s.type === "official").length;
  const community = srcs.length - official;
  const infraScore = clamp01((official + community * 0.5) / 6);

  // 4. Proven precedent — distinct success stories matched across the top actions.
  const matched = new Set<string>();
  for (const r of ranked.slice(0, 3)) {
    for (const s of matchStories(r.action, stories)) matched.add(s.id);
  }
  const precedent = matched.size;
  const precedentScore = clamp01(precedent / 4);

  const inputs: ReadinessInput[] = [
    {
      label: { en: "Resident commitments", es: "Compromisos de residentes", pt: "Compromissos de moradores" },
      value: `${pledgeCount}`,
      contribution: Math.round(WEIGHTS.pledges * pledgeScore),
      weight: WEIGHTS.pledges,
    },
    {
      label: {
        en: "Engagement co-benefit of top actions",
        es: "Co-beneficio de participación de las acciones",
        pt: "Co-benefício de participação das ações",
      },
      value: `${coBenefitAvg >= 0 ? "+" : ""}${coBenefitAvg.toFixed(1)} / +2`,
      contribution: Math.round(WEIGHTS.coBenefit * coBenefitScore),
      weight: WEIGHTS.coBenefit,
    },
    {
      label: { en: "Local civic channels", es: "Canales cívicos locales", pt: "Canais cívicos locais" },
      value: `${official} official · ${community} community`,
      contribution: Math.round(WEIGHTS.infra * infraScore),
      weight: WEIGHTS.infra,
    },
    {
      label: { en: "Proven precedent", es: "Precedentes probados", pt: "Precedentes comprovados" },
      value: `${precedent} ${precedent === 1 ? "story" : "stories"}`,
      contribution: Math.round(WEIGHTS.precedent * precedentScore),
      weight: WEIGHTS.precedent,
    },
  ];

  const score = inputs.reduce((a, i) => a + i.contribution, 0);
  const band: ReadinessBand = score >= 66 ? "Strong" : score >= 40 ? "Developing" : "Emerging";

  return { score, band, inputs, pledgeCount, coBenefitAvg };
}
