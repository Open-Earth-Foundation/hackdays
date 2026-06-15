# Iteration 2 Plan — City Readiness Navigator + platform architecture

**Status:** Plan for the next agentic build push · **Owner:** Martin (OEF)
**Source:** Martin's review of the running Phase 0–3 prototype (12 Jun 2026).
**Sequencing:** Execute this plan (the "next big push") → *then* build the architecture diagram.

This document interprets every point of the review into concrete decisions and tasks for
content, logic, design, architecture, and UX. The textual architecture map (§11) seeds the
diagram we'll render after this push.

---

## 0. Feedback → action map (the whole review at a glance)

| # | Review point | Decision | Section |
|---|---|---|---|
| 1 | "I land straight in Valdivia — how did it get here?" | Enter *from* CityCatalyst; show inventory + HIAP provenance | §1 |
| 2 | "Funders your plan can reach" is a weak, vague title | Rename; reframe as **per-action** funder/instrument relevance via HIAP | §2 |
| 3 | A plan has many action types (policy→infra); HIAP can map funder/requirements/instrument/→project per action | Drive Discover from HIAP-ranked actions | §2 |
| 4 | Project Preparator (NBS) already does financial-readiness questionnaire + funder/PPF matching, readiness embedded | **Connect, don't duplicate**: shared readiness engine, two altitudes | §2, §11 |
| 5 | "Pick a target / pick a path" — target for what? | Rename "Choose the financing instrument"; reframe readiness dependency | §3 |
| 6 | Only one MDB; space for another template | Keep pluggable profiles; add ≥1 real second-MDB profile | §3 |
| 7 | Diagnose = same readiness as IDB app? same data? | Yes — extract a **shared** engine package; the scored record flows to IDB | §4, §8 |
| 8 | "Prepare" vs "Close the gap" — two names, unclear purpose | One name ("Build readiness"); clarify the two failure modes | §5 |
| 9 | Don't say "bankability"; MDBs want cities able to draw private/commercial finance | Reframe the goal language | §5 |
| 10 | Comuna names are Chilean cities — make geography explicit (region/country) | Add geography labels + map | §6 |
| 11 | "The gap becomes the deal" is a cheap marketing title | Rename; frame pooling as **portfolio design** | §6 |
| 12 | Two reasons a project can't access an instrument: readiness vs ticket size | Make both explicit; pooling solves the ticket-size one | §5, §6 |
| 13 | "Co-finance" unclear — millions? which projects? | Define units; tie to eligible expenses per instrument | §6, §7 |
| 14 | What expenses/projects are eligible for the instrument? | New: instrument eligibility panel | §7 |
| 15 | Funder pipeline should be justagiraffe Intake & Triage; payload too skinny | Wire real connection; define machine-readable **candidate dossier** | §8 |
| 16 | "M&E & Board" — nobody knows the acronym | Rename "Results & Board Reporting"; expand | §9 |
| 17 | Marketing-punchline titles throughout | Copy pass; substantive titles | §10 |
| 18 | The "N" bottom-left | Next.js dev indicator — disable via `devIndicators` | §10 |

---

## 1. Entry & provenance — "what happened before Valdivia landed here"

**Decision.** The Navigator is a **CityCatalyst Journey Navigator module**, entered from a city
that has already completed *Assess* (GHG inventory) and *Plan* (HIAP). The first screen must
make that lineage visible, so the funders/actions downstream are clearly *derived from the
city's own plan*, not conjured.

**Tasks.**
- Reframe Step 1 from a bare locode record to a **city brief**: GHG inventory summary (top
  emitting GPC sectors), and the **HIAP-prioritized actions** (ranked, with sector tags).
- Label provenance on every field (CityCatalyst inventory / HIAP / Global API context).
- Phase-4 wiring: live `get_city_profile`, `get_inventory_emissions`, HIAP
  `get_prioritization`. For this push: mock these from realistic Valdivia values, badged.

## 2. Discover — per-action funder relevance (not "funders your plan can reach")

**The critique, restated.** A climate plan spans many action types (policy → infrastructure).
The useful question is *per action*: which funder is relevant, what are their requirements,
what instrument fits, and **how do you turn this action into a fundable project**. That last
step is the **Project Preparator's** job.

**Decision — how this app and the Project Preparator relate (the key architecture call).**
They are **two altitudes of one flow on a shared readiness engine**:

- **Project Preparator** (CityCatalyst module, NBS-first, extensible): operates at the
  **project/action** level. Its first line is a **financial-readiness questionnaire**; from it
  it proposes (a) **project-preparation facilities (PPFs)** to reach readiness and (b) funders
  that can finance the project. Readiness is embedded *inside* project preparation.
- **City Readiness Navigator** (this app): operates at the **entity / instrument / portfolio**
  level — broader funder/instrument set, sub-sovereign access (IDB SFP), and **pooling** across
  projects/comunas to reach ticket size.
