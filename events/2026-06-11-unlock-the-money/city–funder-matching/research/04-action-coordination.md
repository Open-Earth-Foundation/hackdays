# Action coordination — which actions bundle, and how

**Bundling is not a property of cities — it's a property of the *action*.** The "bundle actions" aggregation in the [problem & model](./00-problem-and-model.md) only produces a financeable package when the actions being combined are *coordinated*: standardized enough across cities that a funder can underwrite them as one thing. This note characterises that property so the engine can score it, and so a bundle is built on homogeneity rather than forced together to hit a ticket size.

## Why coordination is the hinge

The problem bundling solves is structural: individual municipal actions are too small and too costly-per-deal. Transaction costs are roughly fixed regardless of size, and most lenders carry minimum ticket sizes a single comuna can't reach. Pooling raises effective deal size, spreads fixed costs, and diversifies risk.

But pooling only *works* where the things pooled are alike. The proven models — Nordic municipal funding agencies (Kommuninvest, MuniFin), US state bond banks and Clean Water SRFs, EIB **ELENA** for energy-efficiency — all rest on two conditions: a **homogeneous, standardized asset** and **one legal/fiscal regime**. The recurring failure mode is the opposite: heterogeneous contracts, credit, timelines and reporting make a "bundle" expensive to assemble and impossible to underwrite as a single instrument.

Chile hands us the legal-regime condition for free (one country, one currency, one regulator). What remains variable — and what we can score — is **how standardized each action is**.

## The coordination spectrum

| Tier | What it means | Chile-relevant actions | What you actually bundle | Instrument |
|------|---------------|------------------------|--------------------------|------------|
| 🟢 **Highly coordinated** | Same kit, same contract in every city | LED streetlights · rooftop/community solar · EV charging · e-bus fleets · building efficiency | The **capex** — one procurement, one financeable package | Pooled grant/loan; ESCO; debt |
| 🟡 **Semi-coordinated** | Common type, locally designed | BRT / bus lanes · district heating · waste-to-energy & organics · water + leakage | The **preparation** — standardize the feasibility + *Bases*; finance follows the pipeline | Programmatic / blended |
| 🔴 **Idiosyncratic** | Site-, governance- & politics-bound | AFOLU / forestry · coastal & flood defense · land-use reform · ecosystem restoration | The **knowledge & grants** — not balance sheets | Grant / PES / TA |

What pushes an action left: a standardized asset, a repeatable contract, predictable revenue or savings, a shared vendor pool, and a clear, comparable cost. What pins it right: unique sites, multi-agency approval, uncertain returns, long timelines, and benefits that aren't monetizable.

## What this changes in the engine

**Score it.** Each action (or better, each action *archetype*) gets a `coordination` value, 🟢/🟡/🔴. It's an action property — computed once at country level, reusable across cities, like the rest of the Action→Funder edge.

**It gates bundling.** Consistent with the model's rule that *a bundle must share Action→Funder instrument/sector*: only bundle within the **same archetype and tier**. The tier then dictates *what* is pooled — capex on the left, project-prep in the middle, grants/TA on the right. A bundle that mixes tiers is the failure mode, restated.

**Coordination ≠ municipal-applicable.** A highly coordinated action can still trip the [actor gap](./02-findings.md): rooftop solar is standardized but the eligible applicant is often the *household*, so the city's route is **referrer/facilitator**, not applicant (cf. Casa Solar, FPA). Always check both edges — a tidy bundle the city legally can't hold is no bundle.

**It reframes the transport gap.** Findings #_prototype_ flagged that **transport has no dedicated instrument** in the Chile inventory. But transport actions (e-buses, BRT) are high-coordination — which makes them the *prime* candidate for a **bundled programmatic package** (IDB/FNDR-style) precisely *because* no single fund serves them. Coordination turns a supply gap into a bundling opportunity. By contrast, energy/waste are already grant-served per-comuna, and AFOLU is idiosyncratic (forestry sinks are place-specific) → grant/PES, not a pooled instrument.

> **Worked example — Los Ríos.** Twelve comunas each carrying an LED-streetlight or rooftop-solar action share an archetype, a tier (🟢), and an instrument class. Pool them into one standardized procurement + one facility and the bundle clears a threshold none clears alone — the FNDR/municipal-association route. The same twelve comunas' AFOLU or coastal actions (🔴) cannot be pooled this way; there the shared object is technical assistance and grant capital, matched individually.

## Role in the model

Operationalises the *Action* axis of pooling: coordination is the score that decides *which* action-bundles are real, and *what kind* of money each tier can actually pull (see [`05-bundling-synthesis.md`](./05-bundling-synthesis.md)).
