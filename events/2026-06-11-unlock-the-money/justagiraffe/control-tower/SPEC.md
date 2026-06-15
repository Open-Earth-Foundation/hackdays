# Sub-Sovereign Pilot Control Tower — Product Specification

**Status:** Hackday prototype (working scaffold) · **Audience:** the Claude Code session that will improve this app
**Inputs you should load alongside this spec:** `index.html`, `scoring.js`, `data/sngs.js`, and the IDB program PDF (`../reference/IDB cities regions - Document proposal - Public.pdf`).
**Goal of the next iteration:** deepen the app's fidelity to the real IDB program, polish each of the three features, and re-skin the UI in **IDB branding** (reference https://www.iadb.org/en).

---

## 0. Open architecture question — investigate this before you build

**Message from the product owner (Ana):** Before improving the app, step back and critically assess whether this initial design is actually the best architecture — don't just accept it. In particular, scrutinize the **Intake & Triage / proposal pipeline ("proposal timeline")**. I'm not convinced it's well-designed: it feels **too similar to the Readiness Scoring view**, and I'd like you to investigate whether keeping them as two separate features is the right call or whether there's a cleaner model.

Specifically, consider:
- Are the proposal pipeline and the readiness scoring **conceptually distinct**, or are they two views of the same underlying object (a candidate SNG moving through stages, scored along the way)? If the latter, would a **unified model** — e.g. one candidate record with a stage *and* a score, surfaced through a pipeline view and a scoring view of the same data — be cleaner than two parallel features?
- Does the pipeline carry information the scoring view doesn't (workflow state, ownership, intake documents, decisions/approvals, dates) that **justifies it as its own feature**? If so, lean into that distinction so the two views stop overlapping.
- Is a **kanban** the right metaphor for the proposal timeline, or would a true **timeline / process tracker** (with documentary milestones, decision gates, SLA/aging) better reflect how a proposal actually moves from intake to Board?
- What's the **minimal, non-redundant** information architecture that still preserves all three jobs (intake/triage, scoring, M&E)?

Please **propose your recommendation with reasoning** (and trade-offs) before committing to an implementation, rather than building the current structure as-is. The owner is genuinely open to restructuring this.

---

## 1. What this product is

A single "control room" for the program team running the **IDB Sub-Sovereign Finance Program (SFP)** — a 5-year pilot to lend directly to subnational governments (cities, states, regions) *without* a sovereign guarantee. The team must receive incoming projects, screen ~63 candidate SNGs across 8 Latin American & Caribbean countries for readiness and creditworthiness, and track early-outcome indicators against Board reporting milestones — today done across scattered spreadsheets.

The app replaces those spreadsheets with one dashboard that does three things:

1. **Intake & Triage** — receive and move subnational project proposals through a pipeline.
2. **Readiness Scoring** — score each candidate on creditworthiness, fiscal health, legal capacity, and governance, and apply the IDB eligibility gate.
3. **M&E & Board** — watch the pilot's monitoring indicators against Board reporting milestones.

**The OEF angle (keep this central in any redesign):** OpenEarth / CityCatalyst is the *trust layer* underneath. CityCatalyst's city-level data feeds the readiness and pipeline screening, turning a funder's hardest question — *"is this city actually ready?"* — into something visible at a glance. **Revenue model:** funder tool / data service, repeatable to any MDB running sub-sovereign or urban-finance pilots.

---

## 2. IDB program context (ground the app in this)

Distilled from the IDB proposal PDF. The improving model should read the full PDF for depth; this is the orientation.

**Instrument.** Establishment of a "Sub-Sovereign Finance Program (SFP)" on a **5-year pilot** basis, lending to eligible SNGs **without sovereign guarantee/counter-guarantee**.

**General objective.** Help eligible SNGs promote sustainable regional and local development by **improving access to market financing**.

**Specific objectives.** (i) Strengthen SNGs' fiscal & financial management; (ii) strengthen SNGs' capacity to structure and implement project pipelines; (iii) improve subnational service delivery and infrastructure.

**Two subprograms.**
- **Subprogram 1 — Investment finance:** up to **US$1 billion** from the Bank's Ordinary Capital.
- **Subprogram 2 — TC "sub-sovereign readiness":** ~**US$13M** in technical cooperation (≈US$4M regular TCs, US$6M contingent-recovery TCs, US$3M for pilot implementation + M&E).

**SNG eligibility.** Determined by (i) ability to contract and obtain IDB external financing **without sovereign guarantee**; and (ii) **credit strength, financial viability, legal capacity, and good governance** (managerial capacity, fiscal track record, planning, fiscal controls) — underpinned by an **early creditworthiness assessment**. Neither the SNG nor its central/federal government may be in non-accrual.

**Project eligibility — 3 simultaneous criteria.** (i) **High developmental impact**; (ii) **prevents crowding out** private-sector finance (and ideally crowds it *in*); (iii) **improves SNG efficiency & effectiveness**. Short-term/cash-flow/refinancing loans are *not* eligible.

