// Rule-based financing-instrument recommendation.
// Transparent by design: every rule shows its reasoning to the funder.
// CAPAG is an indicative screening signal — this is prioritization, not a credit decision.

export type Recommendation = {
  instrument: string;
  reasoning: string[];
};

const BANKABLE = new Set(["A+", "A", "B+", "B"]);

export function recommend(
  capag: string,
  icf: string,
  topHazard: { hazard: string; score: number } | null
): Recommendation {
  const highRisk = topHazard != null && topHazard.score >= 0.5;
  const riskNote = topHazard
    ? `top climate risk: ${topHazard.hazard} (${(topHazard.score * 100).toFixed(0)}/100)`
    : "no CCRA risk data";

  if (capag === "n.d." || capag === "n.e.") {
    return {
      instrument: "Technical assistance first",
      reasoning: [
        "Treasury does not rate this municipality — its Siconfi fiscal reporting is missing or inconsistent",
        "Until reporting is fixed, the city is invisible to credit markets and most funders",
        "TA on fiscal data quality unlocks every other instrument",
        riskNote,
      ],
    };
  }

  if (capag === "D") {
    return {
      instrument: "Grant-only + fiscal recovery program",
      reasoning: [
        "Bottom rating: no credit channel is realistic in the near term",
        "Pair non-repayable climate funding with fiscal recovery support",
        riskNote,
      ],
    };
  }

  if (capag === "C") {
    return highRisk
      ? {
          instrument: "Climate Bridge Grant / blended finance",
          reasoning: [
            "CAPAG C blocks federally guaranteed credit",
            `High climate need (${riskNote}) — waiting for fiscal improvement is not an option`,
            "Blend grants with concessional capital; tie disbursement to verified delivery",
          ],
        }
      : {
          instrument: "Results-based finance pilot",
          reasoning: [
            "CAPAG C blocks federally guaranteed credit",
            `Moderate climate risk (${riskNote}) — time to structure pay-for-performance`,
            "Optionally pair with CAPAG-improvement TA so the city graduates to credit",
          ],
        };
  }

  // bankable tiers
  const topAccounting = icf === "Aicf";
  if (BANKABLE.has(capag)) {
    return highRisk
      ? {
          instrument: "Guaranteed credit line for adaptation",
          reasoning: [
            `CAPAG ${capag}: eligible for credit with federal guarantee`,
            `High climate need (${riskNote}) — adaptation projects are urgent and financeable`,
            topAccounting
              ? "Aicf accounting quality: lowest transaction cost, fastest structuring"
              : "Standard due diligence applies",
          ],
        }
      : {
          instrument: "Traditional credit line / project preparation",
          reasoning: [
            `CAPAG ${capag}: eligible for credit with federal guarantee`,
            `Lower climate urgency (${riskNote}) — focus on mitigation pipeline and project prep`,
            topAccounting
              ? "Aicf accounting quality: strong green-bond candidate"
              : "Standard due diligence applies",
          ],
        };
  }

  return {
    instrument: "Manual review",
    reasoning: [`Unrecognized rating "${capag}"`, riskNote],
  };
}
