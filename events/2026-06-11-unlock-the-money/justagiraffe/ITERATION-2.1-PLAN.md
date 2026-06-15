# Iteration 2.1 — City Readiness Navigator + SFP Control Tower upgrade

**Supersedes:** [`ITERATION-2-PLAN.md`](ITERATION-2-PLAN.md) (all its points still hold;
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
   without a sovereign guarantee. Each candidate is one record seen through three lenses."*
2. **Define acronyms once, inline, on first use** (hover or a small glossary chip): SFP, SNG,
   sovereign guarantee, non-accrual, OVE, Ordinary Capital, TC, Subprogram 1/2. Don't strip
   them (IDB uses them) — just gloss them once.
3. **Rename "M&E & Board" → "Results & Board Reporting"** with a one-line subhead: *"How the
   pilot proves itself — indicators vs. targets for the year-3 and year-5 Board/OVE reviews."*
   (M&E = Monitoring & Evaluation; nobody should need to know the acronym.)
4. **Tab subheads** — each of the three tabs gets a one-line "what this answers":
   - Intake & Triage → "Where each candidate sits in the IDB review process, and what's blocking it."
   - Readiness Scoring → "The early creditworthiness assessment — is this SNG ready, and why."
   - Results & Board Reporting → as above.
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
