# PRD — City Readiness Navigator (CityCatalyst module)

**Status:** Draft for autonomous build · **Owner:** Martin (OEF) · **Team:** justagiraffe
**One line:** A CityCatalyst Journey Navigator module that helps a Latin American city find which funders its climate plan can reach, see exactly how *ready* it is for a chosen instrument (starting with the IDB Sub-Sovereign Finance Program), close the gap with funded TC, and — when ready — submit into that funder's pipeline.

> This PRD is written to be handed to an autonomous build agent. Integration facts
> are grounded in a primary-source review of the CityCatalyst monorepo
> (`github.com/Open-Earth-Foundation/CityCatalyst`), the Global API
> (`ccglobal.openearth.dev/openapi.json`), and the HIAP service. Items that could
> not be confirmed against source are marked **[VERIFY]**.

---

## 0. Build status & key clarifications (v2.2, 15 Jun 2026)

**Built (runs locally):** a **6-stage** city-facing flow — **Explore** (readiness map with a
**state/region ↔ city** toggle + a data-source toggle) → **City context** (inventory + CCRA +
HIAP + climate plan, from the CityCatalyst seam) → **Choose instrument** → **Readiness
pathways** (assess + route) → **Portfolio** (**intra-city** vs **cross-city pool**) → **Funder
intake** (dossier → submit). Real fiscal data via **CAPAG (Brazil)** and **SINIM (Chile)**
adapters; two worked cities — **Valdivia** (Ready → portfolio → IDB SFP) and **Canoas** (CAPAG
C → capacity-building). The 7-step spec in §4 is the origin; the built structure is the 6 stages
above (left-hand process menu).

**Cross-app handoff (demo):** submitting a dossier from the Navigator lands in Control Tower
**Intake** for IDB approve/decline; approved candidates join Readiness Scoring and Project
Review. Navigator `/pipeline` is a quick in-app preview only. Run both apps per
[`README.md`](README.md).

**Run locally:**

```bash
cd events/2026-06-11-unlock-the-money/justagiraffe/city-readiness-navigator
npm install
npm run dev
# → http://localhost:3000
```

**Naming.** "Readiness" is too broad — this is **finance readiness** / **climate-finance
readiness**. Keep the app's subtitle ("Climate-finance readiness for cities & regions") front
and center; a rename should preserve that.

**Funder hierarchy (3 levels) — refines "Choose instrument".** Financing has three levels of
specificity and readiness is assessed against the most specific: **funder/bank → program →
instrument**. The **IDB SFP is a *program***, not an instrument; its instruments are the
investment loan / guarantee (Subprogram 1) and TC (Subprogram 2). So this step should become a
**funder navigator** that drills funder → program → instrument, fed by a converged **funder
sourcing database / service** (today fragmented across CityCatalyst and the hackday apps; see
[`INTEGRATED-ARCHITECTURE.md` §4.3](INTEGRATED-ARCHITECTURE.md)). *Not yet built — current step
selects IDB SFP directly.*

## 1. Why this exists

Two hackday prototypes each built half of the "unlock the money" chain and neither
is embedded in CityCatalyst:

- **justagiraffe / Control Tower** — an IDB-facing console with a *readiness engine*
  (now profile-driven; see `control-tower/READINESS-PROFILES.md`). It answers "is
  this borrower ready?" and now receives Navigator dossiers through an **Intake** tab
  (approve/decline before candidates enter the main pipeline).
- **City-Funder Matching Engine** — matches a city's climate actions to funding
  instruments and pools small cities into financeable bundles. It answers "which
  funder fits?" but has no readiness depth.

**The missing piece is the city-facing app** that joins them inside CityCatalyst:
*match → assess readiness for the chosen target → prepare → submit.* Readiness is
the bridge, and it is **target-specific** — a city is ready *for a particular
instrument's criteria*, encoded as a pluggable **readiness profile** (IDB SFP is
profile #1; other MDBs add their own).

**Revenue framing (keep central):** a premium CityCatalyst capability for cities +
a de-risked deal pipeline for any MDB. Repeatable to CAF, World Bank, EIB, GCF by
adding a readiness profile — no new app.

### 1a. The model (v2.1 reframe — read before §4)

After reviewing the **Project Preparator** POC, **CAPAG** (Brazil), and the Matching
Engine, the product sharpened from "one app" to **two readiness layers on a shared
spine** (full rationale in [`INTEGRATED-ARCHITECTURE.md`](INTEGRATED-ARCHITECTURE.md)):