**Risk posture.** Mitigated by deliberate selection of creditworthy borrowers, fiscal-responsibility frameworks, and IDB's regular monitoring of financial indicators.

**Monitoring, Reporting & Evaluation.** The pilot must "prove itself to the Board." The Office of Evaluation and Oversight (**OVE**) conducts an evaluation of the SFP as a lending instrument; a **mid-term review** informs whether/how the instrument continues. This is the spine of the M&E feature.

> When the model deepens the app, prefer the program's own vocabulary (SNG, sovereign guarantee, non-accrual, crowding-in, Ordinary Capital, OVE, Subprogram 1/2, creditworthiness assessment) over generic "loan dashboard" language.

---

## 3. Architecture & files (current)

Zero-build, runs by opening `index.html`. No framework, no server required (data is loaded via `<script>` tags so it works from `file://`).

```
control-tower/
├── index.html        # entire UI: HTML + CSS + vanilla JS (3 tabs + KPI bar + candidate drawer)
├── scoring.js        # readiness scoring model; runs in browser AND Node (module.exports + window.ScoringModel)
└── data/
    └── sngs.js       # window.CONTROL_TOWER_DATA = { weights, sngs[63], meIndicators[8], boardMilestones[4] }
```

**Data flow.** On load, `index.html` reads `window.CONTROL_TOWER_DATA`, then **re-scores every candidate live** through `ScoringModel.scoreSNG()`. That means editing weights/thresholds in `scoring.js` instantly changes every score on screen — this "the pipeline is live" property must be preserved in any refactor.

**Note for the rebuild:** the hackday repo template (`apps/_template`) is a **Next.js / TypeScript** app. The current scaffold is intentionally a single static HTML file (fastest demo path). The model may either (a) keep enhancing the static file, or (b) port it into the Next.js template — if porting, preserve the data schema and the live-rescore behavior, and keep the three-feature structure.

---

## 4. Data model

`window.CONTROL_TOWER_DATA` top level: `{ generated, program, weights, sngs[], meIndicators[], boardMilestones[] }`.

**SNG record** (63 of them, ~fictional mock data):
```js
{
  id: "SNG-1001", name: "Curitiba", country: "Brazil", iso: "BR",
  type: "City" | "Region", population: 5763900,
  proposal: { title, askUSDm, stage, submitted, cofinance },
  readiness: { creditworthiness, fiscalHealth, legalCapacity, governance },  // each 0–100
  signals: {
    capagRating: "A"|"B"|"C"|null,        // Brazil only (CAPAG)
    ownSourceRevenuePct, debtServiceRatioPct, currentBalancePct,
    independentAudit: bool, canBorrowWithoutSovereignGuarantee: bool
  },
  compositeReadiness: 0–100, tier: "Ready"|"Developing"|"Early",
  eligibility: { highDevImpact, noCrowdingOut, improvesSNGEfficiency, centralGovNotInNonAccrual, eligible }
}
```
`proposal.stage ∈ { "Intake", "Screening", "Readiness Review", "Structuring", "Board Pipeline" }`.
8 countries: Brazil, Mexico, Colombia, Argentina, Peru, Chile, Ecuador, Dominican Republic.

**meIndicators[]:** `{ name, current, target, unit, milestone, status: "on-track"|"at-risk"|"off-track" }`
**boardMilestones[]:** `{ date, title, desc }`

---

## 5. Scoring model (`scoring.js`)

Grounded in the IDB eligibility language (§2). Four sub-scores → weighted composite → tier; plus a project-eligibility gate.

```
composite = 0.30·creditworthiness + 0.30·fiscalHealth + 0.20·legalCapacity + 0.20·governance
tier      = Ready (≥70) · Developing (45–69) · Early (<45)

eligibilityCheck (IDB project gate):
  highDevImpact            = ask > US$15M
  noCrowdingOut            = true (assumed screened at intake)
  improvesSNGEfficiency    = governance ≥ 40
  centralGovNotInNonAccrual= true (country-level gate)
  eligible                 = all of the above
```
Weights and thresholds are deliberately exposed for tuning. Any improvement should keep them **transparent and explainable** — a funder will challenge the score, so the app should be able to show *why* a candidate scored what it did.

---

## 6. Feature specifications & enhancement backlog

Each feature is owned by one teammate for the review/improve phase. Enhancements should be proposed via Git branches.

### 6a. Intake & Triage — owner: **Ana**
> ⚠️ **Read §0 first.** The owner is unsure this should remain a separate feature from Readiness Scoring (6b). Investigate and recommend the information architecture before improving this view.

**Current:** a 5-column kanban (Intake → Screening → Readiness Review → Structuring → Board Pipeline); each card shows name, country/type, proposal title, ask, tier-colored score; click opens the candidate drawer. Cards are sorted by score within a column.
**Purpose:** the program team's daily workflow — receive a proposal, triage it, advance it.
**Enhancement directions:**
- A real **"New proposal" intake form** that creates a card in Intake and scores it immediately (capture: SNG name, country, type, sector/title, ask, and the readiness inputs or a CityCatalyst lookup).
- **Drag-and-drop** between stages (or stage buttons), persisting in memory.
- Per-card **eligibility / readiness flags** (e.g. a red dot if not eligible, a "missing audit" warning).
- **Filters** (country, tier, sector, ask range) and a count/$ roll-up per column.
- An **intake checklist** mirroring the IDB documentary requirements (legal capacity evidence, fiscal statements, non-accrual confirmation).
- Stretch: ingest a proposal from an uploaded PDF/email and pre-fill the form.

