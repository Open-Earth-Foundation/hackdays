# Civic Climate Action Engagement Module

> A citizen-facing companion to CityCatalyst. Turns top-down emissions, risk, and
> action data into bottom-up civic engagement pathways.

## Team

| Name | Role |
|------|------|
| Carlos Graffi | Lead / Proposer |
| TBD | Dev |
| TBD | Design / Research |

## What We Built

CityCatalyst tells **city governments** what to do about climate — emissions inventories
(GHGI), climate risk assessments (CCRA), and a prioritized list of high-impact actions
(HIAP). But residents have no way in. This module is the **bottom-up layer**: a
citizen-facing app that answers *"What's happening in my city, and how can I take better
action?"*

The interface is deliberately minimalist and plain-language:

1. **How it works** — a simple diagram showing how the same data cities use to plan (GHGI
   emissions inventory, CCRA climate risk, HIAP priority actions) is translated into
   *Understand → Connect → Act*.
2. **Explore** — search across cities or pick one on an interactive map to see how residents
   there are shaping local climate action, and what you could do in your own.
3. **Inspiration** — a gallery of **real, independently sourced** success stories where
   citizens changed their cities, filterable by action type. Every card links to its source.

## Revenue Connection

Civic participation is a **co-benefit that funders already score** (HIAP rates stakeholder
engagement on a −2 to +2 scale). This module *operationalizes* that co-benefit and produces
visible, measurable participation metrics — the kind MDBs, the IDB, and philanthropy ask for.

- **B2G / MDB:** civic transparency and public participation are requirements for funding
  approval; this is the tool that demonstrates them.
- **IDB Cities Network (300+ LatAm cities):** differentiates CityCatalyst — most city climate
  tools serve governments only, not citizens.
- **Revenue models:** freemium CityCatalyst add-on with paid white-labeled civic dashboards;
  grant-funded pilots in 3–5 cities; MDB co-financed "community engagement component."

## How to Run

```bash
cd events/2026-06-11-unlock-the-money/apps/civic-climate-action
npm install
npm run dev
# Open http://localhost:3000
```

## Demo Script (5 min)

1. **The gap** — CityCatalyst is powerful but government-only. Citizens are locked out of
   their own city's climate plan.
2. **How it works** — the diagram: city planning data → plain language → *Understand, Connect,
   Act*. No dashboards to decode.
3. **Explore** — search a city, or click the map. Pick Medellín / Bogotá / a Brazilian city
   and read, in everyday language, what residents there did and what you could do.
4. **The "aha"** — the Inspiration gallery: real, sourced stories of citizens who cooled their
   streets, bought their power grid, rewrote climate law. Filter by action type; every claim
   links to its source.
5. **Who pays** — civic engagement is a co-benefit funders already score; this makes it
   visible and measurable. B2G, IDB, philanthropy.

## Built With

- Cursor + Claude
- Next.js 15 / React 19 / TypeScript
- [Leaflet](https://leafletjs.com/) + react-leaflet, with free OpenStreetMap / CARTO basemap tiles
- Cities keyed by **UN/LOCODE** — the same key the
  [CityCatalyst Global API](https://github.com/Open-Earth-Foundation/CityCatalyst/tree/develop/global-api)
  uses — so they can connect to live GHGI / CCRA / HIAP data (`api.citycatalyst.io`)

## Data & Sources

- **Success stories** (`src/app/data/stories.ts`) are real and independently sourced
  (C40, WRI, World Bank, UN/SEforALL, city governments, etc.). Headline numbers were
  cross-checked; uncertain figures are described qualitatively. Each card carries its source link.
- **Cities** (`src/app/data/cities.ts`) are a curated seed set, each tagged with its UN/LOCODE
  for live API wiring. This is intentionally a seed, not the full CityCatalyst catalogue (yet).

## If This Survives the Hackday

- [ ] Wire cities by LOCODE to live CityCatalyst Global API data (GHGI / CCRA / HIAP)
- [ ] Expand from the seed set to the full CityCatalyst city catalogue + geolocation
- [ ] Real engagement directory per city: community groups, public-comment calendars, council agendas
- [ ] Extend Climate Advisor (AI) to answer "how do I influence my city's climate plan?"
- [ ] Participation metrics dashboard for cities/funders (the revenue surface)
