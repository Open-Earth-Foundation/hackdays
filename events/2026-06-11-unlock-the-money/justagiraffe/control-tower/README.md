# Sub-Sovereign Finance Program (SFP) Control Tower

A runnable control room for the IDB Sub-Sovereign Finance Program pilot, in IDB branding. **One candidate record, four lenses** over 63 mock cities/regions across 8 LAC countries plus approved City Readiness Navigator intakes:

1. **Intake** — imports submitted City Readiness Navigator dossiers, lets the IDB reviewer approve or decline them, and keeps the decision visible.
2. **Readiness Scoring** — the city / SNG gate: transparent weighted model (credit · fiscal · legal · governance) with **live weight sliders**. It answers the first question, "is this city actually ready?", and assigns each record to `Ready`, `Developing`, or `Early` with a recommended next action.
3. **Project Review** — the ready-city workflow: only cities that pass the readiness gate can actively move through the proposal stages (`Proposal Intake` → `Project Screening` → `Structuring` → `Quality & Risk Review` → `Board Pipeline`). Non-ready cities can still have project concepts, but they are shown as blocked concepts rather than active pipeline items.
4. **M&E & Board** — the OVE evaluation spine: Board milestone timeline plus the full two-stage funnel, showing both readiness-building and project advancement. It keeps Subprogram 1 (investment finance) and Subprogram 2 (TC readiness support) visible in the same control room.

> All figures are **fictional mock data** for the hackday demo.

## Run it

### Integrated demo (Navigator → Control Tower)

Use **two terminals**. Start the Navigator first.

**Terminal 1 — City Readiness Navigator**

```bash
cd events/2026-06-11-unlock-the-money/justagiraffe/city-readiness-navigator
npm install
npm run dev
```

Open http://localhost:3000, walk the Valdivia story, and **Submit to funder pipeline**.

**Terminal 2 — SFP Control Tower**

```bash
cd events/2026-06-11-unlock-the-money/justagiraffe/control-tower
npm run dev
```

Open http://localhost:8000. The **Intake** tab auto-loads Navigator submissions. Click
**Approve** — the dossier stays in Intake as approved and also appears in **Readiness Scoring**
and **Project Review** at `Proposal Intake`.

| What | Detail |
|---|---|
| Control Tower URL | http://localhost:8000 |
| Navigator URL | http://localhost:3000 (or `3001` if `3000` is busy) |
| Proxy endpoint | `/api/navigator-submissions` → Navigator `/api/submissions` |
| Submissions store | In-memory on Navigator (resets on dev server restart) |
| Intake decisions | Browser `localStorage` (persists across Control Tower reloads) |

### Standalone mock portfolio

You can still open `index.html` directly for the 63-city mock portfolio only, but **Navigator
intake import requires `npm run dev`** (the local server avoids CORS issues and provides the proxy).

## Files

| File | What it is | Owner |
|---|---|---|
| `index.html` | Whole dashboard (HTML + CSS + JS, single file) | Ana / shared |
| `server.mjs` | Tiny local static server + Navigator submissions proxy for the demo | shared |
| `scoring.js` | Readiness scoring model — weights, tiers, eligibility. Runs in browser **and** Node. | Sean |
| `data/sngs.js` | 63 mock SNGs + M&E indicators + Board milestones (`window.CONTROL_TOWER_DATA`) | Mirco |

The dashboard **re-scores every candidate live** through `scoring.js` on load — so editing the weights in one file changes every score on screen. Approved Navigator intakes are mapped into the same SNG record shape, then enter Readiness Scoring and Project Review at `Proposal Intake`.

## The scoring model (grounded in the IDB SFP doc)

SNG eligibility in the proposal turns on *"credit strength, financial viability, legal capacity and good governance ... underpinned by an early creditworthiness assessment."* We encode that as four sub-scores (0–100):

```
composite = 0.30·creditworthiness + 0.30·fiscalHealth + 0.20·legalCapacity + 0.20·governance
tier      = Ready (≥70) · Developing (45–69) · Early (<45)
```

Plus the project-eligibility gate (3 simultaneous IDB criteria + non-accrual). Tune weights live from the Readiness Scoring tab, or edit `scoring.js`. The model also exports `explainScore()` (per-pillar point contributions), `readinessActionFor()` (recommended next action), `canEnterProjectReview()` (gate into the project workflow), and `intakeChecklist()` (documentary requirements that drive the project-review workflow state) — all run in browser and Node.

**Architecture note (the §0 question):** the readiness and project-review views are deliberately *two linked lenses on the same candidate record*, not two copies of the same feature. The readiness view answers "is this SNG ready?" (analytic); the project-review view answers "for Ready cities, where is this proposal in the IDB process and what's blocking it?" (workflow: gates, checklist, aging, $ roll-ups). The candidate drawer shows both lenses for one record, and a weight change in one view re-scores everything in the other.

## Extend toward real data (hackday stretch)

- **CityCatalyst Global API** → feed real city signals into `readiness.*` for one or two hero cities (proof the pipe is real). See the hackday resources for the API repo + POC template.
- **Brazil CAPAG open data** → the Treasury publishes A/B/C fiscal ratings + indicators for ~5,570 municipalities; overlay onto `signals` to drive `creditworthiness`/`fiscalHealth`.
- **AI signal (Mirco)** → an LLM pass that turns a news/budget snippet into a `governance` or political-will sub-score.

## Drop into the hackday repo

```bash
# from the hackday repo root
cp -r /path/to/control-tower events/2026-06-11-unlock-the-money/apps/control-tower
git checkout -b hackday/2026-06-11/control-tower
git add events/2026-06-11-unlock-the-money/apps/control-tower && git commit -m "Sub-Sovereign Pilot Control Tower scaffold"
```

## Regenerate the mock data

The dataset was generated by a small Python script (seeded, reproducible). To reshape it (more cities, different distributions), regenerate `data/sngs.js` and keep the four-pillar fields + `meIndicators` + `boardMilestones` shape intact so `index.html` and `scoring.js` keep working.
