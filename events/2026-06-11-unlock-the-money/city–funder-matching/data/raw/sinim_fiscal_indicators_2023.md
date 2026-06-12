# SINIM Municipal Fiscal Indicators (2023)

**File:** `sinim_fiscal_indicators_2023.csv`

## What it is
Per-municipality fiscal indicators for fiscal year 2023, all 345 comunas, exported
from the SINIM "Municipal Data" query tool. These cover the **fiscal-autonomy /
capacity** axis of the city-capacity classification.

| Column | SINIM code | Indicator | Unit |
| --- | --- | --- | --- |
| `codigo_comuna` | — | Official comuna code (INE/SUBDERE) | — |
| `municipio` | — | Municipality name (SINIM spelling) | — |
| `total_income_2023_mclp` | IADM01 | Ingresos Municipales (Ingreso Total Percibido) | M$ (thousand CLP, nominal) |
| `ipp_percapita_2023_mclp` | IADM74 | Ingresos Propios Permanentes per Cápita (IPPP) | M$ (thousand CLP) |
| `fcm_dependency_pct_2023` | IADM75 | Dependencia del FCM sobre los Ingresos Propios | % |
| `ipp_share_total_pct_2023` | IADM02 | Participación de IPP en el Ingreso Total | % |

## Source
- **Portal:** Sistema Nacional de Información Municipal (SINIM) — Datos Municipales.
  https://datos.sinim.gov.cl/datos_municipales.php (Municipal Data section).
- **Operator:** Subsecretaría de Desarrollo Regional y Administrativo (SUBDERE),
  Ministerio del Interior.
- **Export:** "Sin Corrección Monetaria" (no monetary-update factor applied;
  nominal pesos of each year). Year selected: 2023.
- **Retrieved:** 2026-06-11.

## Coverage / notes
- 345 municipalities. Two have no 2023 data ("No Recepcionado", left blank):
  **QUEILÉN** and **PUYEHUE**.
- Plain extraction only: parsed from the SINIM SpreadsheetML export; "No Recepcionado"
  converted to blank; no other transformation.
- **Consistency check:** column IADM75 here is identical (max abs diff = 0.0) to the
  independently sourced `fcm_dependency_2023.csv` (from the MMA Anexo B PDF) — both
  trace to SINIM, year 2023.
- Licensing (per SINIM portal banner): free, non-commercial use, must cite
  "SINIM, SUBDERE, Ministerio del Interior".
- Join key: `codigo_comuna` (preferred) or `municipio` name. Note TREHUACO vs.
  "Treguaco" spelling difference vs. the CityCatalyst city list.
