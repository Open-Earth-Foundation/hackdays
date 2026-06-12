# Civic Climate Action Engagement Module — 24h Hackday Roadmap

**Team:** Carlos Graffi (lead / proposer · domain + demo) · TBD · TBD
**Window:** Kickoff Thu 11 Jun 15:00 GMT → Demos Fri 12 Jun 15:00 GMT (5 min)
**Repo path:** `events/2026-06-11-unlock-the-money/civic-climate-action/`

---

## The one-liner

A citizen-facing companion to CityCatalyst: turn a city's emissions, risks and priority actions
into plain language, show what residents elsewhere have actually achieved, and hand each person a
concrete next step — with OEF/CityCatalyst as the trust layer that makes civic engagement a
**measurable** co-benefit funders already score.

## What we ship (demoable)

A working web app over 15 cities with four connected sections — **How it works** (data→action
diagram), **Explore** (search + interactive map; live emissions + risk per city), **Inspiration**
(15 real, sourced success stories with images, filterable), and **Take Action** (concrete civic
next steps, filterable by cause). Real CityCatalyst data flows for Brazilian cities; verified
external data for the rest. Ugly-but-real beats a slide — and this one isn't ugly.

> A working app already exists in `app/`. The plan below is about widening real-data coverage and
> deepening the "Act" step into a confident 5-minute demo, not starting from zero.

---

## Roles (play to strengths)

**Carlos — Lead, domain, demo.** Owns the citizen narrative and the revenue framing (B2G / IDB /
philanthropy). Curates the 3–4 "hero" cities for the demo, writes and drives the 5-minute story,
keeps the build honest to the OEF/CityCatalyst angle. Final cut decisions.

**TBD — Data / API.** Owns the CityCatalyst Global API pipeline: widen emissions coverage (sum
more GPC sectors / scope-2), wire more cities by LOCODE, harden the live CCRA pull. Stretch: a
typeahead over the real city catalogue.

**TBD — Engagement / research.** Owns the "Act" depth: source real local engagement entry points
(community groups, public-comment calendars, council agendas) for the hero cities, and keep the
success stories and their sources airtight.

---

## Scope — MoSCoW (protect the 24h)

**Must (the demo cannot exist without these)** — *all shipped*
- Minimalist, plain-language UI with the data→action diagram. ✔
- Explore: city search + interactive map, 15 cities. ✔
- Per-city emissions inventory + climate-risk snapshot with provenance badges. ✔
- Inspiration: 15 real, sourced success stories with images, filterable. ✔
- Take Action: concrete civic next steps, filterable by cause. ✔
- A clean 5-min narrative tied to revenue. ✔

**Should**
- Wider CityCatalyst emissions coverage (sum more sectors → less "transport-dominated" skew).
- One or two more hero cities wired live by LOCODE.
- "My city" entry: geolocation or typeahead so a resident lands on their own city.

**Could**
- Real local engagement directory per hero city (the true "Act" payoff).
- Citizen "I did this" pledge → participation metric (the measurable co-benefit funders want).
- Climate Advisor (AI) Q&A: "how do I influence my city's climate plan?"

**Won't (this hackday)**
- Auth, accounts, write-back to CityCatalyst, full global catalogue, production data licensing.

---

## Hour-by-hour (T+0 = 15:00 GMT Thu)

**T+0 → T+2 · Align & divide.** Lock the four sections and the hero cities (Carlos). Confirm the
data model in `app/src/app/data/*` so all three can work in parallel without merge collisions.

**T+2 → T+10 · Parallel build I.**
- Scaffold + minimalist redesign + diagram. ✔
- City explorer (search + Leaflet map) over the seed cities. ✔
- Pull live CityCatalyst emissions + CCRA risk for the Brazilian hero cities; source verified
  external inventories + risk for the rest. ✔

**T+10 → T+18 · Parallel build II.**
- Inspiration gallery: research + fact-check 15 success stories; add freely-licensed images. ✔
- Take Action section: universal pathways + cause filter + CTA. ✔
- Provenance badges + honest coverage notes everywhere. ✔

**T+18 → T+22 · Polish & widen.** Tighten copy, widen emissions coverage / add a hero city live,
verify every source link. Capture screenshots.

**T+22 → T+24 · Demo prep.** Lock the 5-min spine (see `app/README.md`): the gap → how it works →
explore a hero city → inspiration → who pays. Rehearse.

---

## Demo spine (5 min)

1. **The gap** — CityCatalyst is powerful but government-only; citizens are locked out.
2. **How it works** — the diagram: city data → plain language → Understand/Connect/Act.
3. **Explore** — open a hero city (São Paulo): live emissions + climate risk, in plain words.
4. **Inspiration** — real citizens who changed their cities; every claim sourced.
5. **Who pays** — civic engagement is a co-benefit funders already score; this makes it
   measurable. B2G · IDB · philanthropy.