- **Project bankability** ("is *this project* fundable?") — owned by the **Project
  Preparator** (Tech/Fin/Pol → Concept Note). The Navigator **consumes** these; it does
  **not** rebuild project preparation.
- **Entity creditworthiness** ("can *this city/pool* take on *this instrument*?") — this
  app. The Navigator is the **entity / instrument / portfolio** layer.

What this changes in the spec below:
1. **Navigator = one vertical, three steps:** ① diagnose entity creditworthiness for the
   chosen instrument → ② **readiness pathways** (assess-and-route: ready → proceed;
   not-ready → close the gap / coach to the funder's requirements, or a funded
   capacity-building/PPF track; sub-scale → pool) → ③ portfolio & pooling → submit.
   Pooling is **conditional** — a large-enough city skips it.
2. **Dual entry.** *Project-first* (Path A): a prepared Concept Note enters at step ③.
   *Entity-first* (Path B): a city asking "can I access IDB SFP?" enters at step ①. Offer
   **import** at entry (pull a Concept Note from the Preparator, pull a fiscal profile from
   an adapter) rather than re-entry. ("Capacity-first" is *not* an entry path — capacity
   building is a support track off the readiness diagnosis.)
3. **Matching + Pooling is a shared core service** (action→instrument and
   entity/pool→instruments), not Chile-only data. SINIM is its current data instance.
4. **Fiscal Data Adapters** (`locode → {pillars, provenance}`) feed creditworthiness:
   **CAPAG** (Brazil), **SINIM/FCM** (Chile); a **map view** badges readiness by geography.
5. **The handoff is the dossier = Concept Note + creditworthiness + instrument + pool.**
6. **Shell is a left-hand process menu** (Source · Readiness pathways · Portfolio · Funder
   intake), not a horizontal stepper — the flow reads as a pipeline.

The 7-step journey in §4 remains the functional spec; the names below reflect this reframe
(e.g. "Pick a target" → "Choose the instrument"; "Prepare" → "Readiness pathways").

## 2. Goals / non-goals

**Goals**
1. A city officer, starting from their existing CityCatalyst plan, can in one
   session: see reachable funders, pick a target (IDB SFP), get a defensible
   readiness score + gap, see the funded preparation path, and submit when ready.
2. Run on **real data where it exists** (CityCatalyst city context + HIAP
   priorities; Chilean fiscal capacity from the Matching Engine), clearly labeled
   real-vs-estimated.
3. Be a **first-class CityCatalyst module** (Journey Navigator entry, per-project
   access, OAuth, CityCatalyst look-and-feel), not a standalone microsite.
4. Emit a clean **handoff object** so a "Ready" city/pool appears in the IDB-side
   Control Tower pipeline.

**Non-goals (this iteration)**
- No real money movement, contracts, or write-back into IDB systems.
- Not a replacement for IDB's internal due diligence — the app produces a
  *defensible candidate*, not an approval.
- Not multi-funder submission UX beyond IDB SFP (others are profile stubs).
- No new emissions/risk modeling — consume CityCatalyst's existing outputs.

## 3. Primary user & job

**User:** a city/SNG finance or planning officer (or a consultant acting for them)
in an IDB borrowing member country, already using CityCatalyst.
**Job-to-be-done:** *"Show me what money my climate plan can realistically reach,
whether we qualify, and exactly what we must fix to get funded — then let us start."*

Secondary viewer: an MDB/regional officer (the receiving side) — served by the
existing Control Tower, fed by this app's handoff.

## 4. The journey (functional spec, 7 steps)

The module is a short guided flow. Each step lists its data source and the
acceptance behavior.