### 6b. Readiness Scoring — owner: **Mirco** (AI lead)
**Current:** sortable, filterable table of all 63 SNGs with the four sub-scores (mini bar charts), composite, tier pill, and a signal column (CAPAG). Clicking a row opens a drawer with the score breakdown, fiscal/credit signals, and the IDB eligibility gate (pass/fail per criterion).
**Purpose:** answer "is this city actually ready?" defensibly.
**Enhancement directions:**
- **"Why this score"**: show each pillar's point contribution to the composite; let the user adjust weights and watch scores move live.
- **Wire real signals** for 1–2 hero cities: CityCatalyst Global API for city data; Brazil **CAPAG** open data (Treasury A/B/C ratings + indicators for ~5,570 municipalities) to drive `creditworthiness`/`fiscalHealth`.
- **AI signal extraction** (the AI-lead showcase): an LLM pass that turns a news/budget/document snippet into a `governance` or political-will sub-score, with the source quoted as evidence.
- **Confidence / data-provenance** badges (which sub-scores are real vs. estimated).
- **Cohort view**: select N candidates and compare side by side.
- Make the **early creditworthiness assessment** explicit (the IDB term) as the headline of the drawer.

### 6c. M&E & Board — owner: **Sean** (Head of Finance & Ops)
**Current:** a Board-milestone **timeline** (4 nodes) plus a grid of **8 program indicators** (current vs. target, progress bar, on-track/at-risk/off-track, and which Board milestone each reports to).
**Purpose:** prove the pilot to the Board; track early outcomes (the OVE evaluation spine).
**Enhancement directions:**
- Map indicators to a proper **results matrix** structure (impact → outcome → output), echoing IDB/OVE practice.
- Tie each milestone to **what must be true** by that date and surface gaps (e.g. "needs 5 more Ready cities before Q4 update").
- Distinguish **Subprogram 1** (investment, US$1B envelope) vs. **Subprogram 2** (TC readiness, ~US$13M) tracking.
- A **"Board brief" export** (one-pager / PDF) summarizing pipeline + indicators for a reporting date.
- **Trend over time** (even mock monthly snapshots) so indicators move, not just static targets.
- Surface **portfolio risk** (concentration by country/sector, share able to borrow without guarantee).

---

## 7. IDB branding (apply in the redesign)

Re-skin from the current OEF-teal dark theme toward **IDB Group visual identity**. **Verify exact values against https://www.iadb.org/en** (inspect the live site's computed CSS / logo assets) — the model should pull real hex codes and the official logo rather than rely solely on the approximations below.

**Approximate IDB-aligned palette (starting point — confirm on iadb.org):**
- Primary teal/cyan (IDB signature): `#00A0AF` / brighter accent `#00B9C7`
- Deep navy / ink (headers, text): `#0B2B3C` / `#13334A`
- Neutral light surface: `#F4F7F8`, mid-gray `#5B6B72`
- Status colors: green `#3DA66E`, amber `#E8A33D`, red `#D2544E`

**Logo/identity:** use the official **IDB / Inter-American Development Bank** wordmark+mark from iadb.org (respect clear space; don't distort). Co-brand subtly with **OpenEarth / CityCatalyst** as the "trust layer / data powered by" partner — this is an OEF-built tool *for* IDB, so both marks belong, with IDB as the primary skin.
**Typography:** clean humanist sans (IDB's site reads as a Helvetica/Arial-family sans). Use a near match (e.g. system sans or Inter) if the exact brand font isn't available.
**Tone:** institutional, credible, restrained. Favor light backgrounds and generous whitespace over the current dark "ops console" look if matching iadb.org; keep data density readable.

---

## 8. Constraints & non-goals (for this iteration)

- **Keep it demoable and self-contained.** No auth, no real database, no write-back to IDB systems.
- **Preserve the data schema and the live re-scoring** so the three features stay wired together.
- All financial figures are **mock/fictional** unless a real source (CityCatalyst/CAPAG) is wired — label real vs. mock.
- Don't lose the **OEF trust-layer narrative** or the **revenue framing** in the redesign.

## 9. How to use this spec in the Claude Code session

Load this `SPEC.md`, the three app files (`index.html`, `scoring.js`, `data/sngs.js`), and the IDB PDF. Ask the model to: (1) read the PDF to deepen program fidelity (vocabulary, eligibility logic, M&E/results structure); (2) improve the three features per §6; (3) re-skin to IDB branding per §7, pulling exact colors/logo from iadb.org; (4) keep the schema and live-rescore behavior from §3–§5 intact. Each teammate then proposes their feature's enhancements on a Git branch.
