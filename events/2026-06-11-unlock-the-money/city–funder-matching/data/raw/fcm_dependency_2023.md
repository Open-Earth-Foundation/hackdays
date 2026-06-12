# FCM Dependency by Municipality (2023)

**File:** `fcm_dependency_2023.csv`

## What it is
Dependency of each Chilean municipality on the Municipal Common Fund (Fondo Común
Municipal, FCM) as a share of own income, for fiscal year 2023. This is a proxy for
**fiscal autonomy**: higher % = more dependent on redistributed transfers = less margin
to co-finance investment or sustain recurring operating costs.

- `municipio` — municipality name (SINIM/SUBDERE official spelling, uppercase, with accents)
- `fcm_dependency_pct_2023` — indicator **IADM75**: FCM dependency over own income (%), 2023

## Source
- **Primary source:** Sistema Nacional de Información Municipal (SINIM), SUBDERE —
  indicator IADM75, año 2023. https://datos.sinim.gov.cl/datos_municipales.php
- **Extracted from:** Ministerio del Medio Ambiente (MMA), *Bases 2025 — Anexo B:
  Dependencia del Fondo Común Municipal* (table "Dependencia del Fondo Común Municipal
  sobre los Ingresos Propios, año 2023", cites SINIM as its source).
  https://fondos.mma.gob.cl/wp-content/uploads/2024/10/Anexo-B-Dependencia-del-Fondo-Comun-Municipal.pdf
- **Retrieved:** 2026-06-11

## Coverage / notes
- 345 municipalities (full national coverage).
- Two values are not from 2023, per footnotes in the source PDF:
  - PUYEHUE — 2019 value used (2023 not received).
  - QUEILÉN — 2022 value used (2023 not received).
- Plain extraction only: decimal separator converted from comma to period; no other
  transformation, no name normalization, no joins.
