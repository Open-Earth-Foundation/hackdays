// In-memory dossier store (demo only — resets when the dev server restarts).
// Stands in for the IDB-side Control Tower receiving the candidate dossier.
import type { Dossier } from "./dossier";

export type { Dossier };

const g = globalThis as unknown as { __CRN_DOSSIERS__?: Dossier[] };
if (!g.__CRN_DOSSIERS__) g.__CRN_DOSSIERS__ = [];
export const dossiers: Dossier[] = g.__CRN_DOSSIERS__;
