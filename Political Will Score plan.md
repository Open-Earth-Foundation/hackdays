# Political Will Score Plan

## Starting Finding: Global API Data Gap

As of 2026-06-11, CityCatalyst Global API has almost no important data for the actual Political Will Score.

For Krakow, Warsaw, and Gdansk, the Global API is useful only as a city baseline layer. It can provide city IDs, boundaries, map geometry, area, and one 2020 population estimate. It does not provide the political, budget, staffing, election, local news, or municipal climate-commitment evidence that would drive a credible political will score.

Confirmed Global API IDs:

| City | Global API ID | Confirmed useful fields |
| --- | --- | --- |
| Warsaw | `PL WAW` | Boundary, bounding box, area, 2020 population |
| Krakow | `PL KRK` | Boundary, bounding box, area, 2020 population |
| Gdansk | `PL GDN` | Boundary, bounding box, area, 2020 population |

Confirmed 2020 population data from Global Human Settlement Layer:

| City | 2020 population | Boundary area |
| --- | ---: | ---: |
| Warsaw | 1,885,634 | 517.19 km2 |
| Krakow | 791,246 | 326.85 km2 |
| Gdansk | 480,945 | 396.09 km2 |

Global API endpoints tested that were missing or not useful for this use case:

| Data type | Result |
| --- | --- |
| City attributes | No data |
| Climate risk / CCRA | No data |
| Adapta climate risk | No data |
| Emissions forecast | No data |
| Poland-specific mitigation feasibility | No data |
| Poland project summaries | No data |
| Action policy scores | Returns records, but only national-level evidence, not city-specific political will |

Conclusion: Global API should not be the primary data source for this project. Use it only for city lookup, map context, boundary geometry, area, and population.

## Product Goal

Build a funder-facing score that answers:

> If a city has made a climate commitment, how likely is that commitment to survive the next political cycle?

The score should behave like a lightweight credit signal for political durability. It should not claim certainty. It should show a score, confidence level, and evidence trail.

## MVP Scope

Start with three Polish cities:

- Warsaw
- Krakow
- Gdansk

The MVP should show:

1. A ranked city table.
2. A Political Will Score from 0 to 100.
3. A confidence label: low, medium, high.
4. Signal breakdown by category.
5. Evidence links or notes for every score input.
6. A clear "data gaps" panel so funders know what is missing.

## Score Model

Suggested first scoring weights:

| Signal | Weight | What it measures |
| --- | ---: | --- |
| Budget follow-through | 30% | Whether climate-related spending appears in budgets and keeps growing or staying stable |
| Election cycle risk | 20% | How close the next election is and whether current leadership is likely to continue |
| Institutional continuity | 20% | Whether there is a dedicated climate office, named staff, or stable responsible department |
| Climate plan maturity | 15% | Whether the city has a published climate/adaptation plan with concrete actions and dates |
| Public commitment signals | 15% | Recent mayor/council statements, local news, public announcements, and visible delivery |

Initial score formula:

```text
political_will_score =
  budget_score * 0.30 +
  election_score * 0.20 +
  institution_score * 0.20 +
  plan_score * 0.15 +
  public_signal_score * 0.15
```

Confidence should be calculated separately from score quality:

```text
confidence =
  number_of_signals_with_real_sources /
  total_expected_signals
```

This keeps a city from looking strong just because we lack negative data.

## Data We Actually Need

Primary data sources should be public Polish or city-level sources, not CityCatalyst:

| Need | Possible source |
| --- | --- |
| Election dates and results | PKW election data and official election calendar |
| Mayor / council continuity | City websites, BIP pages, election results |
| Budget trends | City budget PDFs, BIP budget resolutions, open data portals |
| Climate plan publication | City climate/adaptation plan pages and PDFs |
| Climate implementation evidence | Budget line items, procurement notices, project pages |
| Staff / department continuity | BIP organizational structure, department pages |
| Public narrative | City news pages, press releases, local media snippets |

CityCatalyst Global API can supplement:

| Use | Endpoint type |
| --- | --- |
| City ID | `PL WAW`, `PL KRK`, `PL GDN` |
| Boundary / map | `/api/v0/cityboundary/city/{locode}` |
| Area | `/api/v0/cityboundary/city/{locode}/area` |
| Population | `/api/v1/population/{actor_id}` |

## Data Strategy for Hackday

Use a pragmatic staged approach:

1. Create a small curated dataset for Warsaw, Krakow, and Gdansk.
2. Record each signal with a value, source URL, date checked, and confidence.
3. Use mocked values only where we clearly label them as placeholders.
4. Build the score engine so real data can replace placeholders without changing the UI.

Suggested local data shape:

```json
{
  "city": "Warsaw",
  "locode": "PL WAW",
  "signals": {
    "budgetFollowThrough": {
      "score": 72,
      "confidence": "medium",
      "evidence": []
    },
    "electionCycleRisk": {
      "score": 64,
      "confidence": "medium",
      "evidence": []
    }
  }
}
```

## App Plan

Recommended stack: the repo's existing Next.js template.

Build screens:

1. Dashboard: city ranking, score, confidence, key risk label.
2. City detail: score breakdown, trend indicators, evidence list.
3. Methodology panel: weights, score formula, and data caveats.
4. Data gaps panel: missing data by city and signal category.

The demo should make the core point clear:

> Global API can tell us what city we are looking at. Political Will Score needs local political and institutional evidence to decide whether climate commitments are likely to survive.

## What Not To Build First

Do not start with CityCatalyst OAuth or the CC POC template. It is too heavy for this project unless we later need authenticated CityCatalyst data.

Do not make emissions, climate risk, or mitigation feasibility the core score. Those describe climate context, not political will.

Do not hide uncertainty. Data gaps are part of the product and should be visible.

## Next Steps

1. Copy the Next.js template into `events/2026-06-11-unlock-the-money/apps/political-will-score`.
2. Create a small local data file for the three Polish cities.
3. Implement the score calculation from weighted signals.
4. Build the dashboard and city detail views.
5. Add source links and confidence labels.
6. Replace placeholder values with real Polish public-source evidence as time allows.

