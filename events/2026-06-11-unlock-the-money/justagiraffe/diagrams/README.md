# Diagrams — integrated architecture (hack-day visuals)

Standalone SVGs (open in a browser, screenshot for slides). The mermaid in
[`../INTEGRATED-ARCHITECTURE.md`](../INTEGRATED-ARCHITECTURE.md) §5a is the canonical,
GitHub-rendering source of truth; these are the polished versions for presenting.

| File | What it shows | Pairs with |
|---|---|---|
| [`5a-integrated-architecture.svg`](5a-integrated-architecture.svg) | Module-boundary view: CityCatalyst host, **Preparator & Navigator as peer modules**, the Navigator's **three-step vertical** (① creditworthiness → ② readiness pathways/coaching → ③ portfolio & pooling), **standalone** capacity building, funder pipelines. | `INTEGRATED-ARCHITECTURE.md` §5a |
| [`process-timeline.svg`](process-timeline.svg) | Pipeline view: the top-to-bottom process (Source → Readiness pathways → Portfolio → Funder intake) with Path A / Path B and the shared-services rail (AI agents, Matching+Pooling, Fiscal adapters). Navigator submit → Control Tower **Intake** is the funder-intake handoff. | `ITERATION-2.1-PLAN.md` §F-7, §F-1, §G |

> The `process-timeline` SVG is a rebuild of a diagram that previously existed only as an
> in-session rendered artifact (never committed) — now persisted so it survives.

Colors are consistent across both: **CityCatalyst** (purple/indigo) · **Preparator** (blue) ·
**Navigator** (teal/green) · **services & funders** (gray).
