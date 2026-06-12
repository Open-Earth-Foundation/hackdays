# SINIM Municipal Human-Resources Indicators (2023)

**File:** `sinim_hr_indicators_2023.csv`

## What it is
Per-municipality staffing indicators for 2023, exported from SINIM Area 02
(Municipal Human Resources). These cover the **technical-capacity** axis of the
city-capacity classification (proxy for in-house technical teams).

| Column | SINIM code | Indicator | Unit |
| --- | --- | --- | --- |
| `codigo_comuna` | — | Official comuna code | — |
| `municipio` | — | Municipality name (SINIM spelling) | — |
| `staff_planta_2023` | IRH05 | Número Funcionarios de Planta | count |
| `staff_contrata_2023` | IRH12 | Número de Funcionarios a Contrata | count |
| `professionalization_pct_2023` | IADM25 | Nivel de Profesionalización del Personal Municipal | % |

Derived in the merged table (`city_capacity_v1.csv`):
`total_staff_2023` = IRH05 + IRH12 (= IRH17); `staff_per_1000_2023` = total ÷ population × 1000.

## Source
- **Portal:** SINIM — Datos Municipales, Area 02 "Municipal Human Resources".
  https://datos.sinim.gov.cl/datos_municipales.php
- **Operator:** SUBDERE, Ministerio del Interior. Export "Sin Corrección Monetaria", year 2023.
- **Retrieved:** 2026-06-11.

## Coverage / notes
- 345 municipalities exported; ~17 have no 2023 staffing data reported (blank):
  Algarrobo, Alhué, Camarones, Camiña, Cobquecura, Illapel, La Cisterna, La Unión,
  Lago Verde, Lampa, Pica, Punitaqui, Puyehue, Rengo, Salamanca, San Ignacio, Taltal.
- Plain extraction; "No Recepcionado" → blank; no other transformation.
- Licensing: free, non-commercial, cite "SINIM, SUBDERE, Ministerio del Interior".
- Join key: `codigo_comuna` (preferred) or `municipio` (watch TREHUACO vs. "Treguaco").
