import type { InstrumentMatch, ReadinessGap } from "./types";

export const instrumentMatches: InstrumentMatch[] = [
  {
    id: 0,
    name: "C40 Cities Finance Facility",
    score: 87,
    tags: [
      { label: "PPF", variant: "ppf" },
      { label: "Waste", variant: "" },
      { label: "Energy", variant: "" },
      { label: "Grant / TA", variant: "" },
    ],
    why: "Your city has a completed GHGI and is at concept stage — C40 CFF is designed for cities at exactly this readiness level. The savings-based project type aligns with their conversion-to-bankability focus.",
  },
  {
    id: 1,
    name: "Green Climate Fund — Readiness Programme",
    score: 71,
    tags: [
      { label: "Climate fund", variant: "climate" },
      { label: "Waste", variant: "" },
      { label: "Grant", variant: "" },
    ],
    why: "GCF Readiness grants support cities in building MRV capacity — a gap you currently have. Score is limited because cities cannot apply directly; an accredited entity must apply on your behalf.",
  },
  {
    id: 2,
    name: "GIZ — Urban Climate Programme",
    score: 58,
    tags: [
      { label: "Bilateral", variant: "bilateral" },
      { label: "Buildings", variant: "" },
      { label: "TA", variant: "" },
    ],
    why: "Sector and geography align well. Score is limited by unclear outcomes definition and the absence of an MRV plan — both are fixable before applying.",
  },
];

export const readinessGaps: ReadinessGap[] = [
  { title: "GHG inventory completed", effort: "done", done: true },
  { title: "Political commitment confirmed", effort: "done", done: true },
  { title: "MRV plan drafted", effort: "med", done: false },
  { title: "Dedicated city team named", effort: "med", done: false },
  { title: "Pre-feasibility study", effort: "high", done: false },
  { title: "Co-financing confirmed (>10%)", effort: "high", done: false },
  { title: "Procurement plan in place", effort: "high", done: false },
];
