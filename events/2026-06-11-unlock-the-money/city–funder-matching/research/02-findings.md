# Findings so far

The main things we've learned, grounded in the Chile data (78-fund inventory, 102 actions, Valdivia + 11 Los Ríos comunas).

## 1. Funders are transparent — but per-call, PDF-bound, ephemeral

The harmonized inventory *looks* vague (only ~24% "detailed", amounts on 9% of rows), but that's **our harvest depth, not source opacity**. When a call is open, the administering institution publishes everything in the *Bases* document bundle: exact eligibility (and explicit exclusions), the amount, thematic lines, dates, a **scoring rubric** (Pauta de Evaluación), and even the **awarded-projects** list.

> Worked example — FPA 2026 Bases yields: fixed **$6M** grant; municipalities *cannot* apply directly (partner with a non-profit); applicant needs regional legal domicile + valid vigencia; PV lines need a SEC-licensed installer; preselection cutoff 2.25/3.0.

**Implication:** the detail to score eligibility, adequacy and competitiveness exists — trapped in per-call PDFs. The fix is a **live per-call enrichment**, not a static re-harvest. Transparency varies by funder: MMA is document-rich; CORFO is harder (JS-rendered, restrictive licence, intermediated via banks).

## 2. Windows are short → readiness is a real dimension

Application windows run **~3–6 weeks** (median ~42 days). **31/78 funds are annual**, and only **~22 are open at any given moment** (the rest sit between cycles). Combined with pre-conditions that take time (e.g. a vigencia certificate ≤60 days old), this means a city must be **pre-staged**, not just well-matched. "Will the window be open when you're ready?" is part of the recommendation.

## 3. City profiles: rich emissions, but two big caveats

City profiles come as CityCatalyst HIAP `/prioritize` payloads — **34 GPC subsectors** of emissions per city. But:
- **`population` is null** in every example → no per-capita or amount-scaling until we join the census.
- **Most rural comunas are net carbon *sinks*** (forestry) — 11 of 12 Los Ríos comunas have negative net emissions (Corral −698k; Valdivia is +526k). **Weight matching by *gross sectoral* emissions, not net**, or a forestry sink swamps the signal.
- Valdivia (urban: transport + energy) is structurally unlike its rural neighbours → **cities are heterogeneous even within one region**; don't assume one profile.

## 4. The actor gap is the #1 error mode

A fund can exist for a sector yet be useless to the city because the eligible applicant is a **firm / household / NGO**, not the municipality. Proven by CORFO (industry instruments, firm-actor) and FPA (community-org grants the municipality legally can't hold). The tripartite split captures this cleanly — it shows up as the two funding edges disagreeing.

## 5. Licensing: facts, not files

Republishing the **information** (amounts, dates, eligibility, criteria) is low-risk for the transparent government sources *if* we surface extracted facts with attribution and a link, and **don't mirror the PDFs**. Constraints are narrow and known: **CORFO** is CC BY-NC-ND (NonCommercial — sensitive for a paid feature); **fondos.gob.cl** forbids copying (use as a human index only). Tag every record with its source licence; one targeted legal sign-off before shipping.

## Prototype results (Valdivia)

- **City→Funder:** 52 funds the city can apply to directly · 1 it facilitates (Casa Solar) · 25 referrer-only (FPA family + CORFO).
- **Action→Funder:** energy / waste / afolu well-served by grants; **transport has no dedicated instrument** (a real gap); industry served only via firm-actor CORFO → "refer local firms."
