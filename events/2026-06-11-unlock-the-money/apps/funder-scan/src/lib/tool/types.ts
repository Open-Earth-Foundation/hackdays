export interface CityRecord {
  id: number;
  name: string;
  country: string;
  region: string;
  flag: string;
  sector: string;
  impact: string;
  risk: string;
  fundingNeed: string;
  population: string;
  co2Reduction: string;
  intro: string;
  why: string;
  political: string;
  credibility: { label: string; value: string; sub: string; color: string }[];
  risks: { label: string; level: number; color: string; note: string }[];
  timeline: { phase: string; desc: string; date: string }[];
  kpis: { label: string; value: string; icon: string }[];
  contacts: { name: string; role: string; email: string; phone: string }[];
  tags: string[];
  tagColors: string[];
}

export interface InstrumentMatch {
  id: number;
  name: string;
  score: number;
  tags: { label: string; variant?: "ppf" | "climate" | "bilateral" | "" }[];
  why: string;
}

export interface ReadinessGap {
  title: string;
  effort: "done" | "med" | "high" | "low";
  done: boolean;
}

export interface WizardState {
  funding: string;
  sectors: string[];
  urgency: string;
  country: string;
  comuna: string;
  locode: string;
  population: string;
  fiscal: string;
  borrowing: string;
  capacity: string;
  climateChecks: string[];
  projectType: string;
  readiness: string;
  cofinance: string;
  mrv: string[];
}

export const defaultWizardState: WizardState = {
  funding: "Grant",
  sectors: ["Waste", "Energy"],
  urgency: "Actively seeking funding now",
  country: "Chile",
  comuna: "Valdivia",
  locode: "CL ZAL",
  population: "Medium (100k–1M)",
  fiscal: "B — Moderate",
  borrowing: "Yes",
  capacity: "Medium — Some capacity",
  climateChecks: ["GHG Inventory (GHGI)", "Climate Risk Assessment"],
  projectType: "Savings-based",
  readiness: "Concept",
  cofinance: "10–30%",
  mrv: ["GHG baseline established"],
};

export interface ChileComuna {
  name: string;
  locode: string;
  region: string;
  population: number | null;
  populationBand: string;
  fcmDependencyPct: number | null;
  cofinanceScore: number | null;
  anchorScore: number | null;
  compositeScore: number | null;
  professionalizationPct?: number | null;
  staffPer1000?: number | null;
  fiscalBand: string;
  capacityBand: string;
  poolStatus?: string;
  unitId?: string;
  isAnchor?: boolean;
  salientSectors: string[];
}

export interface ChileFund {
  id: string;
  program: string;
  family: string;
  funder: string;
  instrumentType: string;
  eligibleActor: string;
  gpcSectors: string[];
  status: string;
  recurrence: string;
  amountClp: number | null;
}

export interface ValdiviaInstrument {
  program: string;
  funder: string;
  sector: string;
  gpcSectors: string[];
  score: number;
  actionCount: number;
  topAction: string;
  instrumentType: string;
}

export interface ValdiviaDetail {
  profile: {
    name: string;
    region: string;
    population: number;
    fcm_dependency_pct: number;
    unit_id: string;
  };
  funders_count: { applicant: number; facilitator: number; referrer: number };
  actions: { total: number; match: number; referrer: number };
  transport: {
    n_actions: number;
    best_af: number;
    best_funder: string;
    best_inst: string;
  };
  pool: {
    comuna: string;
    population: number | null;
    fcm_dependency_pct: number | null;
    cofinance_score: number | null;
    is_anchor: boolean;
  }[];
}
