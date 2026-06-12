// Readiness scoring model — Sub-Sovereign Finance Program (SFP) Control Tower
// -----------------------------------------------------------------------------
// Grounded in IDB SFP eligibility language (GN-xxxx proposal, §4.2/4.13):
// SNG eligibility is determined by "credit strength, financial viability, legal
// capacity and good governance practices (including managerial capacity, fiscal
// track record, planning, and fiscal controls) ... underpinned by an early
// creditworthiness assessment", provided the SNG and the central/federal
// government are not in non-accrual.
// We turn those four pillars into a transparent, auditable composite score.
// Owner: Sean (Finance) tunes the weights & thresholds; Mirco (AI) feeds the
// sub-scores from CityCatalyst + open fiscal data. Kept in sync with data/sngs.js.
// -----------------------------------------------------------------------------

const READINESS_WEIGHTS = {
  creditworthiness: 0.30, // credit signals: rating, debt service, market access
  fiscalHealth:     0.30, // own-source revenue, operating balance, solvency
  legalCapacity:    0.20, // can contract & borrow without sovereign guarantee
  governance:       0.20, // managerial capacity, planning, fiscal controls, audit
};

const PILLAR_LABELS = {
  creditworthiness: "Creditworthiness",
  fiscalHealth:     "Fiscal health",
  legalCapacity:    "Legal capacity",
  governance:       "Governance",
};

const TIER_THRESHOLDS = { ready: 70, developing: 45 }; // >=70 Ready, 45-69 Developing, <45 Early

// Replace weights (partial ok) and renormalize to sum 1 so the composite stays 0-100.
// Used by resetWeights(); sliders use setWeightShare() so the handle tracks the label.
function setWeights(partial) {
  Object.assign(READINESS_WEIGHTS, partial);
  const total = Object.values(READINESS_WEIGHTS).reduce((a, b) => a + b, 0) || 1;
  for (const k of Object.keys(READINESS_WEIGHTS)) READINESS_WEIGHTS[k] /= total;
  return { ...READINESS_WEIGHTS };
}

// Set one pillar to targetPct (0–100) of the composite; scale the others proportionally.
function setWeightShare(key, targetPct) {
  const target = Math.max(0, Math.min(100, targetPct)) / 100;
  const others = Object.keys(READINESS_WEIGHTS).filter(k => k !== key);
  const otherSum = others.reduce((s, k) => s + READINESS_WEIGHTS[k], 0);
  READINESS_WEIGHTS[key] = target;
  if (target >= 1) {
    others.forEach(k => { READINESS_WEIGHTS[k] = 0; });
  } else if (otherSum > 0) {
    const scale = (1 - target) / otherSum;
    others.forEach(k => { READINESS_WEIGHTS[k] *= scale; });
  } else {
    const each = (1 - target) / others.length;
    others.forEach(k => { READINESS_WEIGHTS[k] = each; });
  }
  return { ...READINESS_WEIGHTS };
}

function compositeReadiness(readiness, weights = READINESS_WEIGHTS) {
  return Math.round(
    Object.entries(weights).reduce((sum, [k, w]) => sum + (readiness[k] || 0) * w, 0)
  );
}

// "Why this score": per-pillar point contribution to the composite, so the
// dashboard can defend the number when a funder challenges it.
function explainScore(readiness, weights = READINESS_WEIGHTS) {
  return Object.keys(weights).map(k => ({
    key: k,
    label: PILLAR_LABELS[k] || k,
    score: readiness[k] || 0,
    weight: weights[k],
    points: Math.round((readiness[k] || 0) * weights[k] * 10) / 10,
  }));
}

function tierFor(score) {
  if (score >= TIER_THRESHOLDS.ready) return "Ready";
  if (score >= TIER_THRESHOLDS.developing) return "Developing";
  return "Early";
}

function readinessActionFor(tier) {
  if (tier === "Ready") return "Move to Project Review";
  if (tier === "Developing") return "Targeted TC / readiness acceleration";
  return "Foundational readiness support";
}

