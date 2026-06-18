# Implementation Plan: Split City Readiness From Project Review

> **Current state (15 Jun 2026):** implemented as four tabs — **Intake** (Navigator dossier
> approve/decline), **Readiness Scoring**, **Project Review**, **M&E & Board**. The original
> `Intake & Triage` kanban was renamed/split per this plan; Navigator handoff lands in the
> new **Intake** tab first. Run both apps per [`README.md`](README.md).

## Summary

The current prototype has three tabs: `Intake & Triage`, `Readiness Scoring`, and `M&E & Board`. The transcript points to a real information architecture issue already flagged in `SPEC.md`: the current `Intake & Triage` pipeline and `Readiness Scoring` table overlap too much.

The proposed change is to make the user journey explicitly two-stage:

1. **Readiness Scoring**: assess whether a city / SNG is ready for the IDB Sub-Sovereign Finance Program.
2. **Project Review**: only once a city is Ready, review and advance concrete project proposals through the IDB pipeline.

This turns readiness into the first filter and moves project-level proposal details out of the readiness view. Early and Developing cities should be treated as candidates for technical cooperation / readiness acceleration, not as active project pipeline items.

## Product Decision

### Current Issue

Today, `index.html` defines proposal stages as:

```js
const STAGES = ["Intake","Screening","Readiness Review","Structuring","Board Pipeline"];
```

This mixes two different concepts:

- **City / SNG readiness**: creditworthiness, fiscal health, legal capacity, governance, ability to borrow without sovereign guarantee, independent audit, CAPAG / fiscal signals.
- **Project progression**: proposal received, project screening, structuring, quality and risk review, Board pipeline.

Because `Readiness Review` is currently a proposal stage, cities with Early or Developing readiness can appear in a project-style workflow even though the product narrative says the first question should be: "is this city actually ready?"

### Recommended Model

Separate the lifecycle into two linked but distinct workflows.

#### Stage 1: Readiness Scoring

Purpose: determine whether the city / SNG is ready for sub-sovereign borrowing without sovereign guarantee.

Audience question: "What is missing for this city to be ready?"

Shows:

- SNG identity: name, country, type, population.
- Readiness tier: Ready, Developing, Early.
- Composite readiness score and weighted pillar breakdown.
- Four readiness pillars: creditworthiness, fiscal health, legal capacity, governance.
- City / SNG signals: CAPAG rating where available, own-source revenue, debt service ratio, operating balance, independent audit, ability to borrow without sovereign guarantee.
- Readiness checklist: legal capacity, audited statements, fiscal indicators, non-accrual confirmation, governance / planning evidence.
- Recommended next action: Ready for project review, needs targeted TC, or early-stage engagement.
- Data provenance: real vs. mock / estimated signals.

Does not show by default:

- Proposal ask.
- Project title.
- Cofinancing flag.
- Proposal submission date.
- Project stage.
- IDB project eligibility gate.
- "Proposal & process" drawer section.

#### Stage 2: Project Review

Purpose: evaluate and structure specific projects from cities that have already passed the readiness gate.

Audience question: "For Ready cities, which projects should advance toward structuring and Board approval?"

Shows:

- Only SNGs with `tier === "Ready"` by default.
- Project title / sector.
- Ask amount.
- Cofinancing expectation.
- Development impact.
- Crowding-out / crowding-in screen.
- Improves SNG efficiency and effectiveness.
- Documentary intake status.
- Project review stage.
- Days in stage / aging.
- Stage-gate controls.

Proposed replacement name for `Intake & Triage`:

- **Project Review**: clearest and least overloaded.
- Alternative: **Project Pipeline** if the team wants to emphasize workflow.
- Alternative: **Ready Project Pipeline** if the team wants the readiness gate visible in the tab name.

Recommended tab labels:

1. `Readiness Scoring`
2. `Project Review`
3. `M&E & Board`

## Data Model Changes

Keep the existing static, no-build architecture and preserve live rescoring from `scoring.js`. Do not break the current demo flow.

### Current Shape

Each `sngs[]` record currently combines city readiness and proposal data:

```js
{
  id,
  name,
  country,
  type,
  population,
  proposal: { title, askUSDm, stage, submitted, cofinance },
  readiness: { creditworthiness, fiscalHealth, legalCapacity, governance },
  signals,
  compositeReadiness,
  tier,
  eligibility
}
```

### Target Shape

For this prototype, keep a single record but make the distinction explicit:

```js
{
  id,
  name,
  country,
  type,
  population,
  readiness: {
    creditworthiness,
    fiscalHealth,
    legalCapacity,
    governance,
    status: "Ready" | "Developing" | "Early",
    recommendedAction
  },
  signals,
  readinessChecklist,
  proposals: [
    {
      id,
      title,
      askUSDm,
      sector,
      stage,
      submitted,
      cofinance,
      eligibility
    }
  ]
}
```

For the hackday implementation, a smaller change is acceptable:

