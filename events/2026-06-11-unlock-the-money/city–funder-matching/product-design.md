# Product Design — City ↔ Funder Matching Engine

**Hackday "Unlock the Money" · Demo: 12 June 2026, 15:00 GMT**
Team: Amanda, Ayinawu, Brian, Cephas · Scope: Chile · Worked example: **Valdivia** (Los Ríos)

> The build brief. The thinking lives in [`research/`](./research/); the data in [`data/derived/`](./data/derived) and the analysis in [`notebooks/analyze.ipynb`](./notebooks/analyze.ipynb). This doc turns all of it into one demoable thing — built around a single engine that serves two buyers, with pooling as the payoff.

---

## 1. What we're building (in one sentence)

One engine that takes a climate plan, shows which funders it can actually reach for each action, finds where a single city has *no real match* — and **pools that city with its neighbours into a package that's financeable**. It serves a **city** ("fund my plan") and a **region** ("here's my ready pipeline of pooled deals") off the same computation.

## 2. The 60-second pitch

Cities have needs, funders have instruments, and the matching is manual today. We built the engine that does it automatically — and the interesting part isn't the easy matches, it's the **gaps**. When Valdivia tries to fund its transport plan (e-buses, BRT), there's no dedicated instrument and it's too small to clear a development-bank ticket alone. That's where most cities stop. Our engine doesn't: because transport is a *standardized, poolable* action, it bundles Valdivia with five Los Ríos neighbours into one programmatic package, anchored on the only comuna with the balance sheet to lead. **The gap becomes the deal.** And it's not a one-off: nationally the engine already finds **308 financeable pooled bundles across 62 multi-comuna units**. That's the trust-and-deal-flow layer funders need — a premium CityCatalyst capability for cities, and a ready pipeline for regions and development banks.

## 3. The engine (concept recap)

A match is not a fund and not a city — it's a **triple `(city, action, instrument)`**. We compute two funder-facing edges (the third, City→Action, is CityCatalyst's HIAP prioritisation):

- **City → Funder** — "can this city access this funder at all?" Once per city. Output: *funders open to you*, each tagged with the city's role: **applicant** / **facilitator** / **referrer**.
- **Action → Funder** — "is this the right kind and size of money?" Once at country level. Output: a *financing playbook* per action, plus a **coordination tier** (🟢/🟡/🔴) that gates whether the action can be pooled.

Two aggregations sit on top, and **both are now built in data**:

- **Pool cities** → [`coordination_units.csv`](./data/derived/coordination_units.csv): 345 comunas grouped into 77 contiguity units, 68 with a viable anchor.
- **Bundle actions × pool** → [`unit_bundle_candidates.csv`](./data/derived/unit_bundle_candidates.csv): the join of *viable-anchor unit × poolable action archetype × intact actor edge*. This is the financeable-package object.

Model: [`research/00-problem-and-model.md`](./research/00-problem-and-model.md) · coordination theory: [`research/04-action-coordination.md`](./research/04-action-coordination.md) · bundling: [`research/05-bundling-synthesis.md`](./research/05-bundling-synthesis.md), [`research/06-national-bundles.md`](./research/06-national-bundles.md).

## 4. Two products on one engine — and who values what

The same computation produces two surfaces. The **region** surface is the sharper, less-served, and more bankable of the two — and it only exists *because* of pooling.

### City view — "fund my plan" *(buyer: a city / consultancy)*
What a city officer gets, for their own comuna:
- **Funders open to you** — your applicable funds vs. the ones you can only facilitate or refer, so you stop spending weeks on applications you're not eligible to hold (the actor gap).
- **Financing playbook per action** — for each plan action, the instrument class and best-fit fund, with the gaps named.
- **Readiness/timing** — windows are short (~3–6 wk, 31/78 funds annual); be staged for the next one, not just well-matched.

Value: real, but *incremental* — it makes an existing manual job faster and less error-prone.

