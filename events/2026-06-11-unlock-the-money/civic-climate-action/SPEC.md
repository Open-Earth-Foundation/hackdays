# Civic Climate Action Engagement Module — Product Specification

**Status:** Hackday prototype (working app) · **Audience:** the Claude Code / Cursor session that will improve this app
**Inputs to load alongside this spec:** `app/src/app/page.tsx`, `app/src/app/data/*` (cities, stories, actions, types), and the [CityCatalyst Global API](https://github.com/Open-Earth-Foundation/CityCatalyst/tree/develop/global-api).
**Goal of the next iteration:** widen real-data coverage, deepen the "Act" step into something a resident can actually follow through on, and keep every number honest and sourced.

---

## 0. Open product questions — investigate before building more

- **Localization & "my city" entry point.** A citizen should land on *their* city, not a global list. Is the right next move geolocation + a typeahead over the full CityCatalyst city catalogue, or staying with a curated, high-quality seed set? What breaks (data coverage, map clutter) if we go to thousands of cities?
- **The "Act" gap.** The Take Action step is currently *generic* (universal pathways). The real value is **local** next steps — the actual community group, the actual open public-comment window, the actual council agenda. Where does that data come from, and can any of it be sourced reliably per-city rather than hand-curated?
- **Emissions honesty.** The Brazilian inventories pulled live are *partial* (no scope-2 grid electricity yet), which overstates transport's share. Should we (a) sum more datasources for fuller coverage, (b) show a clear "partial" framing (current approach), or (c) switch to a per-capita / sector-relative view that's less sensitive to coverage gaps?
- **Citizen feedback loop.** Should residents be able to *report back* (pledged an action, joined a group) so the module produces the participation metrics funders want — closing the loop from engagement to measurable co-benefit?

The owner is open to restructuring. Propose a recommendation with trade-offs before building.

---

## 1. What this product is

A citizen-facing web companion to CityCatalyst that answers, in plain language:
**"What is my city doing on climate, and how can I take part?"**

It walks a resident through four connected steps:

1. **How it works** — a diagram translating CityCatalyst's planning data (GHGI emissions, CCRA risk, HIAP priority actions) into *Understand → Connect → Act*. No dashboards to decode.
2. **Explore** — search a city or pick it on a map; see a plain-language snapshot of its emissions inventory and climate-risk profile, and how residents there are engaging.
3. **Inspiration** — a gallery of real, independently sourced success stories where citizens changed their cities, filterable by action type.
4. **Take Action** — universal civic pathways (join a group, show up, speak up, vote on the budget, start something, measure your block, call a citizens' assembly), each with a concrete first step, filterable by the cause you care about.

**The OEF angle (keep central).** CityCatalyst is the trust layer underneath. The same city data that funders use to assess readiness is what powers the citizen view — and citizen engagement feeds *back* as a scored co-benefit. Most city climate tools serve governments only; this serves citizens, which differentiates CityCatalyst in the IDB Cities Network (300+ LAC cities).

---

## 2. Data sources & provenance (this is the credibility spine)

Every city snapshot carries a **provenance badge** so users always know where a number comes from.

**Brazilian cities — live from the CityCatalyst Global API** (`api.citycatalyst.io`):
- **Emissions:** assembled by summing GPC sectors from the SEEG inventory (energy, transport, IPPU, land) plus SINIR/SNIS (waste), via `/api/v1/source/{datasource}/city/{locode}/{year}/{gpc}`. Values are kg CO₂e → tonnes. Inventories are *partial* (some sectors / scope-2 not captured) — flagged in the UI.
- **Climate risk:** top hazards from the CCRA model via `/api/v0/ccra/risk_assessment/city/{locode}/current`. Scores are clipped at a 0.99 ceiling, so top hazards present as "Very High."

**Other cities — latest verified official inventories + risk profiles** (external, each linked):
C40/CDP, GLA-LEGGI (London), Ville de Paris/APUR, City of Copenhagen, NYC NPCC/MOCEJ, ICLEI (Ahmedabad), Bogotá SDA, Medellín PAC, etc. Inventory boundaries differ (e.g. Paris in-territory vs. footprint; Rotterdam = port-industrial cluster; Seoul = 2005 baseline) and are noted per card.

**Success stories** are real and independently sourced (C40, WRI, World Bank, SEforALL, city governments); headline numbers cross-checked, uncertain figures qualified. **Story images** are Wikimedia Commons under reuse-permitting licenses (CC0 / CC BY / CC BY-SA), with credit shown.

---

## 3. Revenue model

- **Freemium CityCatalyst add-on:** free public access; paid white-labeled civic dashboards for cities / consultancies.
- **Grant-funded pilots:** 3–5 cities (e.g. Brazilian municipalities already on CityCatalyst).
- **MDB co-financing:** position as a "community engagement component" / co-benefit deliverable within climate project-preparation programs (B2G, IDB, philanthropy).

The unlock: civic participation is already scored as a co-benefit (HIAP, −2..+2). This module makes it **visible and measurable**, which is exactly what funders need to de-risk and approve.

---

## 4. Non-goals (this hackday)

Auth, user accounts, write-back to CityCatalyst, the full global city catalogue, production data licensing, and a real per-city engagement directory. The demo proves the *concept* and the *data pipe*, not production completeness.