- Keep `proposal` as-is to avoid broad rewiring.
- Add a clear rule: the project review tab filters to Ready cities by default.
- Hide project fields in the readiness table and readiness drawer unless a user explicitly opens a "project details" section.
- Rename proposal pipeline constants and labels from generic intake to project review.

Future production model should support multiple proposals per SNG, because one city can have several possible projects.

## UI Implementation Plan

### 1. Make Readiness Scoring the First Tab

Change navigation order in `index.html`:

Current:

```html
<button data-tab="pipeline" class="active">Intake &amp; Triage</button>
<button data-tab="readiness">Readiness Scoring</button>
<button data-tab="me">M&amp;E &amp; Board</button>
```

Target:

```html
<button data-tab="readiness" class="active">Readiness Scoring</button>
<button data-tab="pipeline">Project Review</button>
<button data-tab="me">M&amp;E &amp; Board</button>
```

Update initial tab visibility so `Readiness Scoring` opens first.

### 2. Refocus the Readiness View on Cities

Update the readiness section copy from early creditworthiness assessment plus project eligibility to city readiness:

- "Assess which cities / SNGs are Ready, Developing, or Early."
- "Ready cities can move into Project Review."
- "Developing and Early cities enter a readiness acceleration track."

Remove or hide project fields from the readiness table and default drawer section:

- No project title.
- No ask amount.
- No proposal stage.
- No project eligibility gate.

Keep:

- Weighted score model.
- "Why this score."
- Source / provenance badge.
- Fiscal and governance signals.
- Ability to borrow without sovereign guarantee.
- Independent audit.

### 3. Turn Early / Developing Into Readiness Acceleration

Add a readiness action label derived from score and checklist:

- `Ready`: "Move to Project Review."
- `Developing`: "Targeted TC / readiness acceleration."
- `Early`: "Foundational readiness support."

This can be calculated in `scoring.js` alongside `tierFor(score)`.

Optional UI additions:

- Add filter for `recommendedAction`.
- Add "missing readiness items" count.
- Add checklist cards in the drawer showing what the city needs before it can enter Project Review.

### 4. Rename and Narrow the Current Pipeline

Rename the pipeline tab and section from `Intake & Triage` to `Project Review`.

Update the section subtitle:

Current behavior: all tiers can appear in the proposal pipeline.

Target behavior: only Ready cities appear by default. Add an optional toggle for demo / analysis:

- Default: `Ready cities only`.
- Optional toggle: `Show non-ready cities with proposals`.

If non-ready cities are shown, clearly mark them as blocked:

- `blocked: city not Ready`
- no advancement to structuring / Board until readiness is Ready
- still allow opening the drawer to inspect why

### 5. Replace `Readiness Review` as a Project Stage

Current stages:

```js
["Intake","Screening","Readiness Review","Structuring","Board Pipeline"]
```

Recommended project stages:

```js
["Proposal Intake","Project Screening","Structuring","Quality & Risk Review","Board Pipeline"]
```

Rationale:

- `Readiness Review` becomes the first tab, not a stage inside the project workflow.
- `Project Screening` covers project-level eligibility: development impact, no crowding-out, and SNG efficiency.
- `Quality & Risk Review` reflects IDB process language more clearly than a second readiness check.

Migration rule for mock data:

- Existing `Readiness Review` project stages should map to `Project Screening` if the city is Ready.
- If the city is Developing or Early, mark it blocked from project workflow and keep its project data only as a draft / proposed idea.

### 6. Split the Drawer Into Two Modes

The current drawer combines:

- Early creditworthiness assessment.
- IDB eligibility gate.
- Proposal & process.
- Documentary intake checklist.

Target behavior:

- From `Readiness Scoring`: open a **City Readiness Drawer**.
- From `Project Review`: open a **Project Review Drawer**.

City Readiness Drawer:

- readiness score
- tier
- pillar contributions
- fiscal / credit / legal / governance signals
- readiness checklist
- readiness acceleration recommendation
- no proposal section by default

Project Review Drawer:

- city readiness summary at top
- proposal details
- project eligibility gate
- stage strip
- documentary intake status
- advancement controls

This can be done with one `openDrawer(id, mode)` function rather than duplicating all drawer code.

### 7. Update New Proposal Flow

The current `+ New proposal` form asks for readiness scores and project details at the same time. Under the new model, split this conceptually:

Minimum hackday change:

- Rename button to `+ New project for Ready city`.
- Require / default the city selection to Ready cities.
- If creating a new SNG, make the flow clearly create a city readiness record first.

Better next iteration:

1. `+ New city / SNG`: creates a readiness record and scores it.
2. `+ New project`: attaches a project to an existing Ready city.

## Scoring and Logic Changes

### Readiness Gate

Add a helper in `scoring.js`:

```js
function canEnterProjectReview(sng) {
  return sng.tier === "Ready" &&
    sng.signals.canBorrowWithoutSovereignGuarantee &&
    sng.signals.independentAudit;
}
```

