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

export const nextSteps = [
  { title: "Confirm political commitment", desc: "Letter from mayor's office or equivalent endorsement on record.", effort: "done" as const, done: true },
  { title: "Complete GHG inventory", desc: "GHGI completed and available as evidence for baseline.", effort: "done" as const, done: true },
  { title: "Name a dedicated city team", desc: "At least one named project lead with cross-department coordination authority.", effort: "med" as const, done: false },
  { title: "Draft an MRV plan", desc: "Baseline methodology and monitoring indicators aligned to project outputs.", effort: "med" as const, done: false },
  { title: "Commission a pre-feasibility study", desc: "Cost estimates, risk identification, and a realistic implementation timeline.", effort: "high" as const, done: false },
  { title: "Secure co-financing commitment (>10%)", desc: "National government endorsement or own-budget contribution with letter of intent.", effort: "high" as const, done: false },
  { title: "Submit expression of interest to C40 CFF", desc: "Via C40 city network portal or direct contact with C40 regional team.", effort: "low" as const, done: false },
];
