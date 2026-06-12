# Derived data

Everything the engine **computes** from `raw/` and `input/`. Source data stays upstream; this folder is output only — delete it and it can be rebuilt from the inputs.

```
raw/      ── primary sources (SINIM, MMA/FCM, OCHA boundaries)   ── as collected
input/    ── canonical, harmonized inputs (City · Action · Funder) ── one row per entity
derived/  ── engine results (this folder)                         ── scores, matches, units, bundles
```

The engine has two halves. **National tables** are computed once for all of Chile and reused for every city. **Worked-example tables** (prefixed `valdivia_`) show the per-city result for the demo city; running another city re-computes only these.


## Files

### Action → Funder  *(national)*
| File | Rows | Key columns | What it is |
|------|------|-------------|------------|
| [`action_coordination.csv`](action_coordination.csv) | 102 | `coordination_tier`, `what_pooled`, `instrument_class`, `action_role` | Every climate action tagged with its coordination tier (`highly` / `semi` / `idiosyncratic`) and the instrument class that fits. Gates what can be bundled. |

### Pooling  *(national)* — capacity → units → bundles
| File | Rows | Key columns | What it is |
|------|------|-------------|------------|
| [`comuna_capacity_scores.csv`](comuna_capacity_scores.csv) | 314 | `anchor_score`, `cofinance_score`, `composite_score`, `fcm_dependency_pct` | Two purpose-built 0–100 scores per comuna (see methodology below). *Who can lead* vs *who can co-finance*. |
| [`comuna_action_priority.csv`](comuna_action_priority.csv) | 314 | `sal_StationaryEnergy`, `sal_Transportation`, `sal_Waste`, `sal_AFOLU`, `sal_IPPU` | Per-comuna salient-sector flags — a proxy for the City→Action edge nationally (which sectors matter where), derived from employment + transport indicators. |
| [`coordination_units.csv`](coordination_units.csv) | 345 | `unit_id`, `unit_anchor`, `unit_size`, `unit_viable_anchor` | 345 comunas grouped into **77 contiguity-based units**, each with a designated anchor. |
| [`unit_bundle_candidates.csv`](unit_bundle_candidates.csv) | 634 | `sector`, `coordination_tier`, `n_comunas_sharing`, `actor_route`, `bundle_feasible` | **The join.** Per `unit × sector × tier`: how many comunas share the action, the instrument class, and whether the bundle is feasible. This is where pooling becomes concrete. |
| [`coordination_units_map.png`](coordination_units_map.png) | — | — | National map of the 77 units (green = viable anchor, orange = TA-dependent). |

### Figures *(notebook: interactive maps; script: static PNGs)*

| Output | Notebook (`notebooks/analyze.ipynb`) | Script (`scripts/analyze.py`) |
|--------|--------------------------------------|-------------------------------|
| National coordination | GeoDataFrame `.explore()` by `pool_status` | `coordination_units_map.png` |
| Valdivia pool (unit 11) | GeoDataFrame `.explore()` by `pool_role` | `valdivia_unit11_pool.png` |
| Feasible bundles | pivot table (text) | `bundle_feasibility.png` |

Regenerate:

- `notebooks/analyze.ipynb` — run all cells (interactive maps, no PNG writes)
- `python scripts/analyze.py` — headless PNG export

### City → Funder  *(worked example — Valdivia)*
| File | Rows | Key columns | What it is |
|------|------|-------------|------------|
| [`valdivia_funders_open.csv`](valdivia_funders_open.csv) | 78 | `program`, `funder`, `role`, `cf_score`, `eligible_actor` | "Funders open to you" for Valdivia — each fund tagged with the city's role: **applicant** / **facilitator** / **referrer**. |
| [`valdivia_action_matches.csv`](valdivia_action_matches.csv) | 102 | `best_funder`, `af`, `cf`, `combined`, `verdict` | Each Valdivia action matched to its best-fit funder, with the per-edge scores and a verdict (match / referrer-route). |

## How it's produced

```
input/chile_funders_detail.csv ─┐
                                 ├─► valdivia_funders_open.csv      (City→Funder: eligibility × geography × role)
input/city_profile_valdivia.json ┘
input/actions.csv ──────────────► action_coordination.csv ─┐
                                                            ├─► valdivia_action_matches.csv  (Action→Funder × priority)
input/chile_funders*.csv ──────────────────────────────────┘

input/city_indicators.csv ─┐
raw/sinim_*.csv ───────────┼─► comuna_capacity_scores.csv ─┐
raw/fcm_dependency_2023.csv┘                               │
input/city_indicators.csv ──► comuna_action_priority.csv   ├─► coordination_units.csv ─► unit_bundle_candidates.csv
input/raw_data_cl_ocha_ab ──(adjacency)────────────────────┘
```

## Scoring methodology (the two capacity scores)

Deliberately split — they answer different funding questions and correlate only 0.37:

- **`anchor_score`** — *absolute* formulation capacity: professionalization %, absolute professional staff (prof% × total staff), total municipal income. Answers *"who can lead — formulate BIP/FNDR projects, be Sponsoring Entity, manage contracts?"*
- **`cofinance_score`** — *per-capita* fiscal autonomy: inverse FCM dependency, IPP per capita, % IPP in total income. Answers *"who can put up match funding / sustain opex?"*

Why split: per-capita fiscal wealth ≠ ability to lead. Tiny resource-rich comunas (e.g. Sierra Gorda, pop ~1,500) top co-finance but can't anchor; large municipalities (Providencia, Valparaíso, Concepción) top anchor capacity.

**Funding roles:** *anchor* (highest `anchor_score` in its unit — holds the pen and the contract) · *co-finance capable* (`cofinance_score` ≥ 50) · *supported* (low on both; viable only inside a led group, with TA).

## How units are built

1. Adjacency from comuna geometries (shared edge; 801 links, ~4.6 neighbours each).
2. Greedy, **region-bounded**: seed a unit from each strong anchor (`anchor_score` ≥ P60), attach contiguous unassigned neighbours (cap 6).
3. Stragglers join the adjacent unit with the strongest anchor; leftovers form residual units, flagged if no viable anchor.
4. Islands (Easter I., Juan Fernández, etc.) are singletons.

A unit has a **viable anchor** if its lead's `anchor_score` ≥ national median (50).

**v1 results:** 77 units · 68 with a viable anchor · 330/345 comunas in a viable-anchor unit. The 9 anchor-less units are the fragile peripheries (Tierra del Fuego, remote Patagonia, Chiloé islands) — where TA must be funded *into* the pool from day one.

## Caveats / next

- Adjacency is physical contiguity, not existing municipal-association membership (the vehicle that actually holds pooled funds) — best next data add.
- Greedy grouping leaves a few singletons (e.g. Tocopilla) as artifacts; a community-detection pass would smooth these.
- 17 comunas lack 2023 staffing data → `anchor_score` leans on total income for those.
- `valdivia_*` tables are the demo city only; the national tables already generalize, so scaling is a batch re-run of the City edge, not new logic.

Sources: SINIM/SUBDERE (capacity), MMA Anexo B (FCM), CityCatalyst/INE (socioeconomic), OCHA admin boundaries (geometry). Year 2023.
