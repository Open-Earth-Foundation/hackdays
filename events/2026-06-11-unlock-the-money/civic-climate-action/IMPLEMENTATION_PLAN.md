# Civic Climate Action Engagement Module — Implementation Plan

How the app is built, and what to do next. The app lives in [`app/`](./app).

---

## 1. Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Leaflet** + **react-leaflet 5** for the city map, with free **OpenStreetMap / CARTO** basemap tiles
- No backend: all data is static TypeScript modules under `app/src/app/data/`, seeded from real
  sources (live CityCatalyst pulls were done at build-time and baked in for demo stability)
- Plain inline styles + a small design-token layer in `globals.css` (minimalist, no UI framework)

## 2. File map

```
app/src/app/
  layout.tsx            root layout, imports globals.css + metadata
  globals.css           design tokens (--ink, --accent, etc.) + Leaflet CSS
  page.tsx              composes the 4 sections: How it works · Explore · Inspiration · Take Action
  components/
    FlowDiagram.tsx     data→action diagram (server component)
    CityExplorer.tsx    search + map + selected-city detail panel (client)
    CityMap.tsx         Leaflet map, circle markers, fly-to selection (client, dynamic import, ssr:false)
    CitySnapshot.tsx    emissions bars + risk hazards + provenance badge
    StoriesGallery.tsx  success-story cards with images + category filter (client)
    TakeAction.tsx      civic action pathways + cause filter + CTA (client)
  data/
    types.ts            City, Story, Emissions, Risk, Hazard, StoryImage, Category, ActionPathway
    cities.ts           15 cities: coords, LOCODE, summary, highlights, emissions, risk, provenance
    stories.ts          15 sourced success stories + images
    actions.ts          7 universal civic action pathways, tagged by cause
    localEngagement.ts  Porto Alegre-specific civic recommendations and source links for the demo
```

## 3. Data model (the important part)

- **`City`** — `id`, `name`, `country`, `lat/lng`, `summary`, `highlights[]`, `locode?`,
  `storyIds[]`, `dataProvenance: "CityCatalyst" | "external"`, `emissions?`, `risk?`.
- **`Emissions`** — `totalTonnesCo2e`, `sectors?[]` (breakdown, CityCatalyst) **or** `topSector?`
  (external), `inventoryYear`, `perCapitaTonnes?`, `note?` (caveat), `source`, `sourceUrl`.
- **`Risk`** — `topHazards[]` (`hazard`, `keyImpact?`, `level`, `score?`), `summary?`, `source`, `sourceUrl`.
- **`Story`** — city, coords, `title`, `category`, `whatCitizensDid`, `outcome`, `year`,
  `sourceName/Url`, `image?` (`url`, `credit`, `license`, `sourcePageUrl`).
- **`LocalEngagementRecommendation`** — Porto Alegre demo cards with `title`, `priority`, `theme`,
  `whyItMatters`, `firstActions[]`, and `sources[]`. This is the bridge from CityCatalyst risk /
  emissions data to actual civic pathways and source links.

The provenance badge keys off `dataProvenance`; the UI renders sector **bars** when `sectors`
exist, else a "largest source" line. Honest caveats live in `emissions.note`.

## 4. CityCatalyst Global API pipeline (Brazil cities)

Base: `https://api.citycatalyst.io`. Cities are keyed by UN/LOCODE (e.g. `BR SAO`).

- **Emissions** — `GET /api/v1/source/{datasource}/city/{locode}/{year}/{gpc}` returns
  `totals.emissions.co2eq_100yr` in **kg**. The full inventory is assembled by summing GPC sectors:
  - Energy / transport / IPPU / land: datasource `SEEGv2023`, year `2023`
    (refs `I.*`, `II.*`, `IV.1`, `V.1/2/3`)
  - Waste: datasources `SINIR` + `SNIS`, year `2022` (refs `III.3.*`, `III.4.*`)
  - Sum → ÷1000 for tonnes → group into top-level sectors (I/II/III/IV/V) → shares.
  - **Caveat:** several refs return "No data" and scope-2 grid electricity isn't captured, so
    totals are conservative and transport's share is overstated. Surfaced in the UI.
- **Risk** — `GET /api/v0/ccra/risk_assessment/city/{locode}/current` → rows of
  `{keyimpact, hazard, normalised_risk_score}`. Take top hazards; map score→level
  (`<0.3 Low`, `0.3–0.5 Medium`, `0.5–0.7 High`, `>0.7 Very High`). Scores clip at 0.99.
- **City list** — `GET /api/v0/ccra/city/{country_code}` lists CCRA cities + actor_ids (5,570 for BR).

## 5. What's done vs. next

**Done**
- All 4 sections built and verified; production build clean; 15 story images load and are licensed.
- Live CityCatalyst emissions + CCRA risk baked in for São Paulo, Rio, Curitiba, Porto Alegre.
- Verified external inventories + risk for the 11 other cities, each with a source link.
- Porto Alegre "Take Action" demo layer added with official/community engagement sources.

**Next (in priority order)**
1. **Widen emissions coverage** — sum more GPC sectors / add scope-2 so the breakdown stops being
   transport-dominated; or pivot to a per-capita / sector-relative view.
2. **"My city" entry** — geolocation or a typeahead over the live CCRA city list (5,570 BR cities).
3. **Live fetch at runtime** — replace baked-in numbers with on-demand API calls + caching, so
   data refreshes without a rebuild (add a small route handler or server action).
4. **Real local "Act" data** — expand the Porto Alegre model to the other hero cities:
   community groups, public-comment windows, council agendas.
5. **Participation loop** — let residents log an action → produce the measurable co-benefit metric.

## 6. Gotchas

- `CityMap` must be dynamically imported with `ssr: false` (Leaflet touches `window`).
- The dev server (`next dev --turbopack`) can get into a stale state after many edits and 500;
  clearing `.next` and restarting fixes it. The **production** build is unaffected — for a stable
  demo run `npm run build && npm start`.
- Story images hotlink from `upload.wikimedia.org`; they use a plain `<img>` (no `next/image`
  remote-domain config needed). Keep the photographer credit + license visible per the CC terms.
