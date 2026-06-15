import type {
  ChileComuna,
  ChileFund,
  InstrumentMatch,
  ReadinessGap,
  ValdiviaInstrument,
  WizardState,
} from "./types";

const WIZARD_TO_GPC: Record<string, string[]> = {
  Waste: ["waste"],
  Transport: ["transportation"],
  Energy: ["stationary_energy"],
  "Nature-based solutions": ["afolu", "water"],
  AFOLU: ["afolu"],
  IPPU: ["ippu"],
  Buildings: ["stationary_energy", "cross_sector"],
  "Cross-cutting": ["cross_sector"],
};

const GPC_LABELS: Record<string, string> = {
  waste: "Waste",
  transportation: "Transport",
  stationary_energy: "Energy",
  afolu: "AFOLU",
  ippu: "IPPU",
  water: "Water",
  cross_sector: "Cross-cutting",
};

const FUNDING_TO_INST: Record<string, string[]> = {
  Grant: ["grant"],
  "Technical assistance": ["technical assistance", "ta"],
  "Concessional loan": ["concessional loan", "loan"],
  "Blended finance": ["blended finance", "blended"],
  "Not sure yet": ["grant", "technical assistance", "ta", "concessional loan"],
};

function wizardGpcSectors(wizard: WizardState): Set<string> {
  const out = new Set<string>();
  for (const s of wizard.sectors) {
    for (const g of WIZARD_TO_GPC[s] ?? []) out.add(g);
  }
  return out;
}

function sectorOverlap(a: string[], b: Set<string>): number {
  if (!a.length || !b.size) return 0;
  const hits = a.filter((s) => b.has(s) || s === "cross_sector").length;
  return hits / Math.max(a.length, 1);
}

function instrumentFit(wizard: WizardState, inst: string): number {
  const want = FUNDING_TO_INST[wizard.funding] ?? FUNDING_TO_INST["Not sure yet"];
  const t = inst.toLowerCase();
  if (want.some((w) => t.includes(w))) return 1;
  if (wizard.funding === "Not sure yet") return 0.6;
  return 0.25;
}

function readinessFit(wizard: WizardState, inst: string): number {
  const stage = wizard.readiness;
  const t = inst.toLowerCase();
  if (t.includes("loan") || t.includes("blended")) {
    if (stage === "Feasibility") return 1;
    if (stage === "Pre-feasibility") return 0.7;
    return 0.35;
  }
  if (stage === "Idea") return 0.5;
  return 0.85;
}

function tagForInstrument(inst: string): { label: string; variant?: "ppf" | "climate" | "bilateral" | "" } {
  const t = inst.toLowerCase();
  if (t.includes("loan")) return { label: "Loan", variant: "" };
  if (t.includes("ta") || t.includes("technical")) return { label: "TA", variant: "" };
  return { label: "Grant", variant: "" };
}

function sectorTags(sectors: string[]): { label: string; variant?: "" }[] {
  return [...new Set(sectors.map((s) => GPC_LABELS[s] ?? s))].slice(0, 2).map((label) => ({ label }));
}

function buildWhy(
  program: string,
  wizard: WizardState,
  comuna: ChileComuna | undefined,
  sectorScore: number,
  engine: "valdivia" | "heuristic",
  topAction?: string,
): string {
  const city = comuna?.name ?? wizard.comuna ?? "your comuna";
  const sectors = wizard.sectors.slice(0, 2).join(" and ") || "your sectors";
  if (engine === "valdivia" && topAction) {
    return `${city} engine match: ${program} scores highly for ${sectors} actions (e.g. ${topAction}…). Municipality is applicant on this Chilean instrument.`;
  }
  const pool = comuna?.poolStatus === "anchor" ? "anchor comuna in a viable pool" : "comuna profile";
  return `Sector overlap (${Math.round(sectorScore * 100)}%) with ${sectors}, ${wizard.readiness.toLowerCase()} readiness, and ${pool} align with ${program}.`;
}

function valdiviaToMatch(
  row: ValdiviaInstrument,
  i: number,
  wizard: WizardState,
  comuna: ChileComuna | undefined,
): InstrumentMatch {
  const sectors = row.gpcSectors.length ? row.gpcSectors : [row.sector];
  return {
    id: i,
    name: row.program,
    score: Math.min(100, row.score),
    tags: [tagForInstrument(row.instrumentType), ...sectorTags(sectors)],
    why: buildWhy(row.program, wizard, comuna, 1, "valdivia", row.topAction),
  };
}