// Step 2 after the early creditworthiness assessment (Step 1). Mirrors SFP §4.2:
// ability to contract IDB financing without sovereign guarantee, plus documentary
// evidence (§4.13 / OP-301). Analytic pillar scores do not replace these checks.
function readinessClearanceBlockers(sng) {
  const sig = sng.signals || {};
  const blockers = [];
  if (!sig.canBorrowWithoutSovereignGuarantee) {
    blockers.push("Legal capacity to borrow w/o sovereign guarantee");
  }
  if (!sig.independentAudit) {
    blockers.push("Independent audit on file");
  }
  return blockers;
}

function readinessActionForSng(sng) {
  const tier = tierFor(compositeReadiness(sng.readiness));
  if (tier !== "Ready") {
    return readinessActionFor(tier);
  }
  if (canEnterProjectReview(sng)) {
    return "Cleared for Project Review";
  }
  return "Ready score · clearance blocked";
}

// IDB project-eligibility gate (3 simultaneous criteria, §4.3) + the SNG-level
// non-accrual condition (§4.2). Returns which criteria pass so the dashboard
// can show *why* a candidate is / isn't eligible.
function eligibilityCheck(sng) {
  const r = sng.readiness, p = sng.proposal;
  const checks = {
    highDevImpact:             p.askUSDm > 15,    // material, transformational scale (Impact+)
    noCrowdingOut:             true,              // screened at intake against §4.5 criteria
    improvesSNGEfficiency:     r.governance >= 40, // capacity-building angle (§4.6)
    centralGovNotInNonAccrual: true,              // country-level gate (§4.2)
  };
  checks.eligible = Object.values(checks).every(Boolean);
  return checks;
}

// Step 2 after the composite score: binary clearance before active project review.
function canEnterProjectReview(sng) {
  return tierFor(compositeReadiness(sng.readiness)) === "Ready" &&
    readinessClearanceBlockers(sng).length === 0;
}

// Documentary intake checklist mirroring the SFP due-diligence requirements
// (§4.13 readiness assessment, §4.18 legal frameworks, OP-301). Drives the
// pipeline view's workflow state — what is missing before the next gate.
function intakeChecklist(sng) {
  const sig = sng.signals || {};
  const pastIntake = sng.proposal && sng.proposal.stage !== "Proposal Intake";
  return [
    { key: "legal",   label: "Legal capacity to borrow w/o sovereign guarantee (OP-301)", done: !!sig.canBorrowWithoutSovereignGuarantee },
    { key: "audit",   label: "Independent audit / audited financial statements",          done: !!sig.independentAudit },
    { key: "fiscal",  label: "Fiscal indicators on file (own-source rev, debt service, balance)", done: typeof sig.ownSourceRevenuePct === "number" },
    { key: "accrual", label: "Non-accrual confirmation (SNG + central government)",       done: true },
    { key: "crowd",   label: "Crowding-out screen vs. §4.5 criteria",                     done: pastIntake },
  ];
}

// One call to (re)score a candidate end-to-end.
function scoreSNG(sng) {
  const score = compositeReadiness(sng.readiness);
  const tier = tierFor(score);
  return {
    ...sng,
    compositeReadiness: score,
    tier,
    readinessAction: readinessActionForSng(sng),
    eligibility: eligibilityCheck(sng),
    canEnterProjectReview: canEnterProjectReview(sng),
  };
}

const ScoringModel = {
  READINESS_WEIGHTS, TIER_THRESHOLDS, PILLAR_LABELS,
  setWeights, setWeightShare, compositeReadiness, explainScore, tierFor,
  readinessActionFor, readinessActionForSng, readinessClearanceBlockers,
  eligibilityCheck, canEnterProjectReview, intakeChecklist, scoreSNG,
};

if (typeof window !== "undefined") window.ScoringModel = ScoringModel;
if (typeof module !== "undefined") module.exports = ScoringModel;
