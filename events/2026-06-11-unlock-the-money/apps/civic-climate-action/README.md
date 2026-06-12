# Civic Climate Action Engagement Module

> A data mapping track prototype that turns CityCatalyst data for Porto Alegre into citizen-facing climate action pathways.

## Team

| Name | Role |
|------|------|
| TBD | Data mapping / product |
| TBD | Frontend |
| TBD | Local research |

## What We Built

We built the data foundation for a civic engagement module that translates CityCatalyst climate risk, emissions, and action data into plain-language recommendations for residents. The first city is Porto Alegre, Brazil. The output is a frontend-ready JSON mapping that can power cards such as flood resilience, landslide prevention, heat and green infrastructure, residential energy, and active mobility.

## Revenue Connection

This can become a premium CityCatalyst add-on for cities, funders, and implementation partners that need visible stakeholder engagement. It helps MDBs, DFIs, and philanthropic partners show public participation, equity considerations, and local accountability as part of climate project preparation.

## How to Run

```bash
cd events/2026-06-11-unlock-the-money/apps/civic-climate-action
npm install
npm run dev
# Open http://localhost:3000
```

## Data Files

| File | Purpose |
| --- | --- |
| `data/porto-alegre.snapshot.json` | Frozen CityCatalyst API snapshot for demo reliability |
| `data/civic-action-mapping.json` | Frontend-ready civic recommendation mapping |
| `data/external-engagement-opportunities.json` | Local engagement research queue |
| `docs/data-mapping-spec.md` | Technical mapping rules and output contract |

## Demo Script (5 min)

1. Show the problem: city climate data is useful to governments, but hard for residents to act on.
2. Show Porto Alegre's risk signals: floods, landslides, heat, water, and residential energy examples.
3. Show the translation layer: raw API fields become plain-language recommendations and civic actions.
4. Show the revenue angle: cities and funders can use this as a stakeholder engagement layer for climate project preparation.
5. Show next steps: validate local groups, wire HIAP prioritization, and connect the JSON to a resident-facing UI.

## Screenshots

[Add screenshots here as you build — they help tell the story]

## Built With

- Cursor + Claude
- Next.js / React
- CityCatalyst Global API
- Porto Alegre API snapshot
- JSON data mapping

## What We Learned

The CityCatalyst API is strong enough for a credible Porto Alegre data story, especially CCRA and city context. GHGI works through specific sources such as SEEG and EPE. City-specific policy support scores need more validation before use for Brazil.

## If This Survives the Hackday

- [ ] Validate local Porto Alegre civic groups, municipal meetings, and consultation links
- [ ] Add HIAP city-specific priority scores when available
- [ ] Connect `civic-action-mapping.json` to a simple resident-facing UI
- [ ] Add source citations and freshness metadata per recommendation