- **Shared spine:** the **Readiness Engine + pluggable profiles** is one package both consume.
  The Preparator scores a *project's* readiness for an instrument; the Navigator scores an
  *entity's / pool's* readiness for an instrument. Same engine, same profile contract.

**Tasks.**
- Rename the step/title (e.g. **"Match your plan to funders"** or **"Funding options for your
  plan"**) and reframe the subtitle around *per-action relevance*.
- Drive Discover from HIAP actions: for each prioritized action show relevant funder(s),
  their requirement summary, best-fit instrument, and a "prepare as project" affordance that
  conceptually hands to the Project Preparator.
- Add an explicit **"Preparator vs. Navigator"** note in code/docs so the boundary is clear.
- Confirm with the Project Preparator owners: shared engine + the handoff between the two.

## 3. Choose the financing instrument (was "Pick a target / pick a path")

**Decision.** Rename to **"Choose the financing instrument"**. Reframe the readiness premise to:

> *Financial readiness depends on the **type of instrument** the project/initiative needs, the
> **funder** and their **institutional requirements**, and the **nature of the financial
> product** they've issued.*

So a **readiness profile** encodes all four — not just "the funder."

**Tasks.**
- Rename step + rewrite the readiness-dependency copy (above).
- Extend the profile schema fields to name: project-type fit, instrument class, funder
  institutional requirements, financial-product nature (tenor, pricing, guarantee structure).
- Keep pluggable profiles; **add at least one real second MDB** profile (e.g. CAF or World
  Bank sub-national) so the template slot is a working example, not a placeholder.

## 4. Diagnose — make it literally the record IDB receives

**Decision.** Same engine, same IDB profile as the Control Tower — but stop duplicating it.

**Tasks.**
- **Extract a shared package** `@oef/readiness` (engine + profiles) imported by BOTH the
  Navigator and `control-tower` (replace the vendored copy + the control-tower's inline logic).
  Single source of truth; no drift.
- The Diagnose output is the **scored candidate record** that travels to IDB (see §8) — so the
  city's diagnosis *is* IDB's view.
- Add the explicit "early creditworthiness assessment" framing (IDB's own term) as the headline.

## 5. Build readiness (merge "Prepare" + "Close the gap" into one clear step)

**Decision.** One name — **"Build readiness"** (drop the duplicate "Close the gap"). Its job:
when the diagnosis says *not ready for this instrument/funder*, show the funded avenues to get
there.

**Make the two failure modes explicit** (this was muddled):
1. **Readiness gap** — the entity isn't yet creditworthy/eligible → avenues: PPFs, IDB
   Subprogram 2 TC, fiscal/governance reforms, audits.
2. **Ticket-size gap** — the entity *is* ready but its project is **too small** for the
   instrument's minimum → avenue: **pooling/portfolio** (§6).

**Language.** Avoid "bankability." Frame the goal as *becoming able to access this instrument
and, over time, to draw private and commercial (incl. local bank) finance* — which is the MDB's
actual intent for sub-sovereign borrowers.

**Tasks.**
- Merge/rename the step; show which failure mode applies per candidate.
- List concrete preparation avenues per gap, sourced from the active profile's `preparation`
  block (extend it: PPFs, TC types, reforms, expected timeline).

## 6. Portfolio & pooling (was "the gap becomes the deal")

**Decision.** Rename to something substantive — **"Build a financeable portfolio"** or **"Pool
to reach the ticket size"**. Frame pooling as **portfolio design**: the gap between a single
project and what the instrument can deliver is closed by combining projects/comunas.

**Tasks.**
- Rewrite the title + framing (portfolio angle; the two reasons access fails).
- **Clarify "co-finance".** It is a **0–100 capacity index** (ability to bring matching
  resources / lead a deal), **not dollars** — label it as such with a tooltip. Distinguish from
  the **ask (US$M)**.
- **Geography.** Label region + country everywhere ("Los Ríos region, Chile"); add a small
  **map of the pool** (the Matching Engine ships `losrios.geojson`) so IDB and the city see the
  geography. On the IDB side, show candidate geography too.
- Tie the pool to **eligible project/expense types** for the instrument (§7) so the US$30M ask
  is legible.

## 7. Instrument eligibility — what it actually funds (new)

**Decision.** Add a panel (in Choose-instrument and Portfolio) showing, per instrument: the
**eligible project types and expenses**, minimum/maximum ticket, tenor, and co-finance
expectations. Without this, "co-finance" and "ask" float free.

**Tasks.**
- Extend the profile with an `eligibleUse` block (project types, expense categories, ticket
  band, what's explicitly *not* eligible — e.g. IDB SFP excludes short-term/refinancing).
- Surface it where ask/co-finance appear.

## 8. The handoff — a machine-readable candidate dossier into Intake & Triage

**Decision.** The "funder pipeline" view should **be** justagiraffe's **Intake & Triage** for
the IDB instrument — a real connection, and the payload should be a single **machine-readable
candidate dossier**, not the current skinny object.

**Candidate dossier (the one document IDB intakes)** — bundles:
- **Project plan** (from HIAP / Project Preparator: actions, scope, sector, expected outcomes).
- **Instrument** chosen + why (eligibility match).
- **Readiness assessment** + provenance (the scored record, pillar-by-pillar, real vs. estimated).
- **Due-diligence / documentary checklist** status (legal capacity, audit, non-accrual, ESG).
- **Financials** (ask, co-finance, pool composition, anchor).
- Identifiers (locode, cityId) for IDB-side joins.

**Tasks.**
- Define the dossier JSON schema (versioned).
- Wire the Navigator's submit to **write the dossier into the Control Tower's Intake data** so
  it appears in Intake & Triage (replace the standalone in-memory pipeline view, or make that
  view read the Control Tower's store).
- Render the dossier on the IDB side as an intake card with the full document expandable.

## 9. Control Tower (IDB side) clarifications

**Decision.** Rename **"M&E & Board"** → **"Results & Board Reporting"** (M&E = Monitoring &
Evaluation — the pilot's progress vs. targets for IDB's evaluation office, OVE). Expand it so a
first-time IDB/CIDI user understands it without the acronym.

**Tasks.**
- Rename the tab + add a one-line plain-language explainer at the top.
- Add geography (where candidates are) to the IDB side.
- (Coordinate with Mirco — his latest branch has the updated Results/Board tab; align names and
  the Intake connection in §8.)

## 10. Cross-cutting: copy & polish

**Decision.** Remove marketing-punchline titles; use substantive, plain titles throughout.

**Tasks.**
- Title/copy pass (table of renames: "pick a target"→"choose the financing instrument",
  "the gap becomes the deal"→"build a financeable portfolio", "funders your plan can
  reach"→"funding options for your plan", "Prepare/Close the gap"→"Build readiness",
  "M&E & Board"→"Results & Board Reporting").
- Disable the Next.js dev indicator: `next.config.mjs → devIndicators: false` (or position).

## 11. Architecture map (textual — visual diagram comes after this push)

**Components**
- **CityCatalyst core** — city profile, GHG **inventory**, **HIAP** (prioritized actions),
  **Project Preparator** (NBS-first; financial-readiness questionnaire; PPF + funder matching;
  readiness embedded per project).
- **Shared Readiness package** (`@oef/readiness`) — the engine + **pluggable profiles**
  (IDB SFP #1; CAF/WB/GCF). Consumed by Preparator (project altitude) and Navigator (entity/
  portfolio altitude) and Control Tower (scoring).
- **City Readiness Navigator** (this app) — entity/instrument/portfolio layer; pooling.
- **City-Funder Matching Engine** — funders-open per action, capacity (SINIM/FCM), pooling.
- **justagiraffe Control Tower** — IDB Intake & Triage, Readiness Scoring, Results & Board.

**Connections / contracts**
- Inventory + HIAP **actions** → Navigator & Preparator (what to fund).
- Matching Engine **capacity (locode-keyed)** → Readiness pillar inputs.
- Matching Engine **funders/pools** → Discover + Portfolio.
- **Shared Readiness package** → identical scoring across all surfaces.
- **Candidate dossier** (§8) → Control Tower Intake & Triage.

**Open decisions to confirm (before/within the push)**
- Is the Navigator a *mode of* the Project Preparator family, or a sibling module sharing the
  engine? (Recommend: sibling modules, shared `@oef/readiness`.)
- Second real MDB profile to add alongside IDB.
- Where the shared store lives for the demo (Control Tower data file vs. posted endpoint).

## 12. Workstreams for agentic execution

- **WS-A — Entry & provenance:** §1 (inventory + HIAP brief, provenance badges).
- **WS-B — Discover reframe + Preparator boundary:** §2 (per-action, naming, shared-engine note).
- **WS-C — Instrument & profile depth:** §3, §7 (rename, dependency copy, eligibleUse, 2nd MDB).
- **WS-D — Shared readiness package:** §4 (extract `@oef/readiness`, de-duplicate).
- **WS-E — Build readiness + portfolio:** §5, §6 (merge/rename, two failure modes, co-finance
  units, geography + map).
- **WS-F — Candidate dossier + real Intake connection:** §8 (schema, write into Control Tower).
- **WS-G — Control Tower naming + geography:** §9 (Results & Board, explainers).
- **WS-H — Copy/polish:** §10 (titles, dev indicator).

Recommended order: D → A/B/C in parallel → E → F → G/H. (D first because the shared package
de-risks everything downstream.)
