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
cd events/2026-06-11-unlock-the-money/civic-climate-action/app
npm install
npm run build && npm start      # stable; dev (--turbopack) can 500 on stale state
# Open http://localhost:3000
```

The **AI localizer** (the "Make this concrete for my city" button) calls an optional
green-LLM sidecar; if it isn't running, the app's route handler falls back to a built-in
localizer, so the demo works either way. To run the real sidecar (mock mode, no key):

```bash
cd ../llm-service
python -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic python-dotenv
uvicorn main:app --port 8000     # see llm-service/README.md for live/green providers
```

To refresh the baked HIAP action library: `npm run data:actions`.

## Demo Script (5 min)

1. **The gap** — CityCatalyst is powerful but government-only. Citizens are locked out of
   their own city's climate plan.
2. **How it works** — the diagram: city planning data → plain language → *Understand, Connect,
   Act*. No dashboards to decode.
3. **Explore** — search a city, or click the map. Pick Medellín / Bogotá / a Brazilian city
   and read, in everyday language, what residents there did and what you could do.
4. **Prioritized actions** — pick a Brazilian hero city (São Paulo): real CityCatalyst **HIAP**
   actions, ranked for *this* city's hazards and emitting sectors, each with a "why this matters
   here" trace. Switch EN/ES/PT. Hit **"Make this concrete for my city"** → a cheap, green
   open-weight LLM rewrites the action into localized next steps, and the **CO₂ counter** (bottom
   right) shows the call's EcoLogits footprint.
5. **The "aha"** — the Inspiration gallery: real, sourced stories of citizens who cooled their
   streets, bought their power grid, rewrote climate law. Filter by action type; every claim
   links to its source.
6. **Who pays** — civic engagement is a co-benefit funders already score; this makes it
   visible and measurable. B2G, IDB, philanthropy.

## Built With

- Cursor + Claude
- Next.js 15 / React 19 / TypeScript
- [Leaflet](https://leafletjs.com/) + react-leaflet, with free OpenStreetMap / CARTO basemap tiles
- Cities keyed by **UN/LOCODE** — the same key the
  [CityCatalyst Global API](https://github.com/Open-Earth-Foundation/CityCatalyst/tree/develop/global-api)
  uses — so they connect to live GHGI / CCRA / HIAP data (`api.citycatalyst.io`)
- **HIAP action library** baked from `GET /api/v0/climate_actions` (155 actions, EN/ES/PT),
  prioritized per city in `src/app/lib/prioritize.ts`
- **Green LLM localizer**: a Python/FastAPI sidecar (`../llm-service`) calling an open-weight
  model via an OpenAI-compatible API on a low-carbon EU provider, instrumented with
  [EcoLogits](https://ecologits.ai/) for per-call carbon; model/provider is an env-only swap

## Data & Sources

- **City emissions + climate risk** (`src/app/data/cities.ts`): each city shows a GHG inventory
  and a risk profile, with a **"CityCatalyst live"** or **"External source"** badge.
  - **Brazilian cities** (São Paulo, Rio, Curitiba, Porto Alegre) pull **live** from the
    CityCatalyst Global API: emissions assembled from the SEEG inventory (+ SINIR/SNIS waste) by
    summing GPC sectors, and top hazards from the CCRA risk model. These are partial territorial
    inventories (grid electricity / some waste not yet captured), so the figures are conservative
    and a note flags this in the UI.
  - **Other cities** use the latest verified inventory + risk profile from official sources
    (C40/CDP, GLA-LEGGI, Ville de Paris, City of Copenhagen, NPCC, ICLEI, etc.), each linked.
    Boundaries differ (e.g. Paris in-territory vs. footprint; Rotterdam = port-industrial cluster;
    Seoul = 2005 baseline) — noted on the card.
- **Success stories** (`src/app/data/stories.ts`) are real and independently sourced
  (C40, WRI, World Bank, SEforALL, city governments, etc.). Headline numbers were cross-checked;
  uncertain figures are described qualitatively. Each card links its source.
- **Story images** are from Wikimedia Commons under reuse-permitting licenses (CC0 / CC BY /
  CC BY-SA); photographer credit + license are shown on each image and link to the file page.
- **Climate actions** (`src/app/data/climateActions.generated.ts`) are CityCatalyst's HIAP
  library, fetched once and committed (EN/ES/PT). We compute per-city prioritization ourselves
  because the per-city ranking endpoints aren't populated in prod yet.
- **Engagement opportunities** (`src/app/data/engagement.ts`) are curated, LATAM-first, and
  flagged `needs_local_validation` until a local partner confirms them.
- **Cities** are the 15 places featured in the success stories, each tagged with its UN/LOCODE.

## If This Survives the Hackday

- [ ] Wire cities by LOCODE to live CityCatalyst Global API data (GHGI / CCRA / HIAP)
- [ ] Expand from the seed set to the full CityCatalyst city catalogue + geolocation
- [ ] Real engagement directory per city: community groups, public-comment calendars, council agendas
- [ ] Extend Climate Advisor (AI) to answer "how do I influence my city's climate plan?"
- [ ] Participation metrics dashboard for cities/funders (the revenue surface)