| # | Step | What the user sees | Source |
|---|------|--------------------|--------|
| 1 | **Enter** | The city's existing profile (name, locode, population, region, GPC emissions, HIAP priorities) auto-loaded — no re-entry. | CityCatalyst app `/api/v1` (OAuth) + Global API city context |
| 2 | **Discover** | "Funders your plan can reach" — instruments matched to the city's prioritized actions, each tagged applicant / facilitator / referrer, with gaps named. IDB SFP appears when eligible. | Matching Engine outputs (`valdivia_funders_open.csv`, `*_action_matches.csv`); HIAP for priorities |
| 3 | **Choose instrument** *(→ funder navigator)* | Today: selects IDB SFP and loads its **readiness profile**. Target (§0): a **funder navigator** drilling **funder → program → instrument** (SFP is a *program*), fed by the funder sourcing service. Carries the "you may be eligible for a direct line" note. | `readiness-profiles.js` registry; funder sourcing service (to build) |
| 4 | **Diagnose** | Readiness score (composite + four pillars), tier (Ready/Developing/Early), "why this score" per-pillar contribution, the eligibility gate pass/fail, and the documentary checklist — all for the chosen target. Real-vs-estimated badges per signal. | `scoring.js` (active profile) over CityCatalyst + Matching Engine capacity data |
| 5 | **Readiness pathways** | Assess-and-route, not just "prepare." For each gap: the concrete fix and its route — self-serve coaching to the funder's requirements, or a funded capacity-building/PPF track (for IDB, **Subprogram 2 TC**, ~US$13M envelope: regular + contingent-recovery). Turns "rejected" into "here's the path." (formerly "Prepare") | Profile `preparation` track + checklist gaps |
| 6 | **Pool (if needed)** | If the city is below the target's ticket size, the engine pools it with neighbours into one financeable bundle, names the anchor, flags TA-needed members. Readiness then evaluates the anchor/pool. | Matching Engine `coordination_units.csv`, `unit_bundle_candidates.csv` |
| 7 | **Submit** | When readiness for the instrument is met (score ≥ tier + clearance gates pass), "Submit to IDB" emits the **dossier** (= Concept Note + creditworthiness + instrument + pool); the city/pool appears in the Control Tower's Project Review. | Handoff contract (§6) |

Steps 1–6 are city-facing (inside CityCatalyst); step 7 crosses the boundary to
the funder-facing Control Tower. **Dual entry** (see §1a): *entity-first* (Path B) starts
at step 1; *project-first* (Path A) imports a Concept Note and enters at step 6/7. **Step 6
(Pool) is conditional** — a city at or above the instrument's ticket size proceeds straight
to Submit. Present the flow as a **left-hand process menu** (Source · Readiness pathways ·
Portfolio · Funder intake), not a horizontal stepper.

## 5. Integration architecture (CityCatalyst)

Grounded in the SDK review. **There is no published CityCatalyst SDK package** —
TS/Python clients are CI-generated from the OpenAPI spec but not on a registry.
Integrate via **REST + OAuth 2.0 (+ optional MCP)**, and register as a **Module**.

### 5.1 Module registration (Journey Navigator)
CityCatalyst's Journey Navigator hosts a catalog of modules (gated by the
`JN_ENABLED` flag). A module is a row in the `Module` table
(`app/migrations/20250721185038-Module_create.cjs`):
- `id` (UUID), `stage`/`step` (e.g. `plan` or `implement` — **[VERIFY]** which
  stage finance belongs to; "Implement" is the likely fit), `name`/`tagline`
  (multilingual JSON `{en,es,pt}`), `type` (`OEF` for an OEF-built module),
  `url`, `author: "Open Earth Foundation"`, `status`.
- Per-project access via `GET /api/v1/city/{cityId}/modules/{moduleId}/access`
  → `{ data: { hasAccess: boolean } }`.
- **[VERIFY]** Exact embed mechanism for an independently hosted module
  (iframe vs micro-frontend vs redirect) — README says "independently hosted and
  surfaced in-app." Confirm with `HomePageJN/HomePage.tsx`, `JNDrawer.tsx`, or the
  CityCatalyst team. **Decision needed before build** (see §9).

### 5.2 Auth — OAuth 2.0 / PKCE
- Standards-based (RFC 8414 discovery at `GET /api/v1/oauth/metadata`, gated by
  `OAUTH_ENABLED`), PKCE `S256`, scopes `read`/`write`, grant types
  `authorization_code` + `refresh_token`.
- Onboard via Admin → "OAuth 2.0 Clients" → Add Client (name, redirect URI) →
  client ID (public client, no secret). Reference SPA: `api-demo/` using
  `oauth4webapi`.
- Origins: prod `citycatalyst.io`, dev `citycatalyst.openearth.dev`,
  test `citycatalyst-test.openearth.dev`, local `localhost:3000`.

