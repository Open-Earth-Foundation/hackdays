// Rule-based financing-instrument recommendation.
// Returns i18n keys + interpolation vars (not prose) so the panel renders EN/PT via t().
// CAPAG is an indicative screening signal — this is prioritization, not a credit decision.

type Line = { key: string; vars?: Record<string, string> };

export type Recommendation = {
  instrumentKey: string;
  reasoning: Line[];
};

const BANKABLE = new Set(["A+", "A", "B+", "B"]);

// hazard label is itself an i18n key (hazard.<key>); the panel resolves it before interpolating.
function riskNoteLine(topHazard: { hazard: string; score: number } | null): Line {
  return topHazard
    ? { key: "rec.riskNote", vars: { hazard: `hazard.${topHazard.hazard}`, score: String(Math.round(topHazard.score * 100)) } }
    : { key: "rec.noRisk" };
}

export function recommend(
  capag: string,
  icf: string,
  topHazard: { hazard: string; score: number } | null
): Recommendation {
  const highRisk = topHazard != null && topHazard.score >= 0.5;
  const risk = riskNoteLine(topHazard);

  if (capag === "n.d." || capag === "n.e.") {
    return {
      instrumentKey: "rec.nd.instrument",
      reasoning: [{ key: "rec.nd.r1" }, { key: "rec.nd.r2" }, { key: "rec.nd.r3" }, risk],
    };
  }

  if (capag === "D") {
    return {
      instrumentKey: "rec.d.instrument",
      reasoning: [{ key: "rec.d.r1" }, { key: "rec.d.r2" }, risk],
    };
  }

  if (capag === "C") {
    return highRisk
      ? {
          instrumentKey: "rec.c_high.instrument",
          reasoning: [{ key: "rec.c_high.r1" }, { key: "rec.c_high.r2" }, risk, { key: "rec.c_high.r3" }],
        }
      : {
          instrumentKey: "rec.c_low.instrument",
          reasoning: [{ key: "rec.c_low.r1" }, { key: "rec.c_low.r2" }, risk, { key: "rec.c_low.r3" }],
        };
  }

  if (BANKABLE.has(capag)) {
    const icfLine: Line = { key: icf === "Aicf" ? (highRisk ? "rec.icf.top" : "rec.icf.bond") : "rec.icf.standard" };
    return highRisk
      ? {
          instrumentKey: "rec.bank_high.instrument",
          reasoning: [{ key: "rec.bank_high.r1", vars: { capag } }, { key: "rec.bank_high.r2" }, risk, icfLine],
        }
      : {
          instrumentKey: "rec.bank_low.instrument",
          reasoning: [{ key: "rec.bank_low.r1", vars: { capag } }, { key: "rec.bank_low.r2" }, risk, icfLine],
        };
  }

  return { instrumentKey: "rec.bank_low.instrument", reasoning: [risk] };
}
