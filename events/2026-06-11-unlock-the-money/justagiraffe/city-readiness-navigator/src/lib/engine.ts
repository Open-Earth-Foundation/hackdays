// Thin typed wrapper around the vendored Readiness Engine (control-tower).
// Importing readiness-profiles first registers the profile registry; scoring.js
// reads it. The engine is the SAME code as justagiraffe/control-tower — vendored
// here for the standalone app; the eventual home is a shared package.
import "./readiness/readiness-profiles.js";
import ScoringModel from "./readiness/scoring.js";
import ProfilesMod from "./readiness/readiness-profiles.js";

export const SM = ScoringModel as ScoringModelType;
export const Profiles = ProfilesMod as ProfilesType;

export type Pillar = "creditworthiness" | "fiscalHealth" | "legalCapacity" | "governance";

export interface Comuna {
  id: string;
  name: string;
  locode: string | null;
  cityId: string | null;
  country: string;
  iso: string;
  type: string;
  population: number | null;
  isAnchor: boolean;
  cofinanceScore: number | null;
  anchorScore: number | null;
  readiness: Record<Pillar, number>;
  provenance: Record<Pillar, string>;
  signals: {
    capagRating: string | null;
    ownSourceRevenuePct: number | null;
    debtServiceRatioPct: number | null;
    currentBalancePct: number | null;
    independentAudit: boolean;
    canBorrowWithoutSovereignGuarantee: boolean;
  };
  proposal: { title: string; sector: string; askUSDm: number; stage: string; cofinance: boolean };
}

export interface Scored extends Comuna {
  compositeReadiness: number;
  tier: "Ready" | "Developing" | "Early";
  readinessAction: string;
  eligibility: Record<string, boolean> & { eligible: boolean };
  canEnterProjectReview: boolean;
}

interface ScoringModelType {
  scoreSNG: (c: any) => Scored;
  explainScore: (r: any) => { key: Pillar; label: string; score: number; weight: number; points: number }[];
  intakeChecklist: (c: any) => { key: string; label: string; done: boolean }[];
  readinessClearanceBlockers: (c: any) => string[];
  eligibilityCheck: (c: any) => Record<string, boolean> & { eligible: boolean };
  activeProfile: () => any;
  setActiveProfile: (id: string) => any;
  PILLAR_LABELS: Record<string, string>;
  READINESS_WEIGHTS: Record<string, number>;
}
interface ProfilesType {
  listProfiles: () => { id: string; funder: string; instrument: string; illustrative: boolean }[];
  getProfile: (id: string) => any;
}

export const PILLAR_ORDER: Pillar[] = ["creditworthiness", "fiscalHealth", "legalCapacity", "governance"];

export function provenanceKind(p: string): "real" | "estimated" | "intake" {
  if (p.startsWith("real")) return "real";
  if (p.startsWith("intake")) return "intake";
  return "estimated";
}