### 5.3 Reading city data
**App API (`/api/v1`, authenticated)** — the city's own inventory/plan:
- City profile, inventories, emissions, action plans, risk — also exposed via the
  **MCP server** (`/api/v1/mcp`) tools: `get_user_cities`, `get_city_profile`,
  `get_user_inventories`, `get_inventory_emissions`, `get_climate_action_plans`,
  `get_climate_risk_assessment`.

**Global Data API (`ccglobal.openearth.dev`, public read-only [VERIFY auth])** —
context + reference data (spec at `/openapi.json`, mixed `v0`/`v1` paths):
- `GET /api/v0/city_context/city/{locode}` → `{locode,name,region,regionName,populationSize,populationDensity,area,elevation,biome,socioEconomicFactors,accessToPublicServices}`
- `GET /api/v0/cityboundary/city/{locode}` / `.../area`
- `GET /api/v0/climate_actions?language=` → action library (`ActionID` e.g. `c40_0010`, multilingual name/description, `Sector`/`Subsector` GPC-aligned)
- `GET /api/v1/cities/{locode}/action-policy-scores`, `.../action-mitigation-feasibility-scores` — precomputed per-city action scores
- `GET /api/v0/source/{source}/city/{locode}/{year}/{GPC_refno}` — city emissions

**HIAP (prioritizer, async)** — the city's prioritized actions:
- `POST /prioritizer/v1/start_prioritization` → `{taskId}`; poll
  `GET /prioritizer/v1/check_prioritization_progress/{task}`; fetch
  `GET /prioritizer/v1/get_prioritization/{task}`.
- Input: `cityData` (`CityContextData{locode,populationSize}` +
  `CityEmissionsData{stationaryEnergy,transportation,waste,ippu,afolu}`),
  `countryCode`, `prioritizationType` (mitigation|adaptation|both), `language[]`.
- Output: `rankedActionsMitigation[]` / `rankedActionsAdaptation[]`, each
  `{actionId, rank, explanation{explanations:{lang}}}`.

### 5.4 Join keys
- **`cityId`** (UUID) — app DB primary key; module-access + app `/api/v1` routes.
- **`locode`** (UN/LOCODE, space form e.g. `BR RIO`, URL-encode `BR%20RIO`) —
  cross-service join (Global API, HIAP, Matching Engine capacity data).
- **`actor_id`** — population/CCRA endpoints (**[VERIFY]** namespace/format).

## 6. Data contracts

### 6.1 Readiness profile (input)
Already implemented — `control-tower/readiness-profiles.js`. The app loads the
active profile and calls `ScoringModel.scoreSNG(candidate)`. Schema in
`READINESS-PROFILES.md`. The app must build a `candidate` record shaped like the
Control Tower's SNG record (`readiness{4 pillars}`, `signals{...}`,
`proposal{askUSDm, stage, ...}`).

### 6.2 Capacity signal mapping (real data in)
For Chilean cities, populate `readiness.fiscalHealth` / `readiness.governance` and
`signals.*` from the Matching Engine's `comuna_capacity_scores.csv`
(`locode`-keyed: `fcm_dependency_pct`, `cofinance_score`, `professionalization_pct`,
`staff_per_1000`, `anchor_score`). Profile `signalSources` documents the mapping.
Everything else falls back to mock, **labeled**.

### 6.3 Handoff object (output → Control Tower)
On Submit, emit:
```json
{
  "candidateId": "string",
  "kind": "city" | "pool",
  "locode": "CL ZAL",
  "cityId": "uuid",
  "anchorLocode": "CL ZAL",
  "members": ["CL ZAL", "..."],
  "targetProfileId": "idb-sfp",
  "compositeReadiness": 74,
  "tier": "Ready",
  "clearancePassed": true,
  "proposal": { "title": "...", "askUSDm": 30, "sector": "transport" },
  "provenance": { "fiscalHealth": "real:SINIM", "governance": "real:SINIM", "creditworthiness": "mock" },
  "submittedAt": "ISO-8601"
}
```
The Control Tower ingests this into Project Review (Ready cities only).
**[VERIFY]** persistence mechanism for the demo (shared JSON / localStorage /
posted endpoint) — for the prototype a shared in-memory/JSON store is acceptable.

## 7. Tech stack & conventions

Match CityCatalyst so the module feels native:
- **Next.js 15 (App Router) + React 18 + TypeScript** (the hackday `apps/_template`).
- **Chakra UI v3** + Emotion; reuse CityCatalyst typography components if building
  inside the monorepo.
