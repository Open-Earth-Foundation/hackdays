// Reproducible: transforms the City-Funder Matching Engine's capacity CSVs
// (vendored under data/source/) into src/data/valdivia.json — the readiness
// inputs for the app. Run: npm run build:data
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "data", "source");
const OUT = path.join(__dirname, "..", "src", "data", "valdivia.json");

const readCsv = (f) => {
  const lines = fs.readFileSync(path.join(SRC, f), "utf8").trim().split("\n");
  const hdr = lines[0].split(",");
  return lines.slice(1).map((l) => {
    const cells = []; let cur = "", q = false;
    for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { cells.push(cur); cur = ""; } else cur += ch; }
    cells.push(cur);
    return Object.fromEntries(hdr.map((h, i) => [h, cells[i]]));
  });
};
const num = (v) => (v === "" || v == null ? null : Number(v));
const r = Math.round;

const units = readCsv("coordination_units_u11.csv");
const cap = readCsv("comuna_capacity_scores_u11.csv");
const capByLocode = Object.fromEntries(cap.map((c) => [c.locode, c]));

// --- Transparent mapping: Matching Engine capacity -> 4 readiness pillars (0-100) ---
function toReadiness(u) {
  const c = capByLocode[u.locode] || {};
  const capScore = num(c.composite_score);            // REAL: SINIM/FCM municipal capacity composite
  const prof = num(c.professionalization_pct_2023);   // REAL: SINIM professionalization
  const fcm = num(c.fcm_dependency_pct);              // REAL: FCM transfer dependency
  const isAnchor = u.is_anchor === "True";
  const fiscalAutonomy = fcm == null ? null : 100 - fcm;
  const readiness = {
    fiscalHealth: capScore == null ? 40 : r(capScore),
    governance: prof == null || capScore == null ? 40 : r(0.5 * prof + 0.5 * capScore),
    creditworthiness: capScore == null ? 35 : r(capScore * 0.95),
    legalCapacity: isAnchor ? 80 : 45,
  };
  return {
    id: `SNG-${u.locode.replace(/\s/g, "")}`,
    name: u.comuna, locode: u.locode || null, cityId: c.city_id || null,
    country: "Chile", iso: "CL", type: "City", population: num(c.population),
    isAnchor, cofinanceScore: num(u.cofinance_score), anchorScore: num(u.anchor_score),
    readiness,
    provenance: {
      fiscalHealth: "real:SINIM/FCM (composite_score)",
      governance: "real:SINIM (professionalization + capacity)",
      creditworthiness: "estimated:capacity proxy (no CL municipal rating)",
      legalCapacity: "intake:legal opinion",
    },
    signals: {
      capagRating: null,
      ownSourceRevenuePct: fiscalAutonomy == null ? null : r(fiscalAutonomy),
      debtServiceRatioPct: null, currentBalancePct: null,
      independentAudit: isAnchor, canBorrowWithoutSovereignGuarantee: isAnchor,
    },
    proposal: { title: "Zero-emission urban transport (e-bus + BRT)", sector: "transport", askUSDm: isAnchor ? 8 : 3, stage: "Readiness Review", cofinance: false },
  };
}
const comunas = units.map(toReadiness);

const fundersAll = readCsv("valdivia_funders_open.csv");
const byRole = (role) => fundersAll.filter((f) => f.role === role);
const funders = {
  counts: { applicant: byRole("applicant").length, facilitator: byRole("facilitator").length, referrer: byRole("referrer").length, total: fundersAll.length },
  sample: fundersAll.slice(0, 14).map((f) => ({ program: f.program, funder: f.funder, role: f.role, eligibleActor: f.eligible_actor })),
};

const actions = readCsv("valdivia_action_matches.csv");
const transport = actions.filter((a) => (a.sector || "").toLowerCase().includes("transport"));
const transportGap = {
  nActions: transport.length,
  bestFit: transport[0] ? Number(transport[0].combined) : null,
  bestFunder: transport[0] ? transport[0].best_funder : null,
  actions: transport.map((a) => ({ id: a.action_id, action: a.action, combined: Number(a.combined), verdict: a.verdict })),
};

const bundles = readCsv("unit_bundle_candidates_u11.csv");
const tb = bundles.find((b) => (b.sector || "").toLowerCase().includes("transport")) || bundles[0] || null;
const pool = {
  unitId: 11, anchor: "Valdivia", anchorLocode: "CL ZAL", unitSize: 6,
  members: comunas.map((c) => ({ name: c.name, locode: c.locode, cofinanceScore: c.cofinanceScore, isAnchor: c.isAnchor })),
  bundle: tb ? { sector: tb.sector, coordinationTier: tb.coordination_tier, instrumentClass: tb.instrument_class, actorRoute: tb.actor_route, feasible: tb.bundle_feasible } : null,
  pooledProposal: { title: "Los Ríos zero-emission transport program (6-comuna bundle)", sector: "transport", askUSDm: 30, stage: "Structuring", cofinance: true },
};

const out = {
  generated: "2026-06-12",
  source: "City-Funder Matching Engine (Amanda/Ayinawu/Brian/Cephas) — derived/ CSVs; capacity from SINIM/FCM, locode-keyed",
  heroCity: "Valdivia", heroLocode: "CL ZAL", comunas, funders, transportGap, pool,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log("Wrote", path.relative(process.cwd(), OUT), "—", comunas.length, "comunas");
