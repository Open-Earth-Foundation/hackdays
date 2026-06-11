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

## Updated Product Shape

The strongest version is an action-level module inside the CityCatalyst HIAP workflow, not a standalone city ranking.

The user starts with a city and its selected or agreed HIAP actions. For each action, the product answers:

> Is this action politically and institutionally likely to survive long enough to be implemented?

The flow should support:

1. Importing agreed actions from a file or adding them manually.
2. Adding evidence through online URLs, city procurement/contract pages, uploaded documents, structured data, articles, or manual notes.
3. Using an LLM to extract claims, suggest signal mapping, and flag missing context.
4. Requiring a human reviewer to approve evidence before it changes the score.
5. Keeping the evidence history visible for funders and city teams.

## MVP Scope

Start with three Polish cities:

- Warsaw
- Krakow
- Gdansk

The MVP should show:

1. A selected HIAP action list for one city.
2. A Political Will Score from 0 to 100 per selected action.
3. A confidence label: low, medium, high.
4. Signal breakdown by category.
5. Evidence links, uploaded source records, planned/current/started contract records, structured data rows, or analyst notes for every score input.
6. A clear "data gaps" panel so funders know what is missing.
7. A source intake flow for URL, city contract/procurement pages, file upload, structured data, and manual notes.
8. An AI suggestion review step where the user can approve, edit, reject, or mark claims as needs review.

## Frontend Screen Versions

The project folder contains two frontend concept versions:

1. V1: initial HIAP action confidence and Political Details screens.
2. V2: separate refined screens for source-backed action discovery and in-depth political evidence review.

V2 is the stronger direction for implementation because it shows the real-source workflow more clearly:

- `Find actions` before actions enter the selected HIAP list.
- Source-backed action status in the HIAP table.
- Four political will signals only.
- Contract/procurement evidence in the detailed view.
- AI suggestions separated from verified evidence.

Current image files:

| Version | HIAP view | Political details view |
| --- | --- | --- |
| V1 | `hiap-political-will-action-confidence.png` | `political-details-evidence-management.png` |
| V2 | `hiap-political-will-action-confidence_V2.png` | `political-details-evidence-management_V2.png` |

## Score Model

Suggested first scoring weights:

| Signal | Weight | What it measures |
| --- | ---: | --- |
| Budget follow-through | 35% | Whether spending appears in budgets, procurement, planned/current/started contracts, or delivery records and keeps growing or staying stable |
| Election cycle risk | 25% | How close the next election is and whether current leadership is likely to continue |
| Institutional continuity | 25% | Whether there is a dedicated office, named staff, or stable responsible department |
| Public commitment signals | 15% | Recent mayor/council statements, local news, public announcements, and visible delivery |

Do not score whether the city has a climate or adaptation plan. The workflow assumes the city starts from an agreed plan or selected HIAP action set, so plan existence is an input prerequisite rather than evidence of political will.

Initial score formula:

