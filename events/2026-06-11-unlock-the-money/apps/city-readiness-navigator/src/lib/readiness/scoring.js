// Readiness scoring model — Sub-Sovereign Finance Program (SFP) Control Tower
// -----------------------------------------------------------------------------
// The Readiness Engine. It is now PROFILE-DRIVEN: weights, tiers, the eligibility
// gate and the documentary checklist are read from the ACTIVE readiness profile
// (see readiness-profiles.js), not hardcoded. The default profile "idb-sfp"
// reproduces the IDB Sub-Sovereign Finance Program eligibility logic exactly
// (GN-xxxx proposal §4.2/§4.3/§4.13/OP-301), so the dashboard and its live
// re-score behave identically — but swapping the active profile re-points the
// whole engine at a different MDB's criteria. That pluggability is the point.
//
// Owner: Sean (Finance) tunes the active profile's weights & thresholds; Mirco
// (AI) feeds the sub-scores from CityCatalyst + open fiscal data. Profiles are
// the contract the City-Funder Matching Engine and other MDBs plug into.
// -----------------------------------------------------------------------------

// Resolve the profile registry in both browser (window) and Node (require).
const Profiles =
  (typeof window !== "undefined" && window.ReadinessProfiles) ||
  (typeof require !== "undefined" ? require("./readiness-profiles.js") : null);

let ACTIVE_PROFILE = Profiles ? Profiles.getProfile(Profiles.DEFAULT_PROFILE_ID) : null;

// Live, mutable views derived from the active profile. These objects keep the
// SAME identity/shape the dashboard already binds to (sliders mutate
// READINESS_WEIGHTS in place; PILLAR_LABELS[key] is read for labels).
const READINESS_WEIGHTS = {};
const PILLAR_LABELS = {};
const TIER_THRESHOLDS = { ready: 70, developing: 45 };

// Rebuild the derived views from a profile (mutating in place to preserve identity).
function applyProfile(profile) {
  ACTIVE_PROFILE = profile;
  for (const k of Object.keys(READINESS_WEIGHTS)) delete READINESS_WEIGHTS[k];
  for (const k of Object.keys(PILLAR_LABELS)) delete PILLAR_LABELS[k];
  for (const p of profile.pillars) {
    READINESS_WEIGHTS[p.key] = p.weight;
    PILLAR_LABELS[p.key] = p.label;
  }
  TIER_THRESHOLDS.ready = profile.tiers.thresholds.ready;
  TIER_THRESHOLDS.developing = profile.tiers.thresholds.developing;
  return ACTIVE_PROFILE;
}
if (ACTIVE_PROFILE) applyProfile(ACTIVE_PROFILE);

// Switch the engine to another MDB's profile (e.g. "idb-sfp" → "caf-...").
function setActiveProfile(id) {
  if (!Profiles) return ACTIVE_PROFILE;
  return applyProfile(Profiles.getProfile(id));
}
function activeProfile() { return ACTIVE_PROFILE; }

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
  const actions = (ACTIVE_PROFILE && ACTIVE_PROFILE.tiers.actions) || {};
  return actions[tier] || tier;
}

// Step 2 after the early creditworthiness assessment (Step 1): the active
// profile's hard clearance gates (for IDB SFP: legal capacity to borrow w/o
// sovereign guarantee §4.2, independent audit §4.13/OP-301). Analytic pillar
// scores do not replace these checks.
function readinessClearanceBlockers(sng) {
  const sig = sng.signals || {};
  const gates = (ACTIVE_PROFILE && ACTIVE_PROFILE.clearanceBlockers) || [];
  return gates.filter(g => !g.test(sig)).map(g => g.label);
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

// The active profile's project-eligibility gate (for IDB SFP: 3 simultaneous
// criteria §4.3 + the non-accrual condition §4.2). Returns which criteria pass
// (keyed object) plus `eligible`, so the dashboard can show *why*.
function eligibilityCheck(sng) {
  const criteria = (ACTIVE_PROFILE && ACTIVE_PROFILE.projectEligibility) || [];
  const checks = {};
  for (const c of criteria) checks[c.key] = !!c.test(sng);
  checks.eligible = Object.values(checks).every(Boolean);
  return checks;
}

// Step 2 after the composite score: binary clearance before active project review.
function canEnterProjectReview(sng) {
  return tierFor(compositeReadiness(sng.readiness)) === "Ready" &&
    readinessClearanceBlockers(sng).length === 0;
}

// Documentary intake checklist from the active profile (for IDB SFP: §4.13
// readiness assessment, §4.18 legal frameworks, OP-301). Drives the pipeline
// view's workflow state — what is missing before the next gate.
function intakeChecklist(sng) {
  const items = (ACTIVE_PROFILE && ACTIVE_PROFILE.documentaryChecklist) || [];
  return items.map(it => ({ key: it.key, label: it.label, done: !!it.test(sng) }));
}

// One call to (re)score a candidate end-to-end against the active profile.
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
  // profile controls (new)
  setActiveProfile, activeProfile, applyProfile,
};

if (typeof window !== "undefined") window.ScoringModel = ScoringModel;
if (typeof module !== "undefined") module.exports = ScoringModel;
