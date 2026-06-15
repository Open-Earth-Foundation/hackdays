# Iteration 2.1 — City Readiness Navigator + SFP Control Tower upgrade

**Supersedes:** [`ITERATION-2-PLAN.md`](archive/ITERATION-2-PLAN.md) (all its points still hold;
this refines them with the integrated architecture).
**Reads with:** [`INTEGRATED-ARCHITECTURE.md`](INTEGRATED-ARCHITECTURE.md).
**Why 2.1:** after reviewing the **Project Preparator** POC, the **CAPAG** project (Brazil
creditworthiness), and the **City-Funder Matching Engine**, the model sharpened from "one
app" to "**two readiness layers on a shared spine**." This plan positions the city-facing
app inside that, and upgrades the IDB-facing Control Tower's language.

---

## A. The reframe that changes the build

The Navigator is the **entity / instrument / portfolio** layer — *not* a project builder.
The **Project Preparator** already does per-project bankability + funder matching + Concept
Note. So the Navigator should:

1. **Consume**, not re-create, prepared projects (Concept Notes) from the Preparator.
2. Focus on **entity creditworthiness for a chosen instrument** (IDB SFP), fed by **real
   national fiscal data** (CAPAG for Brazil, SINIM/FCM for Chile) via a Fiscal Data Adapter.
3. **Pool** entities/projects to reach an instrument's ticket size.
4. Emit the **dossier = Concept Note + creditworthiness + instrument + pool** into the IDB
   Control Tower's Intake & Triage.

