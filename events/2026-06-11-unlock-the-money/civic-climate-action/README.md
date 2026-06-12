# Civic Climate Action Engagement Module

> Hackday 26Q2 · "Unlock the Money" · idea #8 — proposed by Carlos Graffi

CityCatalyst tells **city governments** what to do about climate. This is the other
direction: a plain-language, citizen-facing companion that turns top-down city climate data
into **bottom-up** civic action. *"I, as a citizen, want to know what's happening in my city
and how I could take better action."*

## What's in this folder

| File / folder | What it is |
|---|---|
| [`SPEC.md`](./SPEC.md) | Product specification — what it is, the OEF angle, data, open questions |
| [`ROADMAP.md`](./ROADMAP.md) | 24h hackday roadmap — team, scope (MoSCoW), hour-by-hour |
| [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) | Technical plan — stack, data model, CityCatalyst pipeline, what's done vs. next |
| [`app/`](./app) | The Next.js app (this is the demo) — see [`app/README.md`](./app/README.md) |
| `teammembers.md` | Team |

## Run it

```bash
cd app
npm install
npm run dev
# open http://localhost:3000
```

## The 30-second pitch

A minimalist, plain-language journey: **How it works** (a diagram from CityCatalyst data to
citizen action) → **Explore** (search + map of 15 cities, each with a live emissions inventory
and climate-risk profile) → **Inspiration** (15 real, sourced civic-climate success stories with
images) → **Take Action** (concrete next steps a resident can take this week).

**Real data, honestly sourced.** Brazilian cities pull *live* from the CityCatalyst Global API
(SEEG emissions inventory + CCRA risk); other cities use the latest verified official inventories
and risk profiles. Every figure carries a "CityCatalyst live" vs. "External source" badge and a
source link.

**Why it pays.** Civic participation is a co-benefit funders (MDBs, the IDB, philanthropy)
already score. This module operationalizes it into something visible and measurable that
de-risks city climate projects — funder tool / premium CityCatalyst feature.