### Region view — "your pooled pipeline" *(buyer: a GORE / FNDR / municipal association / development bank)*
What a region gets, across all its comunas at once:
- **The feasible pooled packages** — "across your comunas, here are the bundles (energy / transport / waste) that clear an FNDR or development-bank ticket size that none of your small comunas could reach alone."
- **The anchor for each pool** — which comuna can hold the contract and bring co-finance.
- **The TA targets** — which anchor-less comunas need technical assistance funded *into* the pool from day one.

Value: this *creates* a deal pipeline that didn't exist. It's literally the GORE's job (allocating regional investment) and exactly what a development bank wants delivered — pre-bundled, de-risked, with the lead already identified. **This is the unlock, and it's where OEF becomes infrastructure in the deal flow.**

## 5. The national pipeline (the scale proof)

Computed once, reusable for every region. From [`research/06-national-bundles.md`](./research/06-national-bundles.md) and regenerable in [`notebooks/analyze.ipynb`](./notebooks/analyze.ipynb):

- **77 coordination units · 68 with a viable anchor · 262 "passenger" comunas** that can't lead alone but pooling pulls in.
- **308 feasible municipal bundles across 62 of 67 multi-comuna units**; **296 / 314 comunas** (of the 345 comunas grouped into units; 314 have full capacity data) sit in a unit with a viable anchor *and* a shared poolable sector.
- These are **candidate pipelines, not costed deals** — poolable by sector × tier, with adequacy (amounts) and competitiveness still flagged 🔴. The bundle clears a ticket none clears alone *structurally*; no dollar ticket size is computed yet.
- Feasible bundles by sector × tier:

  | Sector | 🟢 highly-coordinated (capex) | 🟡 semi-coordinated (prep) |
  |--------|---:|---:|
  | Stationary Energy | 62 | 62 |
  | Transportation | 49 | 49 |
  | Waste | 43 | 43 |

- Flagship energy-capex pools (one procurement, FNDR / municipal-association route): **Pelluhue** (Maule, 13 comunas), **Padre Las Casas** (Araucanía, 12), **Santa Cruz** (O'Higgins, 9), **Puchuncaví** (Valparaíso, 9), **Puerto Montt** (Los Lagos, 9), **Rancagua** (O'Higgins, 8).

Maps & tables — [`notebooks/analyze.ipynb`](./notebooks/analyze.ipynb) (interactive `folium` maps, demoable live):
- national coordination map — comunas shaded by pool viability.
- Valdivia unit-11 pool map — the Los Ríos worked example below.
- feasible-bundles-by-sector table + the summary numbers above.

## 6. Worked example — Valdivia & Los Ríos unit 11

The per-city result, and the pool it anchors (`coordination_units.csv`, unit_id 11):

**City (Valdivia):** 52 funders it can apply to directly · 1 it can only facilitate (Casa Solar) · 25 referrer-only (FPA family + CORFO). Across 102 plan actions: 75 match, 27 need a referrer route. **Transport (8 actions): no dedicated instrument — best fit is a generic SUBDERE risk-prevention program at 0.61.** For one city, a dead end.

**Pool (the pivot):** transport is 🟢 high-coordination, so the engine pools Valdivia with its unit:

| Comuna | Population | FCM dependency | Co-finance score | Role |
|--------|-----------:|----------------|-----------------:|------|
| **Valdivia** | 166,958 | 57% (high) | **65.7** | **Anchor** (only viable lead) |
| Paillaco | 19,719 | 67% (high) | 43.5 | Member |
| Los Lagos | 21,421 | 68% (high) | 42.8 | Member |
| Máfil | 8,036 | 80% (very high) | 25.5 | Member |
| Corral | 5,493 | 88% (very high) | 10.7 | Member |
| Mariquina | — | — | — | Member |

**Corral (5,500 people, 88% transfer-dependent, co-finance 10.7) could never lead a development-bank deal. Valdivia can.** Pooling lets the small, dependent comunas ride the anchor's balance sheet and a shared standardized procurement — the model behind Nordic municipal funding agencies and EIB ELENA (one homogeneous asset, one legal regime; Chile gives us the single regime for free).

## 7. The demo spine — zoom out, then in

Five beats. Open at the region/national scale (the unlock), then dive to the human worked example.

