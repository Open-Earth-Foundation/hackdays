# Data access guide — CAPAG + CityCatalyst

Practical, tested-on-2026-06-11 access patterns. Copy-paste friendly.

## CAPAG (Tesouro Transparente CKAN)

### Discover files programmatically

```bash
curl -s "https://www.tesourotransparente.gov.br/ckan/api/3/action/package_show?id=capag-municipios" \
  | jq -r '.result.resources[] | "\(.name) | \(.url)"'
```

15 resources: XLSX per year 2018→2025 (multiple drops per year since 2024) + a Metadados PDF. No JSON/CSV data API — the CKAN API only catalogs download URLs.

### Latest file (Nov 2025 position)

```
https://www.tesourotransparente.gov.br/ckan/dataset/9ff93162-409e-48b5-91d9-cf645a47fdfc/resource/046f7fcf-a742-4787-9768-dbb10747d55d/download/capag-municipios-posicao-2025-nov-09---processamento-2025-nov-10.xlsx
```

22.6 MB. **11 sheets** (verified by direct download):

| Sheet | Content |
|---|---|
| `Prévia da CAPAG` | **The main one.** All 5,569 municipalities: IBGE code, name, UF, current CAPAG, 3 indicator values + partial grades, ICF grade, data-quality flags |
| `CAPAG Ano Base 2024` / `2023` | Official ratings per base year (70 cols, full audit detail) |
| `Datalake` | Raw pull from Siconfi datalake |
| `DCA_Ultimo/Penultimo_Exercicio` | Annual accounts (savings indicator inputs) |
| `RGF_Ultimo/Penultimo_Exercicio` | Fiscal management report (debt + liquidity inputs) |
| `RREO_Ultimo_Exercicio` | Budget execution report |
| `ChavesBusca` | Lookup keys |
| `Ranking` | ICF accounting-quality ranking |

### Parsing quirk

`Prévia da CAPAG` has 2 junk header rows — real headers are row index 1, data starts row 2. With pandas:

```python
df = pd.read_excel(path, sheet_name="Prévia da CAPAG", header=None, skiprows=2)
df.columns = ["cod_ibge","municipio","uf","capag","ind1","nota1","ind2","nota2",
              "ind3","nota3","icf","obs","origem","dca2024","ind3_antigo","dca2023",
              "rebaixada","ded_neg","dcb_neg","of_neg","rgf","rreo"]
```

Indicator semantics (Portaria 1.583/2023): ind1 = endividamento (DC/RCL), ind2 = poupança corrente (3yr weighted 50/30/20), ind3 = liquidez relativa. Partial grades A/B/C each; final adds ICF (Aicf → A+/B+ eligibility, Dicf/Eicf → ineligible for Union guarantees).

## CityCatalyst Global API

| Environment | Base URL |
|---|---|
| Production | `https://api.citycatalyst.io` |
| Staging | `https://ccglobal.openearth.dev` |

⚠️ `citycatalyst.openearth.dev` is the web app, not the API.

### Emissions (✅ tested, works)

```bash
# catalogue of 99 data sources
curl -sL "https://api.citycatalyst.io/api/v0/catalogue"

# SEEG for Porto Alegre (BR POA), 2022, sector I.1.1 — returns full gas breakdown
curl -sL "https://api.citycatalyst.io/api/v1/source/SEEGv2023/city/BR%20POA/2022/I.1.1"
```

Cities are keyed by **UN/LOCODE** (`BR POA`), CAPAG by **IBGE code** (`4314902`) → a crosswalk is required. This is the central join problem; see `coverage-report.md` for how much of the universe survives the join.

### Climate risk (CCRA) — ⚠️ documented endpoint 404s

```
GET https://ccglobal.openearth.dev/api/v0/ccra/risk_assessment/city/{locode}   # → 404 as of 2026-06-11
```

Needs verification against the global-api source: https://github.com/Open-Earth-Foundation/CityCatalyst/tree/develop/global-api. Note CCRA is integrating APTA (AdaptaBrasil) projections for Brazil as of Apr 2026 — strong thematic fit if reachable.

### Climate actions

```
GET https://ccglobal.openearth.dev/api/v0/climate_actions?language=pt
```

HIAP (prioritized actions) per city — check global-api source for the per-city endpoint.

## Adjacent datasets (not yet pulled)

- **Siconfi API** — `apidatalake.tesouro.gov.br` — raw RGF/DCA/RREO, could enable live recomputation
- **capag-estados** — same CKAN portal, state-level ratings (reportedly updated Mar 2026)
- **Garantias da União** — STN dataset of actual guarantee operations (models the real lending channel)
- **TCE-ES open API** — per-municipality recomputed CAPAG with raw values, ES only

## Licensing

CAPAG dataset is **ODbL** — reuse/redistribution/derivatives fine with attribution + share-alike on the database. CityCatalyst API is OEF's own.
