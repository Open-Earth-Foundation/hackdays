# Bundling synthesis — coordination units × action tiers

Joins the two aggregation axes the [problem & model](./00-problem-and-model.md) defines:
- **Pool cities** (City axis) → `data/derived/coordination_units.csv` — 77 contiguity
  units, each with an anchor; 68 have a *viable* anchor (lead with formulation capacity).
- **Bundle actions** (Action axis) → `data/derived/action_coordination.csv` — 102
  actions scored 🟢/🟡/🔴 per [action-coordination](./04-action-coordination.md).

## A bundle is the intersection of both axes
A financeable, coordinated package = **a viable-anchor unit × an action archetype at a
poolable tier**, with the actor edge intact. The tier dictates *what* gets pooled:

| Action tier | What the unit pools | Who must exist in the unit | Route |
|---|---|---|---|
| 🟢 capex | one procurement / facility | a **viable anchor** to hold contract + co-finance | FNDR / municipal-association pooled grant·loan·ESCO |
| 🟡 prep | feasibility + standardized *Bases*, shared pipeline | an anchor to lead formulation | programmatic / blended |
| 🔴 grant/TA | nothing pooled — matched per comuna | **no anchor needed** | grant / PES / TA |

## The cross-axis result worth keeping
The two axes are **self-consistent**, and it resolves the apparent dead-end of the
anchor-less units:

- 🟢/🟡 bundles **require an anchored unit** — someone has to formulate the BIP, hold the
  pooled contract, and bring match funding. The 68 viable-anchor units can do this; the
  9 anchor-less units (Tierra del Fuego, remote Patagonia, the islands) **cannot** — a
  capex pool with no lead is the failure mode.
- But those same anchor-less comunas are dominated by 🔴 actions. They are forestry/AFOLU
  territory (per [findings #3](./02-findings.md), 11 of 12 Los Ríos comunas are net carbon
  *sinks*), and 🔴 actions are **grant/PES/TA — which need neither pooling nor an anchor.**

So a missing anchor is only fatal for the capex/prep bundles, exactly the actions those
peripheral comunas are *least* likely to prioritise. Where there is no anchor, the
relevant money is grant/TA anyway. The model doesn't strand them — it routes them
differently.

## Still gated by the actor edge
A 🟢 tier is necessary, not sufficient. Rooftop solar is standardized capex, but if the
eligible applicant is the household the city is a **referrer**, not an applicant — no
bundle the municipality can legally hold ([findings #4](./02-findings.md)). Score both
edges before declaring a bundle.

## The data gap that blocks populating real bundles
We can now score both axes, but **we cannot yet assemble specific bundles**, because that
needs each comuna's *prioritised actions* (the City→Action / HIAP edge). We only hold that
for **Valdivia + the Los Ríos prototype**, not the 314/345 comunas. Concretely, to fire
the doc-04 Los Ríos LED example we'd need: for each comuna in a unit, its top actions →
filter to a shared 🟢/🟡 archetype → confirm the anchor can hold it → emit the bundle.

**Next data add:** per-comuna HIAP `/prioritize` action lists (or even a coarse
sector-priority proxy from the gross-emissions profile). With that, the engine produces
named bundles per unit instead of just scored axes.

## Files
- `data/derived/action_coordination.csv` — action_id, name, sector,
  intervention_type, cost, timeline, `coordination_tier`, `what_pooled`, `instrument_class`.
- Distribution: 27 🟢 · 39 🟡 · 36 🔴. All AFOLU → 🔴; energy infrastructure → 🟢.
- Tiers are heuristic v1 (sector + intervention_type + cost + archetype keywords); should
  be expert-reviewed per archetype before use in scoring.