The exact rule should be agreed with the team. The simplest demo rule can be `tier === "Ready"`; a stricter rule should also require the core legal / audit conditions.

### Project Eligibility Gate

Keep project eligibility separate from readiness:

- high developmental impact
- no private-sector crowding-out
- improves SNG efficiency and effectiveness
- non-accrual condition

This should move visually into `Project Review`, not sit as a prominent element in city readiness.

## Mock Data Updates

The current `data/sngs.js` includes project data for every city, including Early and Developing cities. That currently makes it look like every city has an active project pipeline item.

Update the mock data narrative:

- Ready cities: have active project proposals eligible for Project Review.
- Developing cities: may have project ideas, but they are marked as draft / blocked pending readiness acceleration.
- Early cities: mostly readiness records only; if they have project ideas, label them as concept notes, not pipeline projects.

Add more realistic fake project data for Ready cities:

- sector
- development impact rationale
- cofinance / private capital potential
- project maturity
- documentary completeness
- expected Board path

This supports the transcript request for "more deep dive on the projects" in the second stage.

## M&E Updates

Update KPIs and M&E language so they reflect the two-stage funnel:

- Candidate SNGs assessed.
- Ready SNGs.
- Developing / Early SNGs in readiness acceleration.
- Ready cities with active project proposals.
- Projects in structuring / Board pipeline.
- Indicative financing committed.

This makes the Board story clearer: the pilot is not only tracking projects, it is also tracking whether the region is building a credible pool of sub-sovereign borrowers.

## Implementation Sequence

### Phase 1: Low-Risk UI Reframe

- Make `Readiness Scoring` the first tab.
- Rename `Intake & Triage` to `Project Review`.
- Update section copy and labels.
- Hide proposal/process details from readiness-first surfaces.
- Filter Project Review to Ready cities by default.

### Phase 2: Stage and Drawer Cleanup

- Replace `Readiness Review` project stage.
- Add `openDrawer(id, mode)`.
- Create separate readiness and project drawer content.
- Add blocked state for non-ready cities with project ideas.

### Phase 3: Data Model and Fake Data Deepening

- Introduce readiness action / acceleration fields.
- Add more detailed project mock data for Ready cities.
- Mark non-ready city proposals as concept notes or drafts.
- Consider moving from `proposal` to `proposals[]` when time allows.

### Phase 4: Demo Story and Docs

- Update `SPEC.md` to reflect the two-stage model.
- Update `../archive/ROADMAP.md` demo script:
  1. Readiness Scoring: "Which cities are ready?"
  2. Project Review: "For ready cities, which projects advance?"
  3. M&E & Board: "Is the pilot proving itself?"
- Update README instructions if tab names or file behavior changes.

## Team Questions To Resolve

1. **Can a city have an advanced proposal even if it is not ready for IDB sub-sovereign lending?**

   Example: the city has a detailed project idea, but lacks creditworthiness, audit evidence, or legal capacity to borrow without sovereign guarantee.

   Recommended working answer: yes, but it should be represented as a **concept note / draft project**, not as an active Project Review item. It should be blocked from structuring and Board pipeline until the city passes the readiness gate.

2. **What is the minimum rule for "Ready enough" to enter Project Review?**

   Options:

   - simple demo rule: `tier === "Ready"`
   - stricter rule: `tier === "Ready"` plus can borrow without sovereign guarantee plus independent audit
   - IDB-aligned rule: readiness score plus explicit legal, credit, governance, and non-accrual checklist pass

3. **Should `Project Review` include only Ready cities, or should it also show blocked proposals from non-ready cities?**

   Recommendation: default to Ready cities only, with an optional "show blocked concepts" toggle for transparency.

4. **What should happen to Technical Cooperation readiness work?**

   Recommendation: represent Developing and Early cities as part of a readiness acceleration track under Subprogram 2, not as failed projects.

5. **Is one proposal per SNG enough for the prototype?**

   Recommendation: keep one proposal for the hackday if needed, but design the next data model around `proposals[]` because a ready city may have multiple possible investments.

## Acceptance Criteria

- The first screen answers "which cities are ready?"
- The readiness view no longer foregrounds project ask, proposal title, or project stage.
- The project workflow only shows Ready cities by default.
- Non-ready cities with project ideas are visibly blocked or treated as concept notes.
- The term `Readiness Review` is no longer used as a project pipeline stage.
- The new `Project Review` view contains deeper project-level data than the readiness view.
- The M&E view distinguishes city readiness funnel metrics from project pipeline metrics.
- Live rescoring from `scoring.js` still updates readiness tiers and downstream counts.

## Recommended Demo Narrative

1. "We first score the city, not the project. IDB's hard question is whether this SNG can credibly borrow without sovereign guarantee."
2. "Early and Developing cities do not disappear; they move into readiness acceleration, where the app shows what is missing."
3. "Only Ready cities enter Project Review, where the team evaluates the actual project: impact, crowding-in, ask, documents, and Board path."
4. "The Board view then tracks both sides of the funnel: readiness capacity built and investment projects advanced."