- **Fonts:** Poppins (headings) + Open Sans (body). **Theme:** `blue_theme` default.
- **Data:** RTK Query against `/api/v1`; raw fetch for the Global API.
- **i18n:** i18next, locales **en / es / pt** minimum (multilingual JSON content).
- Standalone-app fallback (if not embedding in the monorepo this week): a Next.js
  app using CityCatalyst design tokens (Poppins/Open Sans, blue palette) + OAuth
  PKCE via `oauth4webapi`, surfaced later as a Module `url`.

## 8. Build phases (for the autonomous agent)

> **Status (v2.2):** Phases 0–3 are **built** (the 6-stage flow, CAPAG+SINIM adapters, map,
> instrument step, intra/cross portfolio, dossier → pipeline, simulated context/agent seam).
> **Remaining:** Phase 4 (live CityCatalyst embed — OAuth/MCP), the **funder navigator**
> drill-down + funder sourcing service (§0), shared `@oef/readiness` package, and real
> Navigator↔Control Tower wiring.

**Phase 0 — Skeleton.** Next.js 15 + Chakra 3 app from `apps/_template`,
CityCatalyst theme tokens, i18n scaffold, the 7-step flow shell with mock data.
Hero city: **Valdivia (`CL ZAL`)**, the cross-team worked example.

**Phase 1 — Readiness on real-ish data.** Wire `readiness-profiles.js` +
`scoring.js` (import the module's engine). Load Valdivia from the Matching Engine
capacity CSV → real `fiscalHealth`/`governance`; render steps 3–5 (pick target,
diagnose, prepare) with real-vs-mock badges.

**Phase 2 — Discover + Pool.** Step 2 (funders open) and step 6 (pool unit 11)
from Matching Engine derived data. Readiness re-evaluates the anchor.

**Phase 3 — Submit + handoff.** Step 7 emits §6.3; Control Tower reads it into
Project Review. Demo the full Valdivia flow end to end.

**Phase 4 — CityCatalyst embed.** OAuth PKCE client; pull live city context +
HIAP priorities for one live city; register the Module row. (Depends on §9.)

## 9. Open questions / blockers (resolve before/within build)

1. **Embed mechanism** for an externally-hosted module in the Journey Navigator
   (iframe / micro-frontend / redirect) — **[VERIFY]** with CityCatalyst team.
   Until resolved, build standalone (Phase 0–3) and treat embed as Phase 4.
2. **Global API auth** — appears public read-only but the OpenAPI spec defines no
   security scheme; confirm before depending on it in production.
3. **Matching Engine data contract** — agree the exact CSV/JSON the city app reads
   for funders-open and pools (today they're derived CSVs in the other repo).
4. **Handoff persistence** for the demo (shared store vs posted endpoint).
5. **Which journey stage** the finance module belongs to (Implement vs a new
   "Finance" stage) — **[VERIFY]** with CityCatalyst.
6. **HIAP cost/latency** — prioritization is async + calls OpenAI; cache per city.

## 10. Acceptance criteria (demo)

- A user opens the module on Valdivia and, without manual data entry, sees reachable
  funders, picks IDB SFP, and gets a readiness score with a per-pillar "why."
- At least `fiscalHealth` and `governance` are driven by **real** SINIM/FCM data,
  badged real (others badged mock).
- The transport gap (no instrument fits Valdivia alone) flows into a pooled bundle
  (unit 11) with Valdivia as anchor.
- Submitting a Ready pool makes it appear in the Control Tower's Project Review via
  the §6.3 handoff.
- Swapping the active readiness profile changes the criteria the city is judged
  against — same app, different MDB.
- UI reads as CityCatalyst (Poppins/Open Sans, blue theme); copy in en + es.

## Appendix — primary sources

CityCatalyst monorepo `README.md`; `app/migrations/20250721185038-Module_create.cjs`;
`app/src/app/api/v1/city/[city]/modules/[module]/access/route.ts`;
`app/src/app/api/v1/oauth/metadata/route.ts`; `app/src/app/api/v1/mcp/route.ts`;
`app/src/models/City.ts`; `hiap/README.md`, `hiap/app/prioritizer/{api,models}.py`;
`api-demo/README.md`; `app/src/app/providers.tsx`; Global API spec
`https://ccglobal.openearth.dev/openapi.json`. Readiness engine:
`control-tower/readiness-profiles.js`, `control-tower/scoring.js`,
`control-tower/READINESS-PROFILES.md`.
