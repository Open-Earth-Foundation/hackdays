// Assemble a one-page "Civic Engagement Readiness" brief for funders, purely
// from real app data + the transparent readiness score. STATIC (no LLM) so this
// headline funder artifact carries zero fabrication risk. English (the working
// language for MDB / IDB / philanthropy partners).

import type { City } from "../data/types";
import { climateActions } from "../data/climateActions";
import { prioritizeActions } from "./prioritize";
import { localSourcesByCity } from "../data/localSources";
import { matchStories } from "./matchStories";
import { stories } from "../data/stories";
import type { Readiness } from "./engagementScore";

export function funderBrief(city: City, readiness: Readiness): string {
  const ranked = prioritizeActions(city, climateActions, { topN: 6 });
  const topActions = ranked.slice(0, 3);

  const matched = new Map<string, (typeof stories)[number]>();
  for (const r of topActions) for (const s of matchStories(r.action, stories)) matched.set(s.id, s);

  const srcs = localSourcesByCity[city.id] ?? [];

  const rows = readiness.inputs
    .map((i) => `| ${i.label.en} | ${i.value} | ${i.contribution} / ${i.weight} |`)
    .join("\n");

  const actionLines = topActions
    .map((r) => {
      const se = r.action.coBenefits?.stakeholder_engagement ?? 0;
      return `- **${r.action.name.en}** — engagement co-benefit ${se >= 0 ? "+" : ""}${se} / +2`;
    })
    .join("\n");

  const channelLines = srcs.length
    ? srcs.map((s) => `- ${s.name} (${s.type}) — ${s.url}`).join("\n")
    : "- (none curated yet)";

  const storyLines = matched.size
    ? [...matched.values()].map((s) => `- ${s.title} — ${s.city}, ${s.country} (${s.sourceName})`).join("\n")
    : "- (no close precedent matched)";

  return `# Civic Engagement Readiness — ${city.name}, ${city.country}

**Readiness: ${readiness.score} / 100 (${readiness.band})** · prototype index

> A transparent proxy for how ready ${city.name} is for citizen-backed climate action — the
> civic-participation co-benefit that MDBs, the IDB and philanthropy already score (HIAP rates
> stakeholder engagement on a −2..+2 scale). This operationalizes "is this city engaged?" into
> something visible and exportable that de-risks city climate projects and helps capital flow.

## How the score is built (no black box)

| Signal | Value | Points |
|---|---|---|
${rows}

## Top recommended actions (with engagement co-benefit)

${actionLines}

## Local civic channels residents can use

${channelLines}

## Proven precedent (real success stories)

${storyLines}

## Caveats

- Prototype index over **demo participation data** — not an audited metric.
- Brazilian emissions come from a partial territorial inventory; sector shares are conservative and
  some are overstated. Climate-risk levels are from CityCatalyst's risk assessment.
- Generated for OEF Hackday 26Q2 by the Civic Climate Action module.
`;
}