This *removes* scope (we don't build project preparation) and *adds* the missing connective
tissue (adapters, dossier, pooling-as-portfolio).

## B. City-facing app — workstreams (refines v2's WS-A…H)

- **WS-1 Entry & dual path** — enter from CityCatalyst (inventory + HIAP). Support both
  entry paths: *project-first* (arrive from a Preparator Concept Note) and *capacity-first*
  ("can I access IDB SFP?"). Show provenance. *(refines v2 §1)*
- **WS-2 Fiscal Data Adapter** — define `locode → {pillars, provenance}`; implement **CAPAG
  (Brazil)** and **SINIM (Chile)**. Add a **Brazilian hero city** (CAPAG-rated) alongside
  Valdivia to prove the multi-country pillar feed. *(new — from CAPAG review)*
- **WS-3 Shared readiness package** — extract `@oef/readiness` (engine + profiles) used by
  Navigator + Control Tower; design it to also host *project-level* profiles so the
  Preparator can converge later. *(refines v2 §4)*
- **WS-4 Choose instrument + eligibility** — rename "pick a target" → **"Choose the
  financing instrument"**; reframe readiness as instrument/funder/product-specific; add the
  `eligibleUse` panel (what expenses the instrument funds). *(refines v2 §3, §7)*
- **WS-5 Build readiness** — merge "Prepare/Close the gap"; two failure modes (readiness gap
  → PPF/TC; ticket-size gap → pool); drop "bankability" language. *(refines v2 §5)*
- **WS-6 Portfolio / pooling** — rename "the gap becomes the deal" → **"Build a financeable
  portfolio"**; clarify co-finance units (0–100 index, not $); add region/country geography
  + Los Ríos map; reconcile with the Matching Engine's existing `aggregation` pathway.
  *(refines v2 §6)*
- **WS-7 Dossier = Concept Note** — adopt/extend the Preparator's GCF/C40 Concept Note as
  the machine-readable handoff; write it into the Control Tower's Intake & Triage. *(refines v2 §8)*
- **WS-8 Copy/polish** — kill marketing titles; disable the Next.js dev indicator. *(v2 §10)*

**Order:** WS-3 → WS-2 → WS-1/4 → WS-5/6 → WS-7 → WS-8.

## C. SFP Control Tower (IDB-facing) — language upgrade

The Control Tower is **IDB-facing**, so it needs a **thinner** explanatory layer than the
city app (the user is an expert) — but it currently assumes too much. Upgrade the front end:

1. **One-line orientation banner** (who/what): *"Screening room for the IDB Sub-Sovereign
   Finance Program (SFP) — a 5-year pilot lending directly to subnational governments (SNGs)
   without a sovereign guarantee. Each candidate is one record seen through four lenses."*
2. **Define acronyms once, inline, on first use** (hover or a small glossary chip): SFP, SNG,
   sovereign guarantee, non-accrual, OVE, Ordinary Capital, TC, Subprogram 1/2. Don't strip
   them (IDB uses them) — just gloss them once.
3. **Keep "M&E" explicit — title it "Monitoring & Evaluation (M&E) & Board".** M&E *is*
   understood at IDB, and the team has built real M&E content, so spell it out rather than
   hide it. Add a one-line subhead: *"How the pilot proves itself — indicators vs. targets
   for the year-3 and year-5 Board / OVE reviews."* (Expand the acronym once on first use.)
4. **Tab subheads** — each of the four tabs gets a one-line "what this answers":
   - **Intake** → "Which Navigator dossiers has IDB accepted into the program?"
   - **Readiness Scoring** → "The early creditworthiness assessment — is this SNG ready, and why."
   - **Project Review** → "Where each cleared candidate sits in the IDB review process, and what's blocking it."
   - **Monitoring & Evaluation (M&E) & Board** → "How the pilot proves itself — indicators vs. targets for Board / OVE reviews."
5. **Geography** — show candidate country/region (a small map or country chips), so IDB sees
   the portfolio's geography.
6. **The dossier view** — render the incoming candidate dossier (WS-7) as an expandable
   intake card (project plan + creditworthiness + instrument + pool), so Intake & Triage is
   fed by the city app, not hand-entered.

> Keep the IDB skin and density; this is *clarification*, not a redesign. The city app
> carries the heavy hand-holding; the Control Tower carries crisp expert labels.

## D. Open decisions (confirm before building) — see architecture §8

1. Extract the shared `@oef/readiness` package now, or after the hackday?
2. Adopt the Preparator's **Concept Note as the dossier** format?
3. **Converge the funder catalog**, or map per-team for now?
4. Add a **Brazilian CAPAG hero city** alongside Valdivia this iteration? *(recommended — it
   proves the multi-country, real-creditworthiness story.)*
5. Navigator as a sibling CityCatalyst module sharing the spine? *(recommended.)*

## E. Sequencing

Per Martin: review the two running apps + this plan together → lock §D → execute the
city-app workstreams (B) and the Control Tower upgrade (C) → **then** render the
[architecture diagram](INTEGRATED-ARCHITECTURE.md) as the visual artifact on top of the
built result.

---

## F. Refinements from review 3 (architecture + UX)

These came from Martin's read of the integrated architecture and refine §A–§C:

1. **Matching is a *core service*, not Chile-only data.** The City-Funder Matching Engine's
   reusable part is its **matching + pooling logic**, callable at *both* altitudes — *action →
   instrument/funder* (project level, what the Preparator needs) and *entity/pool → eligible
   instruments + pooling* (entity level, what the Navigator needs). SINIM is just its current
   Chilean **data instance**. Model it as a shared service with pluggable data, alongside the
   Fiscal Data Adapters.
2. **"Path B" is entity-first, not "capacity-first."** It analyses the **municipal entity's
   creditworthiness**, so name it **"entity-first"** (vs. "project-first" for Path A).
   Separately, **"capacity building" is a support track**, not an entry path — it's what a
   city *or* a project may need when the diagnosis says they're not yet ready (e.g. a fiscal
   improvement plan before creditworthiness, or feasibility work before a PPF). Show it as a
   branch off the readiness diagnosis that applies to both layers.