function scoreFund(
  fund: ChileFund,
  wizard: WizardState,
  comuna: ChileComuna | undefined,
  gpc: Set<string>,
): number {
  const sec = sectorOverlap(fund.gpcSectors, gpc);
  const salient = comuna?.salientSectors ?? [];
  const localBoost = salient.some((s) => fund.gpcSectors.includes(s)) ? 0.15 : 0;
  const inst = instrumentFit(wizard, fund.instrumentType);
  const ready = readinessFit(wizard, fund.instrumentType);
  const cap = comuna?.compositeScore ?? 25;
  const capNorm = Math.min(1, cap / 50);
  const fiscal = wizard.fiscal.startsWith("A") ? 1 : wizard.fiscal.startsWith("B") ? 0.75 : 0.5;

  const raw =
    sec * 0.35 + localBoost + inst * 0.2 + ready * 0.2 + capNorm * 0.1 + fiscal * 0.1;
  return Math.round(Math.min(100, Math.max(35, raw * 100)));
}

function fundToMatch(
  fund: ChileFund,
  score: number,
  i: number,
  wizard: WizardState,
  comuna: ChileComuna | undefined,
  gpc: Set<string>,
): InstrumentMatch {
  const sec = sectorOverlap(fund.gpcSectors, gpc);
  return {
    id: i,
    name: fund.program,
    score,
    tags: [tagForInstrument(fund.instrumentType), ...sectorTags(fund.gpcSectors)],
    why: buildWhy(fund.program, wizard, comuna, sec, "heuristic"),
  };
}

export function matchCity(
  wizard: WizardState,
  comuna: ChileComuna | undefined,
  funds: ChileFund[],
  valdivia: ValdiviaInstrument[],
): InstrumentMatch[] {
  const isValdivia = wizard.locode === "CL ZAL" || wizard.comuna === "Valdivia";

  if (isValdivia && valdivia.length) {
    const filtered = valdivia.filter((v) => {
      const gpc = wizardGpcSectors(wizard);
      if (!gpc.size) return true;
      const sectors = v.gpcSectors.length ? v.gpcSectors : [v.sector];
      return sectors.some((s) => gpc.has(s) || s === "cross_sector");
    });
    const rows = (filtered.length ? filtered : valdivia).slice(0, 8);
    return rows.map((r, i) => valdiviaToMatch(r, i, wizard, comuna));
  }

  const gpc = wizardGpcSectors(wizard);
  const scored = funds
    .map((f) => ({ fund: f, score: scoreFund(f, wizard, comuna, gpc) }))
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const out: InstrumentMatch[] = [];
  for (const { fund, score } of scored) {
    const key = fund.family || fund.program;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(fundToMatch(fund, score, out.length, wizard, comuna, gpc));
    if (out.length >= 8) break;
  }
  return out;
}

export function buildReadinessGaps(wizard: WizardState, comuna?: ChileComuna): ReadinessGap[] {
  const hasGhgi = wizard.climateChecks.includes("GHG Inventory (GHGI)");
  const hasPlan = wizard.climateChecks.includes("Climate action list or plan exists");
  const hasRisk = wizard.climateChecks.includes("Climate Risk Assessment");
  const hasMrvPlan = wizard.mrv.includes("Monitoring plan drafted");
  const hasMrvVerify = wizard.mrv.includes("Third-party verification ready");
  const preFeas =
    wizard.readiness === "Pre-feasibility" || wizard.readiness === "Feasibility";
  const cofinanceOk =
    wizard.cofinance !== "None" ||
    (comuna?.cofinanceScore != null && comuna.cofinanceScore >= 25);
  const teamOk = wizard.capacity.startsWith("High");

  return [
    { title: "GHG inventory completed", effort: "done", done: hasGhgi },
    { title: "Climate risk assessment", effort: hasRisk ? "done" : "med", done: hasRisk },
    { title: "Climate action plan on file", effort: hasPlan ? "done" : "med", done: hasPlan },
    { title: "MRV plan drafted", effort: "med", done: hasMrvPlan },
    { title: "Third-party MRV ready", effort: "high", done: hasMrvVerify },
    { title: "Pre-feasibility study", effort: "high", done: preFeas },
    {
      title: "Co-financing capacity (comuna fiscal score)",
      effort: cofinanceOk ? "done" : "high",
      done: cofinanceOk,
    },
    { title: "Dedicated municipal climate team", effort: "med", done: teamOk },
  ];
}
