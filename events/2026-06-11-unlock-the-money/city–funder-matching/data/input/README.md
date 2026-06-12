# Input data

Canonical inputs for the city ↔ funder matching engine. Each file maps to one side of the tripartite model (City, Action, Funder) or shared geography.

## Files

| File | Entity | Rows | What it is |
|------|--------|------|------------|
| [`actions.csv`](actions.csv) | **Action** | 102 | Mitigation actions from the Global API (`GET /api/v1/action-pathways`). One row per action with GPC sector refs, cost/timeline, co-benefits, and en/es/pt text. Drives the **Action→Funder** edge (sector + instrument fit). |
| [`chile_funders.csv`](chile_funders.csv) | **Funder** | 78 | Chile climate-finance inventory — one row per funding instrument/call. Core fields: funder, eligible actor, instrument type, amount, GPC sectors, open/close dates, status, source URL. Baseline for both funding edges. |
| [`chile_funders_detail.csv`](chile_funders_detail.csv) | **Funder** | 78 | Same 78 funds as above, merged with per-call enrichment from official Bases pages (`enr_*` columns: objective, eligibility detail, dates, document links). Use when you need eligibility nuance beyond the inventory schema. |
| [`city_profile_valdivia.json`](city_profile_valdivia.json) | **City** | 1 | HIAP `/prioritize` payload for **Valdivia** (`CL ZAL`): GPC-subsector emissions (2020 inventory), strategic preferences, ranked action context. Example city for the demo; drives **City→Action** (HIAP) and **City→Funder** (eligibility + geography). |
| [`city_indicators.csv`](city_indicators.csv) | **City** | 6,386 | Long-format municipal indicators for **314 Chile comunas** (33 attribute types — demographics, infrastructure, fiscal capacity, etc.). Keyed by `locode`. Supplements city profiles where population or capacity signals are missing. |
| [`raw_data_cl_ocha_ab.geojson`](raw_data_cl_ocha_ab.geojson) | **Geography** | 345 | Chile comuna boundaries (OCHA COD-AB 2021). Simplified polygons (~4 MB) with `locode`, `comuna_name`, `region_name`. Used for regional/national fund geography checks and map layers. |
| [`raw_data_cl_ocha_ab.parquet`](raw_data_cl_ocha_ab.parquet) | **Geography** | 345 | Full-resolution source for the GeoJSON above. **Not in git** (~60 MB) — copy locally (see below). |

## How they connect

```
city_profile_valdivia.json ──┐
city_indicators.csv ─────────┼──► City→Funder edge (eligibility, geography, capacity)
raw_data_cl_ocha_ab.* ──────┘

actions.csv ─────────────────────► Action→Funder edge (sector, instrument, amount)

chile_funders.csv ───────────────► baseline fund list
chile_funders_detail.csv ────────► enriched eligibility + doc links
```

## Provenance

| File | Source |
|------|--------|
| `actions.csv` | Global API action pathways (exported from `response_*.json`) |
| `chile_funders*.csv` | OEF Chile finance inventory — `CityCatalyst-global-data` `dataset-review/reviews/oef/cl-finance-inventory/` |
| `city_profile_valdivia.json` | CityCatalyst HIAP prioritize payload (Valdivia 2020 inventory) |
| `city_indicators.csv` | Global API city indicators (CL comunas) |
| `raw_data_cl_ocha_ab.*` | OCHA ROLAC admin boundaries — `CityCatalyst-global-data` `dataset-review/reviews/ocha-rolac/cl-ocha-ab/releases/2021/` |