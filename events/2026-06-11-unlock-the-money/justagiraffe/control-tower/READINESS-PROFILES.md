# Readiness Profiles — the pluggable contract behind the Readiness Engine

> **TL;DR** You are never "ready" in the abstract — you are ready *for a specific
> funder's criteria*. A **readiness profile** packages one MDB instrument's
> criteria (pillars, weights, tiers, eligibility gate, documentary checklist,
> preparation track) as a plug-in. The Readiness Engine (`scoring.js`) runs
> whatever profile is active. **IDB SFP is profile #1**; CAF / World Bank / EIB /
> GCF add their own. This is what turns justagiraffe from *an IDB tool* into
> *the readiness layer for any MDB.*

## Why this exists

The original `scoring.js` hardcoded the IDB Sub-Sovereign Finance Program: the
four pillars, their weights, the tier thresholds, the §4.3 project-eligibility
gate, and the OP-301 documentary checklist. That made the engine IDB-only.

Two things in this repo wanted it to be more than that:

1. **The platform vision** — the same engine should serve every MDB running a
   sub-sovereign / urban-finance pilot (the SPEC's "repeatable to any MDB"
   revenue framing). Each MDB has *different* criteria.
2. **The City-Funder Matching Engine** — it narrows a city's plan to a few
   *candidate funding targets*. For a chosen target, *someone* has to answer "is
   this city ready **for that target**?" That someone is the Readiness Engine,
   parameterized by the target's profile.

So readiness is the **bridge** between matching ("where could this city go?") and
submission ("can it actually get there, and how does it prepare?").

## Files

| File | What it is |
|---|---|
| `readiness-profiles.js` | The profile registry + schema. `window.ReadinessProfiles` (browser) / `module.exports` (Node). Holds `idb-sfp` (canonical) + `generic-mdb-template` (illustrative). |
| `scoring.js` | The Readiness Engine. Now **profile-driven** — derives weights/tiers/gates/checklist from the *active* profile. Default `idb-sfp` reproduces the prior behavior exactly. |
| `index.html` | Loads `readiness-profiles.js` **before** `scoring.js`. Otherwise unchanged. |

## The profile schema

```js
{
  id, funder, instrument, version, source, summary,
  pillars: [{ key, label, weight, basis, source }],   // weights sum to 1 → composite 0–100
  tiers: {
    thresholds: { ready, developing },                // >=ready Ready, >=developing Developing, else Early
    labels: { ready, developing, early },
    actions: { Ready, Developing, Early },            // recommended next action per tier
  },
  clearanceBlockers:   [{ key, label, test(signals) -> bool }],  // hard gates (block even a Ready score)
  projectEligibility:  [{ key, label, test(sng) -> bool, note? }],// the funder's project gate
  documentaryChecklist:[{ key, label, test(sng) -> bool }],       // intake documents → pipeline state
  preparation: { Developing: {track, funding}, Early: {track, funding} },  // the TC / readiness route
  signalSources?: [{ pillar, dataset, field, note }], // provenance: where real pillar inputs come from
}
```

`test(...)` predicates are tiny and pure. `clearanceBlockers`/`documentaryChecklist`
receive different inputs (`signals` vs the whole `sng`) to match the existing
`scoring.js` call sites — see those functions for the exact shapes returned.

## How the engine consumes it

`scoring.js` keeps every previous export and return shape, so `index.html` is
untouched apart from the one extra `<script>` tag. New controls:

```js
ScoringModel.setActiveProfile("idb-sfp");   // re-point the whole engine
ScoringModel.activeProfile();               // -> the active profile object
ReadinessProfiles.listProfiles();           // -> [{id, funder, instrument, illustrative}]
```

`READINESS_WEIGHTS`, `PILLAR_LABELS`, and `TIER_THRESHOLDS` are rebuilt (in place,
preserving object identity) from the active profile, so the live weight sliders
and the live re-score keep working. Switching profiles re-derives them.

### Equivalence guarantee

A Node harness compared the refactor against Mirco's original `scoring.js` across
all 63 SNGs — **567 assertions, 0 differences** (composite, tier, eligibility,
checklist, clearance blockers, `canEnterProjectReview`, action, `explainScore`,
full `scoreSNG`). `PILLAR_LABELS` and `READINESS_WEIGHTS` match exactly. Switching
to the template profile and back restores identical output. The IDB demo behaves
exactly as before.

## Adding a new MDB

1. Copy `GENERIC_MDB_TEMPLATE` in `readiness-profiles.js`, give it a real `id`.
2. Fill in the funder's **published** criteria — pillars + weights (sum to 1),
   tier thresholds, the hard clearance gates, the project-eligibility gate, the
   required documents, and the preparation/TC track. Cite the source per field.
3. Register it in `READINESS_PROFILES`.
4. Activate with `ScoringModel.setActiveProfile("<id>")`.

> The template's criteria are **placeholders, not any real bank's rules** — replace
> every field before presenting a profile as that MDB's actual eligibility.

## How this connects to the rest of the platform

- **City-Funder Matching Engine** — its `comuna_capacity_scores.csv` carries real,
  `locode`-keyed fiscal/governance signals (`fcm_dependency_pct`,
  `professionalization_pct`, `cofinance_score`, …). `signalSources` declares how
  those map onto the IDB profile's `fiscalHealth` / `governance` pillars, so the
  engine can score on **real data** instead of mock for Chilean cities. Join key:
  UN/LOCODE (`locode`) and CityCatalyst `city_id`.
- **City-facing app** (CityCatalyst Journey Navigator module) — picks a target via
  matching, loads that target's profile here, scores the city, shows the gap, and
  routes non-Ready cities to the profile's `preparation` track. "Press Ready" =
  the city clears the active profile's score + clearance gates.
- **IDB-side control tower** (this app) — the receiving end: a cleared city/pool
  lands in Project Review.
