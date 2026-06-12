# Funder Scan — City ↔ Funder Matching

> One engine that turns a city's climate plan into the funders it can actually reach — and pools
> the gaps into financeable deals. A premium CityCatalyst capability for cities; a ready pipeline
> for regions and development banks.

## What We Built

A polished, interactive walkthrough of the matching engine, built on Chile. It scores two
funder-facing edges of every `(city, action, instrument)` triple — *can this city access this
funder?* and *is this the right kind and size of money?* — then does the part one city can't: where
a single comuna has no viable match, it **pools** that comuna with its neighbours into a
standardized package a development bank can underwrite. The demo opens at national scale (68 viable
pools, 308 candidate bundles), drills into Los Ríos, meets Valdivia, finds its transport gap, and
turns that gap into a six-comuna deal.

## Revenue Connection

The event theme is **trust** — if funders can't trust cities, money doesn't move. This is the
matching/trust layer: a premium capability for cities and consultancies ("fund my plan"), and a
data service for regions and development banks ("here's your pre-bundled, de-risked pipeline").
OpenEarth becomes infrastructure in the deal flow.

## How to Run

```bash
cd events/2026-06-11-unlock-the-money/apps/funder-scan
npm install
npm run dev
# Open http://localhost:3000
```

To regenerate the data from the derived CSVs (optional — outputs are committed in `public/data/`):

```bash
npm run data   # runs scripts/build_data.py (needs python3 + shapely)
```

## Demo Script (5 min)

1. **The national pipeline** — open at scale: 68 viable pools, 308 candidate bundles, 262 comunas
   that can't fund alone. Hover the map. Say it straight: *candidate pipeline, not costed deals.*
2. **Drill into Los Ríos** — the region view in miniature; Valdivia anchors unit 11.
3. **Meet Valdivia** — funders open to you: 52 you can apply to, 1 you facilitate, 25 you can only
   refer. The 25 are the **actor gap** — the #1 error mode.
4. **The gap** — Valdivia's 8 transport actions have no dedicated instrument; best fit 0.61. For one
   city, a dead end.
5. **The pool (payoff)** — transport is 🟢 poolable, so the engine pools Valdivia with five
   neighbours. Corral (5,493 people, co-finance 10.7) could never lead; Valdivia (65.7) can.
   **Closing line:** *the same engine that returned "no match" for Valdivia alone returns a
   financeable package for six comunas — and a pipeline of 308 for the country.*

## What We Score vs. Flag (the honesty)

Green = scored (sector, actor/role, timing, coordination, bundle feasibility). Red = flagged, not
faked (**adequacy/amounts**, **competitiveness/award rate**). Demand is a proxy, not real HIAP yet.
That discipline is what makes the output trustworthy.

## Built With

- Next.js 15 / React 19
- react-leaflet + Leaflet (interactive choropleths)
- CityCatalyst design tokens (Poppins / Open Sans, CC blues)
- Data from `../city–funder-matching/data/derived/` via `scripts/build_data.py`; reproducible in
  `../city–funder-matching/notebooks/analyze.ipynb`.

## If This Survives the Hackday

- [ ] Swap the demand proxy for real CityCatalyst `/prioritize` payloads → named per-action bundles.
- [ ] Join `chile_funders.csv` to name the actual fund/call per bundle (not just instrument class).
- [ ] Add adequacy + competitiveness from per-call *Bases* enrichment and award history.
- [ ] Region selector to swap Los Ríos for any of the 62 multi-comuna units.
