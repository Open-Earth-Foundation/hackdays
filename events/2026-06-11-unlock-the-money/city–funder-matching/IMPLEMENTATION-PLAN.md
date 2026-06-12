# Implementation Plan — City ↔ Funder Matching prototype

**Demo: 12 June 2026, 15:00 GMT.** Build target: one polished, interactive web app that walks the
five demo beats from [`product-design.md`](./product-design.md) §7. The thinking and data are done;
this is **assembly**, not new analysis.

## Decisions (locked)

| Question | Decision | Why |
|---|---|---|
| Stack | **Next.js** (`apps/_template` → `apps/funder-scan`) | Asked for; graduates toward a CityCatalyst feature. |
| Styling | **CityCatalyst tokens** (Poppins/Open Sans, CC blues) via a lightweight CSS design system — *not* full Chakra v3 | Looks on-brand; avoids the Chakra-v3 + emotion + i18n build/runtime risk on demo day. |
| Maps | **Interactive choropleth** (react-leaflet) on a **simplified, pre-joined** GeoJSON shipped as a static asset | Nice + interactive, but data is static so there's no live-kernel dependency to fail on stage. |
| Data | **Pre-baked JSON** in `public/data/` from the existing `derived/` CSVs | No backend. Numbers are frozen and verifiable against the notebook. |
| Demo flow | **Single scrollable page**, five beats top→bottom (zoom out → in) | Live demo > slides; matches §7 spine. |

## Architecture

```
apps/funder-scan/
  public/data/
    national.json        # per-comuna: locode, unit, anchor, pool_status, cofinance — KPIs
    comunas.geojson      # simplified geometry + joined pool attributes (national map)
    losrios.geojson      # Los Ríos subset for the unit-11 pool map
    valdivia.json        # funders-open (52/1/25), action matches, transport gap, unit-11 table
  src/app/
    layout.tsx           # fonts + theme vars
    page.tsx             # the five beats in sequence
    globals.css          # CC design tokens + component styles
  src/components/
    Kpi.tsx              # the headline stat cards (beat 1)
    ChoroplethMap.tsx    # react-leaflet map (dynamic import, ssr:false) — national + Los Ríos
    FunderList.tsx       # role-tagged funders open to Valdivia (applicant/facilitator/referrer)
    ActionGap.tsx        # transport playbook: 8 actions, best-fit 0.61, the dead end
    PoolTable.tsx        # unit-11 co-finance table, anchor highlighted
    ScoreBadge.tsx       # green-scored / red-flagged honesty chips
  scripts/build_data.py  # CSV + geojson → public/data/*  (re-runnable)
```

## The five beats (build order = demo order)

1. **National pipeline** — hero KPIs (*68 viable pools · 308 candidate bundles · 262 comunas that can't fund alone*) + national choropleth shaded by pool viability. Honesty chip: *candidate pipeline, not costed deals.*
2. **Region drill** — Los Ríos: its comunas and units, where the pools are.
3. **Meet the city** — Valdivia card (pop 166,958, FCM 57%) + *funders open to you*: 52 applicant / 1 facilitator / 25 referrer, role-tagged.
4. **The gap** — transport playbook: 8 actions, no dedicated instrument, best fit **0.61**. Where one city stops. This is the turn.
5. **The pool (payoff)** — transport is 🟢 poolable → unit-11 map + co-finance table. Valdivia (65.7) anchors five neighbours; Corral (10.7) rides along. The gap becomes the deal. Close on: *same engine, "no match" for one → financeable package for six → 308 nationally.*

## Numbers that must match the data (verify before demo)

308 feasible bundles · 62 of 67 units · 68/77 viable anchors · Valdivia 52/1/25 · 75 match / 27 referrer · transport 8 actions @ 0.61 · unit-11 co-finance Valdivia 65.7 / Corral 10.7. All reproducible from `notebooks/analyze.ipynb` §8.

## Honesty layer (a selling point, keep visible)

Green = scored (sector, actor/role, timing, coordination, bundle feasibility). Red = flagged not faked (**adequacy/amounts**, **competitiveness/award rate**). Say it on beat 1 and beat 5.

## Build sequence

1. `scripts/build_data.py` → bake `public/data/*` (simplify geometry, join attributes). *Verify counts == notebook.*
2. Scaffold: deps, fonts, theme tokens, globals.css.
3. Components bottom-up: Kpi → FunderList → ActionGap → PoolTable → ChoroplethMap.
4. Assemble `page.tsx` (five beats), polish spacing/typography.
5. `npm run build` to typecheck; numbers spot-check; `npm run dev` for the live demo.

## Demo-day checklist

- [ ] `npm install && npm run dev` works from a clean clone.
- [ ] Both maps render and are hover-interactive.
- [ ] Headline numbers on screen == notebook output.
- [ ] Beat 4 → beat 5 reads as one motion (gap → pool).
- [ ] Closing line on screen.
- [ ] Fallback: screenshots of both maps saved, in case of A/V trouble.

## Explicitly out of scope today (name, don't build)

Real per-comuna HIAP demand (using a proxy); fund-level match on bundles (show instrument *class*); adequacy/competitiveness scoring; a validation gold-set. These are the roadmap, stated in the demo, not built.
