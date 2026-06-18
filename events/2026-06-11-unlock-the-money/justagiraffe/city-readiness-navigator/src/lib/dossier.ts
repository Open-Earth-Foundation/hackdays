// Candidate dossier = the machine-readable handoff into a funder's intake.
// It extends the project Concept Note (plan + actions) with the entity
// creditworthiness, the instrument, the pool, and the due-diligence checklist —
// one document a funder (IDB Control Tower) can intake.
import { SM, PILLAR_ORDER, type Scored } from "./engine";
import { getCityContext } from "./context";

export interface Dossier {
  id: string;
  submittedAt: string;
  candidateId: string;
  kind: "city" | "pool";
  name: string;
  locode: string | null;
  cityId: string | null;
  country: string;
  pathway: "instrument" | "pool" | "capacity-building";
  targetProfileId: string;
  instrument: { funder: string; name: string };
  conceptNote: { title: string; sector: string; askUSDm: number; actions: { name: string; type: string }[]; summary: string };
  readiness: { composite: number; tier: string; cleared: boolean; pillars: { key: string; label: string; score: number; provenance: string }[] };
  pool: { anchor: string; members: { name: string; role: string; cofinance: number | null }[] } | null;
  dueDiligence: { label: string; done: boolean }[];
  financials: { askUSDm: number; cofinance: boolean };
  provenanceNote: string;
}

export interface AssembleOpts {
  scored: Scored;
  kind: "city" | "pool";
  pathway: "instrument" | "pool" | "capacity-building";
  instrumentName?: string;
  pool?: { anchor: string; members: { name: string; role: string; cofinance: number | null }[] } | null;
  proposal: { title: string; sector: string; askUSDm: number; cofinance: boolean };
}

export function assembleDossier(o: AssembleOpts): Omit<Dossier, "id" | "submittedAt"> {
  const s = o.scored;
  const profile = SM.activeProfile();
  const ctx = getCityContext(s.id);
  const pillars = SM.explainScore(s.readiness).map((e) => ({
    key: e.key, label: e.label, score: s.readiness[e.key], provenance: (s.provenance as any)[e.key],
  }));
  void PILLAR_ORDER;
  return {
    candidateId: o.kind === "pool" ? `POOL-${s.id}` : s.id,
    kind: o.kind,
    name: o.kind === "pool" ? `${s.name} pool (anchor)` : s.name,
    locode: s.locode, cityId: s.cityId, country: s.country,
    pathway: o.pathway,
    targetProfileId: profile.id,
    instrument: { funder: profile.funder, name: o.instrumentName || profile.instrument },
    conceptNote: {
      title: o.proposal.title, sector: o.proposal.sector, askUSDm: o.proposal.askUSDm,
      actions: (ctx?.hiap || []).map((a) => ({ name: a.name, type: a.type })),
      summary: `Plan derived from ${s.name}'s CityCatalyst HIAP priorities; ${ctx?.hiap.length || 0} prioritized actions.`,
    },
    readiness: { composite: s.compositeReadiness, tier: s.tier, cleared: s.canEnterProjectReview, pillars },
    pool: o.pool || null,
    dueDiligence: SM.intakeChecklist(s),
    financials: { askUSDm: o.proposal.askUSDm, cofinance: o.proposal.cofinance },
    provenanceNote: "Fiscal pillars from real national data (CAPAG · SINIM/FCM), locode-keyed. Screening signal, not a credit decision.",
  };
}
