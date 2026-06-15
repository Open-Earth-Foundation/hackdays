// Funder-language instrument tiers — maps a CAPAG rating to the financing channel that fits.
// Used for the table column and as the wizard's "instrument mandate" filter (reverse lookup).

export type InstrumentGroup = "credit" | "blended" | "grant_ta" | "distressed";

export function instrumentGroup(capag: string): InstrumentGroup {
  if (["A+", "A", "B+", "B"].includes(capag)) return "credit";
  if (capag === "C") return "blended";
  if (capag === "D") return "distressed";
  return "grant_ta"; // n.d. / n.e.
}

// i18n key suffix for the short label shown in the table column
export const INSTRUMENT_LABEL_KEY: Record<InstrumentGroup, string> = {
  credit: "instr.credit",
  blended: "instr.blended",
  grant_ta: "instr.grant_ta",
  distressed: "instr.distressed",
};
