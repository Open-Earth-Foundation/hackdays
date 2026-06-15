// Brazil Fiscal Data Adapter — transforms CAPAG (Tesouro Nacional) into readiness
// inputs. Reads vendored RS source (data/source/), emits src/data/brazil.json:
// a state map (RS municipalities by CAPAG tier) + Canoas hero detail.
// Run: npm run build:brazil
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "data", "source");
const OUT = path.join(__dirname, "..", "src", "data", "brazil.json");

const recs = JSON.parse(fs.readFileSync(path.join(SRC, "capag_rs.json"), "utf8"));
const cen = JSON.parse(fs.readFileSync(path.join(SRC, "centroids_rs.json"), "utf8"));
const r = Math.round;

// CAPAG rating → 0-100 (A+ best). Real Treasury creditworthiness.
const CAPAG_SCORE = { "A+": 92, A: 82, "B+": 74, B: 64, C: 38, D: 18 };
const NOTA = { A: 85, B: 60, C: 35 };               // the 3 fiscal indicators
const ICF = { Aicf: 90, Bicf: 70, Cicf: 45, Dicf: 20, Eicf: 15 };
const BANKABLE = new Set(["A+", "A", "B+", "B"]);    // eligible for Union-guaranteed credit

function tierOf(capag) {
  if (BANKABLE.has(capag)) return "bankable";
  if (capag === "C" || capag === "D") return "constrained";
  return "unrated"; // n.d. / n.e. / null
}

// CAPAG → the four readiness pillars (the Brazil adapter).
function toReadiness(rec) {
  const credit = CAPAG_SCORE[rec.capag] ?? null;
  const notas = [rec.nota1, rec.nota2, rec.nota3].map((n) => NOTA[n]).filter((x) => x != null);
  const fiscal = notas.length ? r(notas.reduce((a, b) => a + b, 0) / notas.length) : null;
  const icf = ICF[rec.icf] ?? 40;
  const transparency = rec.publicou_rgf === "Sim" && rec.publicou_rreo === "Sim" ? 5 : 0;
  return {
    creditworthiness: credit ?? 30,
    fiscalHealth: fiscal ?? 40,
    governance: Math.min(100, icf + transparency),
    legalCapacity: BANKABLE.has(rec.capag) ? 75 : 38,
  };
}

const heroName = "Canoas";
const heroRec = recs.find((x) => x.municipio === heroName);

// State map: every RS municipality with a centroid, by CAPAG tier.
const stateMap = recs
  .filter((x) => cen[String(x.cod_ibge)])
  .map((x) => {
    const [lat, lon] = cen[String(x.cod_ibge)];
    return { name: x.municipio, codIbge: String(x.cod_ibge), capag: x.capag, tier: tierOf(x.capag), lat, lon, isHero: x.municipio === heroName };
  });

// Hero detail (same SNG record shape the engine scores).
const readiness = toReadiness(heroRec);
const hero = {
  id: `SNG-BR-${heroRec.cod_ibge}`,
  name: heroName, locode: `IBGE ${heroRec.cod_ibge}`, cityId: heroRec.cod_ibge,
  country: "Brazil", iso: "BR", type: "City", population: 347000,
  isAnchor: false, cofinanceScore: null, anchorScore: null,
  readiness,
  provenance: {
    creditworthiness: `real:CAPAG rating ${heroRec.capag} (Tesouro Nacional)`,
    fiscalHealth: `real:CAPAG indicators (debt ${heroRec.nota1} · savings ${heroRec.nota2} · liquidity ${heroRec.nota3})`,
    governance: `real:CAPAG ICF ${heroRec.icf} + transparency (RGF/RREO)`,
    legalCapacity: `real:CAPAG ${heroRec.capag} — ${BANKABLE.has(heroRec.capag) ? "eligible for" : "blocked from"} Union-guaranteed credit`,
  },
  signals: {
    capagRating: heroRec.capag,
    ownSourceRevenuePct: null, debtServiceRatioPct: null, currentBalancePct: null,
    independentAudit: ["Aicf", "Bicf"].includes(heroRec.icf),
    canBorrowWithoutSovereignGuarantee: BANKABLE.has(heroRec.capag),
  },
  capag: { rating: heroRec.capag, ind1: heroRec.ind1_endividamento, nota1: heroRec.nota1, ind2: heroRec.ind2_poupanca, nota2: heroRec.nota2, ind3: heroRec.ind3_liquidez, nota3: heroRec.nota3, icf: heroRec.icf },
  proposal: { title: "Flood resilience & drainage program (post-2024)", sector: "water / resilience", askUSDm: 45, stage: "Readiness Review", cofinance: false },
};

const out = {
  generated: "2026-06-14",
  source: "CAPAG — Tesouro Nacional (ODbL), via the CAPAG Funder Scan hackday team (Joaquin van Peborgh, Carole Viaene). Screening signal, not a credit decision.",
  scope: { country: "Brazil", region: "Rio Grande do Sul (RS)", note: "state hit by the catastrophic 2024 floods" },
  hero, stateMap,
  legend: [
    { tier: "bankable", label: "CAPAG A/B — bankable (guaranteed credit)", count: stateMap.filter((c) => c.tier === "bankable").length },
    { tier: "constrained", label: "CAPAG C/D — creditless (grants / blended)", count: stateMap.filter((c) => c.tier === "constrained").length },
    { tier: "unrated", label: "n.d. — unrated (TA first)", count: stateMap.filter((c) => c.tier === "unrated").length },
  ],
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log("Wrote brazil.json — hero", heroName, JSON.stringify(readiness), "· map", stateMap.length, "munis");
console.log("legend:", out.legend.map((l) => `${l.tier}=${l.count}`).join(" "));
