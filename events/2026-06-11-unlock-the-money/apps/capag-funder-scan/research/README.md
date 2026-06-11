# CAPAG Research — shared findings

Deep research run on 2026-06-11 (22 sources fetched, 110 claims extracted, 22 verified via adversarial 3-vote verification). Anyone at this hackday working with Brazilian municipal fiscal data — use this, don't re-research it.

**Files here:**
- `capag-overview.md` — what CAPAG is, methodology, the 2023 break, gotchas
- `data-access.md` — exact URLs, formats, schemas, code snippets for CAPAG + CityCatalyst APIs
- `coverage-report.md` — (generated) CAPAG × CityCatalyst match coverage

## TL;DR

- **CAPAG** = National Treasury (STN) credit rating for municipalities. Decides access to federally guaranteed loans. Scale since 2024: A+, A, B+, B, C, D.
- **Data is free and open** (ODbL): XLSX files on Tesouro Transparente CKAN, ~3 drops/year, latest Nov 2025. One file = all 5,569 municipalities with IBGE codes, final rating, 3 sub-indicator scores, ICF accounting-quality grade, plus raw DCA/RGF/RREO fiscal sheets.
- **Distribution (Nov 2025):** C: 2,316 · A: 1,041 · B: 859 · n.d.: 841 · A+: 232 · n.e.: 164 · B+: 104 · D: 10
  - The story: **2,316 CAPAG-C cities are locked out of federal credit** → blended-finance market. **841 "n.d." cities** aren't even rated (broken accounting data) → technical-assistance market.
- **No prior art** overlaying CAPAG with climate finance was found anywhere. Open ground.
- Closest existing tool: TCE-ES "Painel CAPAG" — monthly recomputed ratings for Espírito Santo's 78 municipalities, with an open JSON API. State-only, framed as projection.

## Key gotchas (verified)

1. **Methodology break 2023/2024** (Portaria Normativa MF 1.583/2023, amended 1.764/2024): new liquidity formula, new A+/…/D scale, ICF integration. **Pre-2024 and post-2024 ratings are not comparable** — don't build naive time series across the break.
2. **All published ratings are non-binding.** The definitive CAPAG is computed by STN only when a municipality applies for a guaranteed credit operation. Frame any tool as a *screening signal*, never a credit decision. (STN and TCE-ES both carry this disclaimer.)
3. **"n.d." ratings since 2023**: STN stopped rating municipalities with unhomologated DCA, negative vinculados in RGF, or negative revenue deductions. Full row coverage ≠ full rating coverage.
4. **"Quadrimestral" cadence is declared, not guaranteed** — drops have lagged historically. Snapshot-archive the files you depend on.
5. **Methodology still evolving** — Portaria STN/MF 857/2026 appeared during research verification.

## Open questions we didn't resolve

- CCFLA / BNDES demand signal is hypothesis, not verified fact — no surviving claims on BNDES programs referencing CAPAG for climate lending.
- Siconfi public API (`apidatalake.tesouro.gov.br`) could in theory enable live national recomputation (TCE-ES-style) instead of waiting for XLSX drops — unverified.
- `capag-estados` (separate dataset, states) alignment with municipal data.

## Primary sources

- Official CAPAG page: https://www.tesourotransparente.gov.br/temas/estados-e-municipios/capacidade-de-pagamento-capag
- Dataset (CKAN): https://www.tesourotransparente.gov.br/ckan/dataset/capag-municipios (ODbL)
- Methodology: Portaria Normativa MF 1.583/2023 — https://www.legisweb.com.br/legislacao/?id=453124
- TCE-ES Painel CAPAG (prior art + open API): https://paineldecontrole.tcees.tc.br/ — e.g. `GET /api/CAPAGControllers/CAPAG/GetClassificacaoCapag?anoExercicio=2025&idEsferaAdministrativa=1`
- Metadata PDF: in the CKAN dataset resources ("Metadados")
