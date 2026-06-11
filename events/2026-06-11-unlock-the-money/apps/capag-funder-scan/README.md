# CAPAG Funder Scan

> Brazil's Treasury rates every municipality's creditworthiness. CityCatalyst knows every municipality's emissions, climate risks, and priority actions. Nobody has ever joined the two — until now.

## Team

| Name | Role |
|------|------|
| Joaquin van Peborgh | Dev / Data |
| Carole Viaene | Research / Funder angle |

## What We're Building

A funder-facing scan of all 5,570 Brazilian municipalities that overlays **CAPAG fiscal capacity ratings** (Tesouro Nacional) with **CityCatalyst climate data** (emissions, climate risk, prioritized actions) — so climate funders like BNDES/CCFLA can segment the market and design the right instrument per city:

- **CAPAG A/B** (2,236 cities) → bankable: traditional credit lines + federal guarantees
- **CAPAG C** (2,316 cities) → locked out of federal credit → grant-first / blended finance
- **n.d.** (841 cities) → not even rated (broken accounting) → technical assistance first

## Revenue Connection

Funders' hardest question — "can this city actually absorb and repay climate finance?" — answered at a glance, powered by CityCatalyst data. OEF becomes the trust layer in the deal flow: screening for BNDES/CCFLA, premium scan + per-city investment briefs as a CityCatalyst feature.

## Status

- ✅ Deep research on CAPAG (see `research/` — reusable by other teams)
- ✅ ETL: latest Treasury XLSX → `data/capag.json` (5,568 municipalities, ratings + sub-indicators + ICF)
- ✅ Crosswalk: CAPAG (IBGE) ↔ CityCatalyst (LOCODE) via CCRA BR city list — **99.96% match** (5,566/5,568)
- ✅ Coverage probe: SEEG emissions + CCRA risk verified live for sampled cities in **every** CAPAG tier (32/32)
- ⏳ Product build

## How to Run

```bash
cd events/2026-06-11-unlock-the-money/apps/capag-funder-scan

# data pipeline
python3 scripts/fetch_capag.py          # Treasury XLSX → data/capag.json
python3 scripts/probe_citycatalyst.py   # crosswalk + coverage report

# app
npm install
npm run dev
# Open http://localhost:3000
```

## Demo Script (5 min)

1. [Problem: funders can't tell which Brazilian cities can absorb climate capital]
2. [The scan: 5,570 municipalities, CAPAG tier × climate signal]
3. [The "aha": 2,316 creditless C-cities with high climate need = the blended-finance market nobody can see]
4. [Revenue: screening service for BNDES/CCFLA, premium CityCatalyst feature]
5. [Next: per-city investment briefs, Siconfi live recomputation]

## Built With

- Cursor + Claude
- Next.js / React
- Tesouro Transparente CKAN (CAPAG, ODbL) · CityCatalyst Global API (SEEG + SINIR + SNIS + EPE merged inventory, CCRA risk)
- Chakra UI v3 with CityCatalyst design tokens (see `.cursor/rules/citycatalyst-style.mdc`)

## What We Learned

See `research/` — full verified findings on CAPAG methodology, data access, and gotchas.

## If This Survives the Hackday

- [ ] Per-city investment brief generator (CCFLA direct ask)
- [ ] HIAP prioritized actions in the overlay
- [ ] Live CAPAG recomputation from Siconfi API (TCE-ES-style, national)
