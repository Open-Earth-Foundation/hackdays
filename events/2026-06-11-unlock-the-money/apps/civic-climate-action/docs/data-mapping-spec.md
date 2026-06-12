# Civic Climate Action Data Mapping Spec

## Goal

Translate CityCatalyst's technical climate data for Porto Alegre into frontend-ready civic engagement recommendations.

## Source Inputs

| Source | Endpoint or File | Use |
| --- | --- | --- |
| City context | `/api/v0/city_context/city/BR%20POA` | City profile and plain-language context |
| CCRA current risks | `/api/v0/ccra/risk_assessment/city/BR%20POA/current` | Rank adaptation risks by hazard, impact, and normalized risk score |
| AdaptaBrasil risk | `/api/v1/cities/BR%20POA/climate-risk/adapta?level=summary` | Additional risk vocabulary and component detail |
| GHGI examples | `SEEG` and `EPE` endpoints in snapshot | Connect emissions sectors to mitigation pathways |
| Action pathways | `/api/v1/action-pathways?limit=120&lang=en` | Action labels, co-benefits, timelines, and GPC references |
| Climate actions | `/api/v0/climate_actions?language=en` | Mitigation/adaptation action catalogue and KPIs |
| External engagement records | `data/external-engagement-opportunities.json` | Local civic groups, meetings, campaigns, and consultation links |

## Output Contract

The frontend should consume `data/civic-action-mapping.json`.

Top-level keys:

- `meta`: city, language, source snapshot, and project context.
- `recommendationLogic`: human-readable rules used to produce recommendations.
- `citySummary`: compact city context for hero/header UI.
- `recommendations`: ordered civic action cards.
- `knownGaps`: limitations to show internally or in the README, not necessarily in the UI.

Each recommendation includes:

- `id`
- `title`
- `category`
- `priority`
- `sourceSignals`
- `plainLanguageExplanation`
- `whyItMattersLocally`
- `citizenActions`
- `engagementOpportunities`
- `frontendTags`

## Ranking Rules

1. CCRA risks with `normalised_risk_score >= 0.75` become high-priority adaptation recommendations.
2. GHGI examples become mitigation recommendations when they map clearly to a citizen-facing action pathway.
3. Climate actions with stakeholder engagement co-benefits are preferred for civic module demos.
4. Every recommendation needs at least one collective action path, not only individual behavior change.
5. External local records remain `needs_local_validation` until checked against municipal or community sources.

## Current Porto Alegre Demo Recommendations

1. Flood resilience investments
2. Landslide prevention
3. Heat and green infrastructure
4. Residential energy efficiency
5. Active mobility

## Known Gaps

- HIAP city-specific prioritization is not wired into this starter yet.
- Policy support scores returned Chile-oriented metadata by default and should not be used for Porto Alegre without a Brazil-specific release.
- Local engagement opportunities are placeholders until municipal/community sources are validated.
- Neighborhood personalization requires additional geospatial or address-level logic.
