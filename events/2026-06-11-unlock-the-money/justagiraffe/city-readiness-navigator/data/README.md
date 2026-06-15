# Data — source & readiness mapping

## Source (attribution)

`data/source/*.csv` are **trimmed copies** of the City-Funder Matching Engine's
derived outputs (team: Amanda, Ayinawu, Brian, Cephas; branch `city–funder-matching`),
scoped to Valdivia and Los Ríos coordination **unit 11**. Underlying capacity data is
from **SINIM** (municipal fiscal/HR indicators) and **FCM** (transfer dependency),
keyed by UN/LOCODE.

| File | From | Used for |
|---|---|---|
| `comuna_capacity_scores_u11.csv` | `derived/comuna_capacity_scores.csv` | readiness pillar inputs |
| `coordination_units_u11.csv` | `derived/coordination_units.csv` | the pool (anchor, members, co-finance) |
| `unit_bundle_candidates_u11.csv` | `derived/unit_bundle_candidates.csv` | the financeable bundle |
| `valdivia_funders_open.csv` | `derived/valdivia_funders_open.csv` | "funders open to you" (discover) |
| `valdivia_action_matches.csv` | `derived/valdivia_action_matches.csv` | the transport gap |

`scripts/build-data.mjs` transforms these into `src/data/valdivia.json`.

## Capacity → readiness mapping (transparent)

Per comuna, the four readiness pillars (0–100) are derived as:

| Pillar | Formula | Provenance |
|---|---|---|
| **fiscalHealth** | `composite_score` | **real** — SINIM/FCM capacity composite |
| **governance** | `0.5·professionalization_pct + 0.5·composite_score` | **real** — SINIM |
| **creditworthiness** | `0.95·composite_score` | **estimated** — proxy; no public Chilean municipal credit rating |
| **legalCapacity** | anchor → 80, member → 45 | **intake** — stands in for a legal opinion |

Clearance signals (`independentAudit`, `canBorrowWithoutSovereignGuarantee`) are set
true for the anchor only, for the demo — which is why non-anchor comunas are
clearance-blocked and the deal must pool. Each pillar is badged in the UI by provenance.

> These mappings are demo heuristics to show the mechanism on real inputs, not a
> validated creditworthiness model. The point is the *pipe*: real locode-keyed fiscal
> data flowing into a target-specific readiness score.
