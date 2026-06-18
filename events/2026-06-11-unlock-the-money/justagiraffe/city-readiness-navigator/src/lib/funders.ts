// Funder sourcing catalog — the 3-level hierarchy a city drills through to find a
// financing line: FUNDER (bank) → PROGRAM → INSTRUMENT. Readiness is assessed at the
// program level (it carries the readiness profile); the instrument is the specific
// product. In the integrated architecture this becomes a converged "funder sourcing
// service" (today fragmented across CityCatalyst + the hackday apps). Mock for now.

export interface Instrument { id: string; name: string; kind: "loan" | "guarantee" | "TC" | "grant"; note?: string }
export interface Program {
  id: string;
  name: string;
  summary: string;
  profileId: string;          // → readiness profile in readiness-profiles.js
  eligibilityNote?: string;
  instruments: Instrument[];
}
export interface Funder { id: string; name: string; short: string; template?: boolean; programs: Program[] }

export const FUNDERS: Funder[] = [
  {
    id: "idb", name: "Inter-American Development Bank", short: "IDB",
    programs: [
      {
        id: "idb-sfp", name: "Sub-Sovereign Finance Program (SFP)", profileId: "idb-sfp",
        summary: "A 5-year program lending directly to subnational governments without a sovereign guarantee.",
        eligibilityNote: "You may be eligible for a direct line from the IDB. Assess readiness against this program's instruments.",
        instruments: [
          { id: "sfp-loan", name: "Investment loan · Subprogram 1", kind: "loan", note: "no sovereign guarantee · market-based pricing" },
          { id: "sfp-guarantee", name: "Investment guarantee · Subprogram 1", kind: "guarantee", note: "credit enhancement, no sovereign counter-guarantee" },
          { id: "sfp-tc", name: "Technical cooperation · Subprogram 2", kind: "TC", note: "readiness support (~US$13M envelope)" },
        ],
      },
    ],
  },
  {
    id: "caf", name: "CAF — Development Bank of Latin America & the Caribbean", short: "CAF", template: true,
    programs: [{ id: "caf-sub", name: "Subnational lending (template)", profileId: "generic-mdb-template", summary: "Illustrative — plug in CAF's real program & criteria.", instruments: [{ id: "caf-loan", name: "Sub-national loan", kind: "loan" }] }],
  },
  {
    id: "wb", name: "World Bank", short: "World Bank", template: true,
    programs: [{ id: "wb-sub", name: "Subnational program (template)", profileId: "generic-mdb-template", summary: "Illustrative.", instruments: [{ id: "wb-loan", name: "Sub-national loan", kind: "loan" }] }],
  },
  {
    id: "gcf", name: "Green Climate Fund", short: "GCF", template: true,
    programs: [{ id: "gcf-da", name: "Direct access (template)", profileId: "generic-mdb-template", summary: "Illustrative.", instruments: [{ id: "gcf-grant", name: "Grant / concessional", kind: "grant" }] }],
  },
];

export function getFunder(id: string | null) { return FUNDERS.find((f) => f.id === id) || null; }
