# justagiraffe — "Unlock the Money" workstream

**What this team is building:** the city→funder climate-finance chain, as **two runnable
apps on a shared readiness spine** plus the architecture that ties them (and the other
hackday modules) together.

> **Start here →** read in this order: this file → [`INTEGRATED-ARCHITECTURE.md`](INTEGRATED-ARCHITECTURE.md)
> (the system map) → [`PRD-city-facing-readiness-app.md`](PRD-city-facing-readiness-app.md)
> (what the city app is) → [`ITERATION-2.1-PLAN.md`](ITERATION-2.1-PLAN.md) (what we're
> building now). The two diagrams in [`diagrams/`](diagrams/) are the 1-screen version.

## The two apps

| App | Faces | Lives in | URL |
|---|---|---|---|
| **City Readiness Navigator** | the **city** — match → readiness pathways → portfolio → submit | [`city-readiness-navigator/`](city-readiness-navigator/) | http://localhost:3000 |
| **SFP Control Tower** | the **IDB** — Intake · Readiness Scoring · Project Review · M&E & Board | [`control-tower/`](control-tower/) | http://localhost:8000 |

They share a **readiness engine** (`readiness-profiles.js` + `scoring.js`). It currently
exists in **both** apps (`control-tower/` and `…/navigator/src/lib/readiness/`) — extracting
one shared `@oef/readiness` package is an open decision (architecture §8).

## Run both apps (integrated demo)

Use **two terminals**. Start the Navigator first, then the Control Tower.

**Terminal 1 — City Readiness Navigator**

```bash
cd events/2026-06-11-unlock-the-money/justagiraffe/city-readiness-navigator
npm install
npm run dev
```

Open http://localhost:3000. Walk the Valdivia story and **Submit to funder pipeline** at the end.

**Terminal 2 — SFP Control Tower**

```bash
cd events/2026-06-11-unlock-the-money/justagiraffe/control-tower
npm run dev
```

Open http://localhost:8000. The **Intake** tab loads Navigator submissions automatically.
Click **Approve** on a dossier — it stays in Intake as approved and also appears in
**Readiness Scoring** and **Project Review** (at `Proposal Intake`).

| Step | Where | What happens |
|---|---|---|
| 1 | Navigator `/` | City builds readiness and submits a dossier |
| 2 | Navigator `/pipeline` | Quick in-app preview (“funder received it”) |
| 3 | Control Tower **Intake** | IDB reviewer sees pending dossiers, approves or declines |
| 4 | Control Tower **Readiness Scoring** / **Project Review** | Approved candidates join the main pipeline |

**Demo caveats (intentional for the hackday):**
- Navigator submissions are **in-memory** — they reset when that dev server restarts.
- Control Tower approve/decline decisions are stored in **browser `localStorage`**.
- Control Tower proxies Navigator via `/api/navigator-submissions` (tries ports `3000` and `3001`).
- Control Tower can still be opened as static `index.html` for the 63-city mock portfolio, but **Navigator intake import requires `npm run dev`**.

## Folder layout

```
justagiraffe/                         everything the team builds lives here
├── README.md                         ← you are here (the map)
├── INTEGRATED-ARCHITECTURE.md        canonical · system map (§5a diagram)
├── PRD-city-facing-readiness-app.md  canonical · city app definition
├── ITERATION-2.1-PLAN.md             canonical · current execution plan
├── diagrams/                         polished SVGs for presenting
├── city-readiness-navigator/         the city-facing app (Next.js)
├── control-tower/                    the IDB-facing app (index.html + server.mjs + docs + M&E)
├── archive/                          superseded / historical (not current)
└── reference/                        source material (IDB PDF, notes, team)
```
Both apps are siblings under `justagiraffe/` — the team folder is self-contained
(no team code outside it), which keeps things clean when branches merge to `main`.

## The documents

**Canonical (current — read these):**
- [`INTEGRATED-ARCHITECTURE.md`](INTEGRATED-ARCHITECTURE.md) — how all modules fit (the system map; §5a diagram).
- [`PRD-city-facing-readiness-app.md`](PRD-city-facing-readiness-app.md) — the City Readiness Navigator product definition (the durable *what/why*).
- [`ITERATION-2.1-PLAN.md`](ITERATION-2.1-PLAN.md) — the current execution plan (the *how/now*).
- [`diagrams/`](diagrams/) — polished SVGs for presenting (5a module view + process timeline).

**Control Tower (IDB-facing app) — in [`control-tower/`](control-tower/):**
- [`control-tower/README.md`](control-tower/README.md) — how the Control Tower works.
- [`control-tower/SPEC.md`](control-tower/SPEC.md) — product spec (next-iteration fidelity + IDB branding).
- [`control-tower/IMPLEMENTATION_PLAN.md`](control-tower/IMPLEMENTATION_PLAN.md) — split readiness from project review.
- [`control-tower/READINESS-PROFILES.md`](control-tower/READINESS-PROFILES.md) — the profile-driven scoring schema.
- [`control-tower/Monitoring_Evaluation.md`](control-tower/Monitoring_Evaluation.md) + [`control-tower/MandE-questions.md`](control-tower/MandE-questions.md) — **M&E framework** (Annex IV + forward-looking readiness), authored by Mirco.

**Historical / superseded — in [`archive/`](archive/):**
- [`archive/ITERATION-2-PLAN.md`](archive/ITERATION-2-PLAN.md) — *superseded by* `ITERATION-2.1-PLAN.md`.
- [`archive/ROADMAP.md`](archive/ROADMAP.md) — original 24h hackday roadmap (11–12 Jun).

**Source material / reference — in [`reference/`](reference/):**
- `reference/IDB cities regions - Document proposal - Public.pdf` — the IDB SFP program doc.
- `reference/idb.txt` — raw IDB notes. · `reference/teammembers.md` — team.

## The model in one line

Two readiness questions, kept modular: **is the _project_ bankable?** (Project Preparator)
vs. **is the _entity_ creditworthy for this instrument?** (this Navigator). A city enters from
either side; the Navigator adds creditworthiness + pooling and hands a **dossier** to the IDB
Control Tower. Full rationale in [`INTEGRATED-ARCHITECTURE.md`](INTEGRATED-ARCHITECTURE.md).

---
*Status (15 Jun 2026): both apps run locally with an end-to-end demo bridge (Navigator submit →
Control Tower Intake approve → Readiness Scoring / Project Review); architecture + PRD reflect
the v2.2 two-layer reframe; Mirco's M&E framework folded into `control-tower/`.*
