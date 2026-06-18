# Sub-Sovereign Pilot Control Tower — 24h Hackday Roadmap

**Team:** Ana (lead / domain + demo) · Mirco (AI lead) · Sean (Head of Finance & Ops)
**Window:** Kickoff Thu 11 Jun 15:00 GMT → Demos Fri 12 Jun 15:00 GMT (5 min)
**Repo path:** `events/2026-06-11-unlock-the-money/apps/control-tower/`

---

## The one-liner

One control room for the IDB Subnational Finance Pilot: **intake** subnational proposals, **score** each candidate's readiness (credit, fiscal, legal, governance), and **watch** the pilot's M&E indicators against Board reporting milestones — with OEF/CityCatalyst as the trust layer that answers *"is this city actually ready?"* at a glance.

## What we ship (demoable)

A working single-page dashboard over 63 mock candidate SNGs across 8 LAC countries with three connected views — **Intake & Triage** (pipeline kanban), **Readiness Scoring** (transparent weighted model + per-candidate file), and **M&E & Board** (indicators vs. milestone timeline). Ugly-but-real beats a slide.

> A runnable scaffold already exists in `../control-tower/` — open `index.html`. The plan below is about turning that skeleton into a confident 5-minute demo, not starting from zero.

---

## Roles (play to strengths)

**Ana — Lead, domain fidelity, demo.** Owns the IDB narrative and keeps the build honest to the real SFP criteria (the proposal doc). Curates 3–4 "hero" candidates for the demo, writes and drives the 5-minute story, owns the revenue framing and the warm-IDB-contact angle. Final cut decisions.

**Mirco — AI lead, data + scoring engine.** Owns the data pipeline and the scoring engine wiring. Makes the readiness sub-scores *come from somewhere* — minimum: load the mock dataset and re-score live through `scoring.js`; stretch: pull a couple of real signals from the CityCatalyst Global API for 1–2 hero cities, or an LLM pass that turns a news/document snippet into a governance/political-will signal. Owns intake-form → new-card flow.

**Sean — Finance & M&E credibility.** Owns the four-pillar model that makes a funder nod: the weights, the tier thresholds, and the fiscal/credit indicators (CAPAG A/B/C tiering, own-source revenue, debt-service ratio, operating balance). Defines the M&E indicator set and maps each to a Board milestone so the "prove it to the Board" story lands. This is what separates us from a generic CRUD app.

---

## Scope — MoSCoW (protect the 24h)

**Must (the demo cannot exist without these)**
- Pipeline kanban across the 5 intake→Board stages, 63 candidates. ✔ scaffolded
- Readiness table with the 4 sub-scores + composite + tier, sortable/filterable. ✔ scaffolded
- Candidate drawer showing the score breakdown + IDB eligibility gate. ✔ scaffolded
- M&E indicators vs. Board milestone timeline. ✔ scaffolded
- A clean 5-min narrative tied to revenue.

**Should**
- "New proposal" intake form that drops a card into Intake and scores it.
- One or two **real** CityCatalyst signals on a hero city (proof the pipe is real).
- A visible "why this score" explanation in the drawer (per-pillar contribution).

**Could**
- AI/LLM signal: feed a news snippet → governance or political-will sub-score.
- Country roll-up view; map view reusing the Geo Layer Viewer.
- Export a one-page "Board brief" PDF for a selected cohort.

**Won't (this hackday)**
- Auth, real DB, multi-user, write-back to IDB systems, production data licensing.

---

## Hour-by-hour (T+0 = 15:00 GMT Thu)

**T+0 → T+2 · Align & divide.** Walk the existing scaffold together. Lock the four pillars, weights and tier cut-offs (Sean). Agree the 3–4 hero candidates and the demo spine (Ana). Confirm data schema so all three can work in parallel (Mirco). *Exit: everyone has an owned surface and no merge collisions.*

**T+2 → T+6 · Parallel build I.**
- Mirco: wire intake form → scored card; make scoring fully live from `scoring.js`; spike one CityCatalyst Global API call.
- Sean: finalize indicator definitions + CAPAG/fiscal signals; sanity-check that "Ready" tier cities actually look creditworthy; tune M&E targets/statuses.
- Ana: draft demo script v1; mark hero candidates; pressure-test eligibility logic against the IDB doc.

**T+6 → T+8 · Integrate + checkpoint.** Merge branches, smoke-test, screenshot. Honest call: is the real-data spike paying off or do we lock to mock? *Cut-line decision here.*

**T+8 → T+15 · Build II / rest.** Land the top "Should" items (intake form, why-this-score, one real signal). Stagger sleep across timezones — never all three offline. Leave the build green before anyone logs off.

**T+15 → T+19 · Polish.** Lock data (no more schema changes). Tighten styling, empty states, the drawer. Add country roll-up *only if* time. Freeze features at T+19.

**T+19 → T+22 · Demo hardening.** Rehearse end-to-end twice on the actual machine/screen used for the demo. Pre-click the hero path. Record a 90-second screen capture as fallback if anything breaks live.

**T+22 → T+24 · Buffer + submit.** Push to repo, update README, paste demo link. Breathe.

---

## 5-minute demo script

1. **The problem (45s).** "IDB just launched a 5-year pilot to lend directly to cities *without* a sovereign guarantee. It only survives if it proves itself to the Board — but the team is screening 63 candidates across 8 countries in scattered spreadsheets."
2. **Intake & triage (60s).** Show the pipeline. Drop a new proposal in → it lands in Intake already scored. "Every incoming project, triaged in one place."
3. **Readiness — the hard question (90s).** Open a hero city's file. "Here's the funder's hardest question — *is this city actually ready?* — answered: credit, fiscal, legal, governance, composite, tier, and the IDB eligibility gate. These signals come from **CityCatalyst** — that's OEF's trust layer."
4. **M&E & the Board (75s).** "And here's how the whole pilot tracks against its Board reporting milestones — the view that keeps the pilot alive."
5. **Who it's for + revenue (30s).** "First customer: IDB's Cities division, where we have a warm contact. The same control-room pattern sells to any MDB running sub-sovereign or urban-finance pilots — funder tool + data service."

## Revenue connection (say it explicitly)

Funder tool / data service. OEF supplies the trust infrastructure (CityCatalyst readiness signals + scoring); the MDB buys the control room. Repeatable across IDB, World Bank, CAF, BNDES, and other MDBs running subnational pilots. Pull-through for CityCatalyst city onboarding.

## Risks & cut-lines

- **Real-API rabbit hole.** Time-box the CityCatalyst spike to T+8. If it's not clean, demo on mock data with *one* real signal as proof and move on. Mock data is the default, not the failure.
- **Over-scoping all three pillars deep.** Each pillar is intentionally shallow — the *integration* is the wow, not any single screen.
- **Credibility gap.** A funder will probe the score. Sean's weights/thresholds and grounding in the IDB criteria are the defense; keep the "why this score" visible.
- **Demo fragility.** Pre-clicked hero path + a recorded fallback clip.

## After the hackday

If it lands: a follow-up sprint to wire real CityCatalyst + CAPAG data, a shareable instance for the IDB warm contact, and a one-pager positioning it as an MDB control-room product. Standout projects get visibility with partnerships + leadership.