3. **The Navigator is one vertical with two steps**, not two boxes. ① Entity creditworthiness
   → ② Portfolio & pooling → submit. **Path A (a prepared project / Concept Note) connects
   into step ②**; **Path B (entity-first) enters at step ①.**
4. **Dual entry + import/interoperability.** Because these modules interoperate, the Navigator
   should offer **import options** at entry (pull a prepared project from the Preparator, pull
   an entity's fiscal profile from an adapter) rather than re-entry.
5. **"Build readiness" → "Readiness pathways."** The step *assesses* readiness and **routes**:
   ready → proceed; not-ready → a capacity-building/PPF pathway; ready-but-sub-scale → pooling.
   "Build readiness" wrongly presumes not-ready; **"Readiness pathways"** frames it as the
   diagnosis-and-route step.
6. **Geographic / map view of financial readiness.** A map layer that shows readiness across a
   scope (CAPAG tiers over Brazil, SINIM over Chile) and **zooms to the city/project location**
   — an intuitive front door for the adapters and for funders scanning a portfolio.
7. **Left-hand process menu.** The workstreams are a top-to-bottom process (upstream →
   downstream). Use a **left vertical nav** (Source → Readiness → Portfolio → Funder intake)
   rather than a horizontal stepper, so the flow reads as a pipeline.

## G. Cross-cutting requirement — AI-agent shared context (CityCatalyst)

The app must integrate with **CityCatalyst's AI-agent infrastructure** (its MCP server /
climate-advisor / the Preparator's agent layer) so **context is shared across modules** — a
city's inventory, HIAP priorities, prepared projects, and readiness travel with the user
instead of being re-derived per app. Practically: the Navigator reads/writes through the
CityCatalyst agent/MCP layer, and exposes its own readiness + dossier as agent-callable
context. This is a first-class requirement, not a nice-to-have.

## H. Build pathway — to make the running app reflect the architecture

The sequence to get from today's Phase-0–3 app to an app that *shows the architecture through
its interface*:

1. **Shell & navigation (WS-1, §F-7):** restructure the app around a **left-hand process menu**
   (Source · Readiness pathways · Portfolio · Funder intake), single-vertical Navigator.
2. **Fiscal Data Adapter + map (WS-2, §F-6):** implement the adapter interface with **CAPAG
   (Brazil)** and **SINIM (Chile)**; add the **map view** of readiness; add a Brazilian hero
   city beside Valdivia.
3. **Readiness pathways (WS-5, §F-5):** the assess-and-route step (ready / capacity-building /
   pool), with the capacity-building branch shown for entity *and* project.
4. **Matching core service (§F-1):** wire discovery + pooling as calls to one matching service.
5. **Dual entry + import (§F-4):** project-first (import a Concept Note → step ②) and
   entity-first (→ step ①).
6. **Dossier = Concept Note (WS-7):** assemble + write into the Control Tower Intake. *(demo wired: Navigator `POST /api/submissions` → Control Tower **Intake** tab → approve → Readiness Scoring + Project Review)*
7. **AI-agent context (§G):** read/write city context through the CityCatalyst MCP/agent layer.
8. **Control Tower language upgrade (§C):** thin IDB-facing copy incl. **M&E** kept explicit. *(done)*
9. **Copy/polish (WS-8):** kill marketing titles, disable the dev indicator.

Recommended build order: **1 → 2 → 3 → 5 → 4 → 6 → 8 → 7 → 9** (UI shell first so the
architecture is legible as it fills in; AI-agent wiring after the data contracts are stable).

## I. Run locally (e2e demo)

See [`README.md`](README.md) for the canonical walkthrough. Short version:

```bash
# Terminal 1
cd events/2026-06-11-unlock-the-money/justagiraffe/city-readiness-navigator
npm install && npm run dev

# Terminal 2
cd events/2026-06-11-unlock-the-money/justagiraffe/control-tower
npm run dev
```

Submit from http://localhost:3000 → approve in Control Tower **Intake** at http://localhost:8000.
