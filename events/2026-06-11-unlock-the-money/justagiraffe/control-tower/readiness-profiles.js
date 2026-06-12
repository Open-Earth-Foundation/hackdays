// Readiness Profiles — the pluggable contract behind the Readiness Engine
// =============================================================================
// A *readiness profile* parameterizes the Readiness Engine for ONE financing
// target (an MDB instrument). You are never "ready" in the abstract — you are
// ready *for a specific funder's criteria*. Swap the profile and the same engine
// (scoring.js) assesses a city's readiness for a different funder.
//
//   IDB Sub-Sovereign Finance Program  ->  profile "idb-sfp"   (the canonical #1)
//   CAF / World Bank / EIB / GCF / ...  ->  add their own profile object
//
// This is what turns justagiraffe from "an IDB tool" into "the readiness layer
// for any MDB" — and it is the join point with the City-Funder Matching Engine:
// the Matching Engine narrows a city's plan to a few *candidate targets*; for the
// chosen target, the Readiness Engine loads that target's profile and produces a
// score + gap + preparation track. See READINESS-PROFILES.md.
//
// A profile is plain data + tiny pure predicates. scoring.js derives its weights,
// tiers, eligibility gate and checklists from the ACTIVE profile, so the existing
// dashboard and its live re-score keep working unchanged when "idb-sfp" is active.
// -----------------------------------------------------------------------------

// --- Profile schema (informal) ----------------------------------------------
//  {
//    id, funder, instrument, version, source, summary,
//    pillars:  [{ key, label, weight, basis, source }],        // weights sum to 1
//    tiers:    { thresholds:{ready,developing}, labels, actions:{Ready,Developing,Early} },
//    clearanceBlockers:  [{ key, label, test(signals)->bool }],   // hard gates
//    projectEligibility: [{ key, label, test(sng)->bool, note? }],// the funder's project gate
//    documentaryChecklist:[{ key, label, test(sng)->bool }],      // intake documents
//    preparation: { Developing:{track,funding}, Early:{track,funding} }, // the TC route
//    // optional: how external datasets feed the pillar inputs (provenance + mapping)
//    signalSources?: [{ pillar, dataset, field, note }],
//  }
// -----------------------------------------------------------------------------

// IDB Sub-Sovereign Finance Program — profile #1. Encodes exactly the eligibility
// logic from the June 2025 proposal that scoring.js previously hardcoded, so
// behavior is identical when this profile is active.
const IDB_SFP = {
  id: "idb-sfp",
  funder: "Inter-American Development Bank",
  instrument: "Sub-Sovereign Finance Program (SFP)",
  version: "2025-06",
  source: "IDB SFP proposal (June 2025) — §4.2, §4.3, §4.13, §4.18, OP-301",
  summary: "Direct investment lending to subnational governments without a sovereign guarantee.",

  // Weighted sub-scores → composite 0–100. weights MUST sum to 1.
  pillars: [
    { key: "creditworthiness", label: "Creditworthiness", weight: 0.30,
      basis: "credit rating, debt service, market access", source: "§4.13" },
    { key: "fiscalHealth", label: "Fiscal health", weight: 0.30,
      basis: "own-source revenue, operating balance, solvency", source: "§4.13" },
    { key: "legalCapacity", label: "Legal capacity", weight: 0.20,
      basis: "can contract & borrow without sovereign guarantee", source: "§4.2 / OP-301" },
    { key: "governance", label: "Governance", weight: 0.20,
      basis: "managerial capacity, planning, fiscal controls, audit", source: "§4.2" },
  ],

  tiers: {
    thresholds: { ready: 70, developing: 45 }, // >=70 Ready, 45-69 Developing, <45 Early
    labels: { ready: "Ready", developing: "Developing", early: "Early" },
    actions: {
      Ready: "Move to Project Review",
      Developing: "Targeted TC / readiness acceleration",
      Early: "Foundational readiness support",
    },
  },

  // Hard gates (§4.2 / §4.13 / OP-301): a city can score "Ready" and still be
  // blocked from clearance until these documentary/legal conditions are met.
  clearanceBlockers: [
    { key: "legal", label: "Legal capacity to borrow w/o sovereign guarantee",
      test: sig => !!sig.canBorrowWithoutSovereignGuarantee },
    { key: "audit", label: "Independent audit on file",
      test: sig => !!sig.independentAudit },
  ],

  // Project-eligibility gate: 3 simultaneous criteria (§4.3) + non-accrual (§4.2).
  // Keys are preserved so the dashboard's eligibility object shape is unchanged.
  projectEligibility: [
    { key: "highDevImpact", label: "High developmental impact",
      test: sng => sng.proposal.askUSDm > 15, note: "material, transformational scale (Impact+)" },
    { key: "noCrowdingOut", label: "Prevents private-sector crowding-out",
      test: () => true, note: "screened at intake against §4.5 criteria" },
    { key: "improvesSNGEfficiency", label: "Improves SNG efficiency & effectiveness",
      test: sng => sng.readiness.governance >= 40, note: "capacity-building angle (§4.6)" },
    { key: "centralGovNotInNonAccrual", label: "SNG + central gov not in non-accrual",
      test: () => true, note: "country-level gate (§4.2)" },
  ],

  // Documentary intake checklist (§4.13 / §4.18 / OP-301) — drives pipeline state.
  documentaryChecklist: [
    { key: "legal", label: "Legal capacity to borrow w/o sovereign guarantee (OP-301)",
      test: sng => !!sng.signals.canBorrowWithoutSovereignGuarantee },
    { key: "audit", label: "Independent audit / audited financial statements",
      test: sng => !!sng.signals.independentAudit },
    { key: "fiscal", label: "Fiscal indicators on file (own-source rev, debt service, balance)",
      test: sng => typeof sng.signals.ownSourceRevenuePct === "number" },
    { key: "accrual", label: "Non-accrual confirmation (SNG + central government)",
      test: () => true },
    { key: "crowd", label: "Crowding-out screen vs. §4.5 criteria",
      test: sng => !!sng.proposal && sng.proposal.stage !== "Proposal Intake" },
  ],

  // The preparation/readiness track a non-Ready city is routed to — the "get help
  // to become ready" path (IDB Subprogram 2 TC, ~US$13M envelope).
  preparation: {
    Developing: { track: "Targeted TC / readiness acceleration",
                  funding: "IDB SFP Subprogram 2 — regular TC" },
    Early: { track: "Foundational readiness support",
             funding: "IDB SFP Subprogram 2 — regular + contingent-recovery TC" },
  },

  // How the four pillar inputs (readiness.*) can be sourced from real datasets
  // instead of mock values. This is the contract the Matching Engine + CityCatalyst
  // feed into. All join on UN/LOCODE (locode) and CityCatalyst city_id.
  signalSources: [
    { pillar: "fiscalHealth", dataset: "City-Funder Matching Engine — comuna_capacity_scores.csv",
      field: "fcm_dependency_pct / cofinance_score", note: "real Chilean fiscal autonomy (SINIM/FCM), locode-keyed" },
    { pillar: "creditworthiness", dataset: "Brazil CAPAG (Treasury)",
      field: "A/B/C rating + indicators", note: "real ~5,570 municipalities" },
    { pillar: "governance", dataset: "City-Funder Matching Engine — comuna_capacity_scores.csv",
      field: "professionalization_pct / staff_per_1000", note: "managerial capacity proxy" },
    { pillar: "legalCapacity", dataset: "manual / intake form",
      field: "canBorrowWithoutSovereignGuarantee", note: "legal opinion, not a dataset" },
  ],
};

