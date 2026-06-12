# SINIM Municipal Capacity Indicators — index / remaining gaps

## Fiscal-autonomy axis — DONE
Extracted to `sinim_fiscal_indicators_2023.csv` (see its `.md`). Covers IADM01
(total income), IADM74 (IPP per cápita), IADM75 (FCM dependency), IADM02 (% IPP in
total income), all 345 comunas, year 2023. This file documents only what remains.

## TECHNICAL-CAPACITY axis — DONE
Extracted to `sinim_hr_indicators_2023.csv` (SINIM Area 02, Human Resources):
IADM25 (professionalization %), IRH05 (planta), IRH12 (contrata), year 2023.
~17 comunas have no 2023 staffing data reported (listed in that file's `.md`).

---
### Historical note: why this was not in the first dictionary
The first dictionary shared (`dicc_datos_municipales.xls`) was the Area 01
Administration & Finance set (no HR indicators). The HR indicators come from a
separate Area 02 catalog. Reference notes below.
There is **no professionalization % or staff-headcount (dotación) indicator** in the
`datos.sinim.gov.cl` financial dictionary. Those live in SINIM's separate personnel /
recursos-humanos ("gestión de personas") catalog on sinim.gov.cl — a different module.
Options for v1:
- Skip the technical-capacity axis, or
- Use rough proxies that ARE in this dictionary:
  - `IADM17` — Participación Gasto en Personal en Gastos Corrientes (%)
  - `IADM32` — Participación de Gastos en Capacitación sobre el Gasto Total en Personal (%)
- To get real professionalization/headcount, look in the SINIM personnel indicators
  (sinim.gov.cl) or the Ficha Comunal, not in datos.sinim.gov.cl.

## Where to get it
- **Portal:** SINIM — Municipal Data / Budgetary Evolution.
  https://datos.sinim.gov.cl/datos_municipales.php
  1. Section "Municipal Data" (Datos Municipales) — select all 345 municipalities.
  2. Select indicators IADM74, IADM01, IADM02 for year 2023 (to match FCM file).
  3. Export to Excel; save raw export here as `sinim_fiscal_indicators_2023.xlsx`
     (and/or flattened `.csv`).
- **Data dictionary:** https://datos.sinim.gov.cl/dicc_datos_municipales.php
  (local copy: `dicc_datos_municipales.xls`)
- **Operator:** Subsecretaría de Desarrollo Regional y Administrativo (SUBDERE),
  Ministerio del Interior.

## Notes
- Licensing (per portal banner): free to use, non-commercial, must cite
  "SINIM, SUBDERE, Ministerio del Interior" as source.
- Join key to other raw files: `municipio` name in SINIM official spelling
  (uppercase, with accents). Watch TREHUACO vs. "Treguaco" when merging with the
  CityCatalyst city list.
- Retrieved/checked: 2026-06-11.
