// Catalytic-leverage classification — "a small, specific fix that unlocks far larger capital".
// 100% computed from CAPAG sub-indicators + n.d. blocker flags we already have. No modeling.

export type LeverageInput = {
  capag: string;
  debt: string; // nota1 grade
  savings: string; // nota2 grade
  liquidity: string; // nota3 grade
  icf: string;
  dcaMissing: boolean;
  rgfMissing: boolean;
  rreoMissing: boolean;
  dedNeg: boolean;
  dcbNeg: boolean;
  ofNeg: boolean;
};

export type Leverage = {
  kind: "graduation" | "nd_fix" | "icf_gate";
  rank: number; // higher = more catalytic, for "sort by leverage"
  blockers: string[]; // i18n suffix codes describing the specific fix(es)
};

export function computeLeverage(c: LeverageInput): Leverage | null {
  // 1. Graduation candidate: CAPAG C, debt healthy (A/B), blocked only by savings/liquidity.
  //    The highest-leverage case — a fiscal-management fix unlocks guaranteed credit.
  if (c.capag === "C" && (c.debt === "A" || c.debt === "B")) {
    const blockers: string[] = [];
    if (c.savings === "C") blockers.push("savings");
    if (c.liquidity === "C") blockers.push("liquidity");
    if (blockers.length > 0) {
      return { kind: "graduation", rank: 100 - blockers.length * 5, blockers };
    }
  }

  // 2. n.d. one-fix-away: unrated, blocked by specific Siconfi data gaps. Fewer gaps = higher rank.
  if (c.capag === "n.d." || c.capag === "n.e.") {
    const blockers: string[] = [];
    if (c.dcaMissing) blockers.push("dca");
    if (c.rgfMissing) blockers.push("rgf");
    if (c.rreoMissing) blockers.push("rreo");
    if (c.dedNeg) blockers.push("ded");
    if (c.dcbNeg) blockers.push("dcb");
    if (c.ofNeg) blockers.push("of");
    if (blockers.length > 0) {
      return { kind: "nd_fix", rank: (blockers.length === 1 ? 80 : 60) - blockers.length, blockers };
    }
  }

  // 3. ICF-gated: ineligible for Union guarantees on accounting quality alone, regardless of fiscals.
  if (c.icf === "Dicf" || c.icf === "Eicf") {
    return { kind: "icf_gate", rank: 40, blockers: ["icf"] };
  }

  return null;
}
