// In-memory submission store (demo only — resets when the dev server restarts).
// This stands in for the IDB-side Control Tower receiving the handoff object.
// Uses globalThis so it survives Next.js hot-reloads in dev.
export interface Submission {
  id: string;
  candidateId: string;
  kind: "city" | "pool";
  name: string;
  locode: string | null;
  cityId: string | null;
  anchorLocode: string | null;
  members: string[];
  targetProfileId: string;
  compositeReadiness: number;
  tier: string;
  clearancePassed: boolean;
  proposal: { title: string; askUSDm: number; sector: string };
  provenance: Record<string, string>;
  submittedAt: string;
}

const g = globalThis as unknown as { __CRN_SUBMISSIONS__?: Submission[] };
if (!g.__CRN_SUBMISSIONS__) g.__CRN_SUBMISSIONS__ = [];
export const submissions: Submission[] = g.__CRN_SUBMISSIONS__;
