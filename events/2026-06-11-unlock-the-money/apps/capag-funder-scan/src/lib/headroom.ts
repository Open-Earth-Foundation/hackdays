// Real credit-headroom math from extracted RCL + Dívida Consolidada (BRL).
// LRF municipal consolidated-debt ceiling = 1.2 × RCL (Resolução SF 40/2001).
import { instrumentGroup } from "./instrument";
import type { Leverage } from "./leverage";

const LRF_CEILING = 1.2;

export function headroom(rcl: number | null, dc: number | null): number | null {
  if (rcl == null || dc == null) return null;
  return Math.max(0, LRF_CEILING * rcl - dc);
}

// How much guaranteed credit a fix/headroom would make deployable for this city.
// Bankable cities can absorb more now; graduation/ICF/n.d.-fix cities unlock their headroom
// once the specific blocker is cleared. Plain-C and distressed cities have no credit channel → 0.
export function unlock(
  capag: string,
  leverage: Leverage | null,
  head: number | null,
): number {
  if (head == null) return 0;
  const group = instrumentGroup(capag);
  if (group === "credit") return head;
  if (leverage && (leverage.kind === "graduation" || leverage.kind === "nd_fix" || leverage.kind === "icf_gate")) {
    return head;
  }
  return 0;
}

// compact BRL formatter (data is in reais)
export function fmtBrl(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1e9) return `R$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `R$${(v / 1e6).toFixed(0)}M`;
  if (v >= 1e3) return `R$${(v / 1e3).toFixed(0)}k`;
  return `R$${Math.round(v)}`;
}