// ILLUSTRATIVE TEMPLATE — shows the shape another MDB fills in. The criteria below
// are PLACEHOLDERS, not any real bank's published rules. Do not present as fact;
// replace every field with the target MDB's actual eligibility before using.
const GENERIC_MDB_TEMPLATE = {
  id: "generic-mdb-template",
  funder: "<MDB name>",
  instrument: "<instrument / facility name>",
  version: "template",
  source: "ILLUSTRATIVE — replace with the MDB's published eligibility criteria",
  summary: "Template profile demonstrating how a new MDB plugs into the engine.",
  illustrative: true,
  pillars: [
    { key: "creditworthiness", label: "Creditworthiness", weight: 0.25, basis: "<define>", source: "<cite>" },
    { key: "fiscalHealth", label: "Fiscal health", weight: 0.25, basis: "<define>", source: "<cite>" },
    { key: "legalCapacity", label: "Legal capacity", weight: 0.25, basis: "<define>", source: "<cite>" },
    { key: "governance", label: "Governance", weight: 0.25, basis: "<define>", source: "<cite>" },
  ],
  tiers: {
    thresholds: { ready: 65, developing: 40 },
    labels: { ready: "Ready", developing: "Developing", early: "Early" },
    actions: { Ready: "Advance", Developing: "Prepare", Early: "Foundational support" },
  },
  clearanceBlockers: [
    { key: "legal", label: "<hard legal/eligibility gate>", test: () => true },
  ],
  projectEligibility: [
    { key: "impact", label: "<impact criterion>", test: () => true },
  ],
  documentaryChecklist: [
    { key: "audit", label: "<required document>", test: () => true },
  ],
  preparation: {
    Developing: { track: "<TC / prep track>", funding: "<funding source>" },
    Early: { track: "<foundational track>", funding: "<funding source>" },
  },
};

// --- Registry ----------------------------------------------------------------
const READINESS_PROFILES = {
  "idb-sfp": IDB_SFP,
  "generic-mdb-template": GENERIC_MDB_TEMPLATE,
};

const DEFAULT_PROFILE_ID = "idb-sfp";

function getProfile(id) {
  return READINESS_PROFILES[id] || READINESS_PROFILES[DEFAULT_PROFILE_ID];
}
function listProfiles() {
  return Object.values(READINESS_PROFILES).map(p => ({
    id: p.id, funder: p.funder, instrument: p.instrument, illustrative: !!p.illustrative,
  }));
}

const ReadinessProfiles = {
  READINESS_PROFILES, DEFAULT_PROFILE_ID, getProfile, listProfiles,
  IDB_SFP, GENERIC_MDB_TEMPLATE,
};

if (typeof window !== "undefined") window.ReadinessProfiles = ReadinessProfiles;
if (typeof module !== "undefined") module.exports = ReadinessProfiles;