```text
political_will_score =
  budget_score * 0.35 +
  election_score * 0.25 +
  institution_score * 0.25 +
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
| Planned/current/started contracts | City procurement portals, BIP contract registers, tender pages, investment pages, and dedicated city contract pages |
| Climate implementation evidence | Budget line items, procurement notices, project pages |
| Staff / department continuity | BIP organizational structure, department pages |
| Public narrative | City news pages, press releases, local media snippets |

### Political Climate And News Monitoring

The product should explicitly search recent internet/news sources for political climate changes that affect action durability.

This should cover:

- newest articles and local media about the city, mayor, council, budget, procurement, protests, delays, cancellations, and climate delivery
- official city announcements and press releases
- BIP or council updates that signal changed support, funding, responsibility, or implementation timing
- election-related changes and public commitments by candidates or current leadership
- city/action-specific search terms controlled by the user

Suggested recency filters:

| Window | Use |
| --- | --- |
| Last 7 days | urgent change detection |
| Last 30 days | active political climate |
| Last 90 days | recent trend for funder review |
| Since last review | ongoing monitoring |

News and political climate findings should enter the same review flow:

1. Search returns source-backed articles or official updates.
2. LLM extracts suggested evidence and possible score impact.
3. User approves, edits, rejects, or marks as needs review.
4. Score changes only after evidence is approved.

### Contract Evidence

Planned, current, and started contracts should be part of the core evidence flow when cities publish them on dedicated procurement, investment, BIP, or contract-register pages.

For budget follow-through:

- Planned contracts show implementation intent, but should be treated as weaker evidence until matched to budget, tender, or award records.
- Current or started contracts are stronger evidence when their scope clearly maps to the selected HIAP action.
- Cancelled or stalled contracts should count as negative evidence.
- The reviewer should confirm the action mapping before a contract changes the score.

CityCatalyst Global API can supplement:

| Use | Endpoint type |
| --- | --- |
| City ID | `PL WAW`, `PL KRK`, `PL GDN` |
| Boundary / map | `/api/v0/cityboundary/city/{locode}` |
| Area | `/api/v0/cityboundary/city/{locode}/area` |
| Population | `/api/v1/population/{actor_id}` |

## Real Data Strategy for Hackday

Use a research-first approach:

1. Find real climate actions for Warsaw, Krakow, and Gdansk from official city sources, published action plans, public investment pages, procurement portals, BIP pages, contract registers, or user-uploaded documents.
2. Require every action to be tied to a real source before it enters the dataset.
3. Record each signal with a real source URL or uploaded source, contract status when relevant, date checked, reviewer status, and confidence.
4. Run LLM analysis only on real fetched, uploaded, pasted, or manually entered source material.
5. Let users update, correct, replace, or remove discovered actions and evidence when they have better source material.
6. Build the score engine so every visible score can be traced back to reviewed real evidence.

### Real Action Search Flow

The product should include a source-backed action discovery flow:

1. User selects a city.
2. User runs a search across official city, BIP, procurement, investment, and contract-register sources, or pastes/uploads their own source.
3. The app extracts candidate actions from the real source material.
4. Each candidate action shows source name, source URL or file, excerpt, date checked, and confidence.
5. User accepts, edits, rejects, or merges candidate actions.
6. Accepted actions become the selected HIAP action list.
7. Later user edits keep the original source and reviewer history visible.

Required real-data record shape:

```ts
type RealPoliticalWillActionRecord = {
  cityName: string;
  locode: string;
  actionTitle: string;
  actionSourceUrl: string;
  actionSourceName: string;
  dateChecked: string;
  reviewerStatus: "unreviewed" | "needs_review" | "reviewed";
  sources: PoliticalWillSource[];
  suggestedEvidence: PoliticalWillAnalysisSuggestion[];
  verifiedEvidence: PoliticalWillEvidence[];
};
```

## App Plan

Recommended stack: the repo's existing Next.js template.

Build screens:

1. HIAP selected actions view: action list, political will score, confidence, evidence count, and data gaps.
2. Action inspector: action details plus political details in the same right-side drawer pattern.
3. Political details workspace: source intake, AI extraction review, stored evidence, score breakdown, and audit log.
4. Methodology panel: weights, score formula, reviewer rules, and data caveats.

The demo should make the core point clear:

> Global API can tell us what city we are looking at. Political Will Score needs local political and institutional evidence to decide whether climate commitments are likely to survive.

## What Not To Build First

Do not start with CityCatalyst OAuth or the CC POC template. It is too heavy for this project unless we later need authenticated CityCatalyst data.

Do not make emissions, climate risk, or mitigation feasibility the core score. Those describe climate context, not political will.

Do not hide uncertainty. Data gaps are part of the product and should be visible.

## Next Steps

1. Reuse the existing HIAP action module as the base surface.
2. Research real selected actions for Warsaw, Krakow, and Gdansk from official city/action/procurement sources.
3. Implement the score calculation from weighted signals.
4. Build the action confidence table and political details workspace.
5. Add source intake for URLs, city contract/procurement pages, uploads, structured data, and notes.
6. Add LLM analysis that only runs over real source material and creates suggested evidence requiring review.
7. Add user controls to update discovered actions, replace source links, upload better documents, and re-run analysis.