| # | Beat | What's shown | Source |
|---|------|--------------|--------|
| **1** | **The national pipeline** | The map + headline: *68 viable pools, 308 **candidate** bundles, 262 comunas that can't fund alone.* Scale first — but say it straight: these are *candidate pipelines, not costed deals* (poolable by structure; amounts/competitiveness still flagged 🔴), and demand is a proxy, not real HIAP yet. | `analyze.ipynb` (national map + bundle table) |
| **2** | **Drill into a region** | Los Ríos: the comunas, the units, where the pools are. The region view in miniature. | `coordination_units.csv` |
| **3** | **Meet the city** | Valdivia: plan, population 166,958, FCM dependency 57%, and *funders open to you* (52 / 1 / 25 with role tags). | `city_profile_valdivia.json`, `valdivia_funders_open.csv` |
| **4** | **The gap** | The transport playbook: 8 actions, no dedicated instrument, best fit 0.61. Where one city stops. | `valdivia_action_matches.csv` |
| **5** | **The pool (payoff)** | Transport is 🟢 → pool unit 11. Valdivia anchors five neighbours into one FNDR package that clears a ticket none clears alone. | `analyze.ipynb` (unit-11 map), `unit_bundle_candidates.csv` |

**Closing line:** *"The same engine that returned 'no match' for Valdivia alone returns a financeable package for six comunas — and a pipeline of 308 for the country."*

## 8. What we score vs. what we honestly flag

A deliberate discipline — and a selling point. A funder trusts a tool that says "I don't know" precisely.

| Dimension | Status | In the demo |
|-----------|--------|-------------|
| Sector fit | 🟢 scored | yes |
| Actor / eligibility (role) | 🟢 scored | yes — the role tags |
| Timing / window | 🟢 scored | mention (~3–6 wk windows) |
| Geography | 🟡 inferred | yes (region join) |
| Coordination / poolability | 🟢 scored | yes — the pivot |
| Bundle feasibility | 🟢 scored (proxy) | yes — but at sector×tier, not per-action |
| **Adequacy (amount)** | 🔴 flagged | name as roadmap (Bases enrichment) |
| **Competitiveness (award rate)** | 🔴 flagged | name as roadmap (award history) |

Say it in the demo: *"Green is scored, red we flag rather than fake — that discipline is what makes a funder trust the output."*

## 9. Build plan

**Recommended deliverable:** one self-contained, browser-openable page that walks the five beats. Live demo > slides. The data and figures already exist — this is assembly, not new analysis.

- **Must (the spine):** beats 1→5 wired in sequence, real numbers from `derived/`. Lead with the national map, land on the Valdivia pool. Static/hardcoded is fine.
- **Should (the click):** make the transport gap (beat 4) *flow into* the pool (beat 5) as one interaction; embed the notebook's two interactive maps (or screenshots of them).
- **Could (polish):** a region selector (swap Los Ríos for another of the 62 units); a "fundability" teaser from `comuna_capacity_scores.csv`; per-edge score breakdown on hover.

**Tech:** single `index.html` + the `derived/` CSVs, with the two interactive maps from `notebooks/analyze.ipynb` (live or screenshot). No backend. The notebook regenerates the maps and the summary numbers (`pip install -r requirements.txt`). Reuse `apps/_template` only if the team wants routing.

**Owners (suggested):** Amanda — narrative + region/city value framing; one — the HTML walkthrough shell; one — wiring the figures + region drill; one — demo script + closing line.

## 10. Where the data stands & open seams

**Built:** both edges (Valdivia), the coordination units, the action tiers, and the **bundle join** (`unit_bundle_candidates.csv`) — at sector × tier granularity, nationally.

**Refinements left (name, don't build today):**
- **Real demand** — bundles use a *proxy* for City→Action (employment/scale thresholds), not true HIAP `/prioritize` per comuna. Swap in real priorities → named per-action bundles instead of sector×tier.
- **Fund-level match on bundles** — bundles currently show an instrument *class*; join `chile_funders.csv` to name the actual fund/call per bundle.
- **Adequacy & competitiveness** — Bases-document enrichment (MMA first) + revealed award history.
- A validation gold-set to prove the rankings.
