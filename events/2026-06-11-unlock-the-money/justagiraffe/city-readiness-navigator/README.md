# City Readiness Navigator

The **city-facing front door** that joins the two hackday modules into one platform:
the [City-Funder Matching Engine](../funder-scan) (which funders can my plan reach?) and
the [justagiraffe Control Tower](../../justagiraffe/control-tower) (the IDB-side pipeline).
A city builds readiness inside CityCatalyst and, when it presses **Ready**, the deal
appears on the funder's side of the screen.

Built to the [PRD](../../justagiraffe/PRD-city-facing-readiness-app.md). This is the
**Phase 0–3** standalone prototype (real data, runs locally); the CityCatalyst module
embed (OAuth, live city context, HIAP) is Phase 4.

## Run it

```bash
cd events/2026-06-11-unlock-the-money/justagiraffe/city-readiness-navigator
npm install
npm run dev
```

Open http://localhost:3000.

- **City journey** (`/`) — enter → discover → pick target → diagnose readiness → prepare → pool → submit.
- **Funder pipeline** (`/pipeline`) — quick in-app preview of the Control Tower handoff.

### Full cross-app demo

In a **second terminal**, run the Control Tower:

```bash
cd events/2026-06-11-unlock-the-money/justagiraffe/control-tower
npm run dev
```

Open http://localhost:8000 → **Intake** tab → **Approve** the submitted dossier. Approved
candidates also appear in Control Tower **Readiness Scoring** and **Project Review**.

See [`../README.md`](../README.md) for the full walkthrough.

> The submission store is in-memory (resets when the dev server restarts).

## What's real vs. mock

- **Real:** the four-pillar readiness for the six Los Ríos comunas is driven by the
  Matching Engine's **SINIM/FCM** capacity data (`fiscalHealth`, `governance` badged
  *real*); funders-open counts, the transport gap, and the pool come from its derived
  CSVs. See [`data/README.md`](data/README.md).
- **Estimated/intake:** creditworthiness (no public Chilean municipal rating) and legal
  capacity (a legal opinion, not a dataset) are badged accordingly.
- **Mock/Phase 4:** live CityCatalyst city-context + HIAP wiring.

## The Valdivia story (real numbers)

Valdivia scores **71 · Ready** and clears creditworthiness — but its transport project
*alone* is sub-scale (US$8M < US$15M high-impact threshold) and no instrument fits one
city. Its neighbours aren't ready to borrow alone. **Pooling** unit 11 (Valdivia as
anchor, US$30M bundle) clears the IDB ticket and is project-eligible — *the gap becomes
the deal*, and it lands in the IDB pipeline.

## How it's wired

```
Matching Engine CSVs ──(scripts/build-data.mjs)──▶ src/data/valdivia.json
                                                          │
src/lib/readiness/  ◀── vendored from control-tower ──────┤  (the Readiness Engine
  scoring.js + readiness-profiles.js                      │   + pluggable profiles)
                                                          ▼
                  src/app/page.tsx (city journey) ──POST──▶ /api/submissions
                                                          ▼
                              src/app/pipeline/page.tsx (preview)
                                                          │
                              control-tower Intake tab ◀──┘
```

Regenerate the data: `npm run build:data`.

## Stack

Next.js 15 + React 19 + TypeScript, plain CSS (CityCatalyst blue, Poppins/Open Sans).
Chakra UI is the target for the Phase-4 in-platform module (per the PRD); kept out here
to keep the prototype dependency-light and reliable.
