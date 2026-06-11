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

It walks a resident through three steps:

1. **Discover** — what is my city doing on climate? (a plain-language snapshot of emissions
   by sector and the climate risks near them)
2. **Learn** — what does it actually mean, in everyday language?
3. **Engage** — concrete next steps tied to each priority: community groups, public-comment
   periods, city-council meetings, volunteer drives, and policy/lawmaking opportunities.

Each action pathway is generated from a real CityCatalyst signal (HIAP / GHGI / CCRA) and
translated into something a person can actually do this week.

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
2. **Discover & Learn** — open the app on a sample city (Rio Branco). Emissions by sector and
   local climate risks, all in plain language.
3. **The "aha"** — scroll to *Ways to take action*. Every card is generated from a real
   CityCatalyst signal and turned into concrete civic steps (join a group, file a comment,
   show up to a council session).
4. **Who pays** — civic engagement is a co-benefit funders already score; this makes it
   measurable. B2G, IDB, philanthropy.
5. **What's next** — wire to the live Global API, add city search, and let residents track
   the actions they've taken.

## Built With

- Cursor + Claude
- Next.js 15 / React 19 / TypeScript
- Data shapes modeled on the [CityCatalyst Global API](https://github.com/Open-Earth-Foundation/CityCatalyst/tree/develop/global-api)
  (GHGI, CCRA, HIAP). Currently sample data — see `src/app/data.ts`.

## What We Learned

_(fill in during the build)_

## If This Survives the Hackday

- [ ] Replace sample data with live CityCatalyst Global API calls (GHGI / CCRA / HIAP)
- [ ] City search + geolocation so a resident lands on their own city
- [ ] Real engagement directory: community groups, public-comment calendars, council agendas
- [ ] Extend Climate Advisor (AI) to answer "how do I influence my city's climate plan?"
- [ ] Participation metrics dashboard for cities/funders (the revenue surface)
