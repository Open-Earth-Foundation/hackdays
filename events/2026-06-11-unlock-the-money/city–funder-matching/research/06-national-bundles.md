# National bundle candidates (proxy priorities)

Extends [bundling synthesis](./05-bundling-synthesis.md) from the Valdivia/Los Ríos
sample to **all comunas**, by proxying the missing City→Action (HIAP) edge from data we
already hold. Demand-driven enough to differentiate units; coarser than real HIAP.

## Method
1. **Proxy each comuna's salient action sectors** (`data/derived/comuna_action_priority.csv`):
   - *Stationary Energy* — universal (every municipality owns lighting/buildings → LED, solar, retrofit).
   - *Transportation* — population ≥ national median **or** public-transport share ≥ median.
   - *Waste* — population ≥ median (waste volume threshold).
   - *AFOLU* — agriculture/forestry employment ≥ median (rural/forestry).
   - *IPPU* — manufacturing or mining employment in top 30% (industrial).
2. **Cross with coordination units + action tiers.** For each unit and each salient sector
   shared by **≥2 of its comunas**, emit a bundle candidate at each poolable tier, with the
   tier's instrument class and archetype count.
3. **Gate it.** A candidate is a *feasible municipal bundle* only if: tier is poolable
   (highly/semi), the unit has a **viable anchor**, and it is **not firm-actor**.
   - AFOLU (all idiosyncratic) → no pooled bundle; grant/PES/TA per comuna.
   - IPPU → firm-actor; the city is a **referrer**, not applicant (cf. findings #4) — flagged, not counted as a municipal bundle.

## Results (`data/derived/unit_bundle_candidates.csv`)
- **634 candidate rows → 308 feasible municipal bundles**, across **62 / 65** multi-comuna units.
- **296 / 314 comunas** sit in a unit with a viable anchor *and* a shared poolable sector.
- Feasible bundles by sector × tier:

  | Sector | highly_coordinated (capex) | semi_coordinated (prep) |
  |---|---|---|
  | Stationary Energy | 62 | 62 |
  | Transportation | 49 | 49 |
  | Waste | 43 | 43 |

- Largest energy-capex bundles (one procurement / facility, FNDR / municipal-association route):
  Pelluhue unit (Maule, 13 comunas), Padre Las Casas (Araucanía, 12), Santa Cruz (O'Higgins, 9),
  Puchuncaví (Valparaíso, 9), Puerto Montt (Los Lagos, 9), Rancagua (O'Higgins, 8).

## How to read it
Every viable-anchor unit gets a **universal Stationary-Energy entry bundle** (municipal
LED / solar / retrofit) — consistent with the methodology note's "robust across all
brackets" actions. Transport and waste bundles appear only where the unit has enough
comunas of sufficient scale. The 18 comunas not reached are in anchor-less units
(southern periphery / islands) — served individually by grant/TA (their AFOLU-heavy
profile needs no anchor anyway).

## Caveats (this is a proxy)
- Salience is **sector-level, threshold-based** — not real per-action HIAP demand. A
  comuna flagged "Transportation-salient" is *likely* to prioritise transport actions,
  not confirmed to. Replace with CityCatalyst `/prioritize` payloads for true demand.
- Bundles are at **sector × tier** granularity (archetype proxy), not specific action_ids.
- Greedy grouping produced a few large units (e.g. 13-comuna Maule) with a modest anchor;
  a community-detection pass would tighten these.
- Funder match (Action→Funder) not yet joined — instrument *class* is shown, specific
  funds/calls are the next layer (`chile_funders.csv`).

## Files
- `data/derived/comuna_action_priority.csv` — per comuna, 5 salient-sector flags.
- `data/derived/unit_bundle_candidates.csv` — per unit × sector × tier bundle candidates.
