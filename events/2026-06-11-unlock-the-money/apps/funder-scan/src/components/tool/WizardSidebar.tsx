"use client";

import { useTool } from "@/lib/tool/tool-context";

type Step = 1 | 2 | 3;

const STEPS: { n: Step; title: string; defaultSub: string }[] = [
  { n: 1, title: "Funding needs", defaultSub: "Type, sector, urgency" },
  { n: 2, title: "City profile", defaultSub: "Location, fiscal health, capacity" },
  { n: 3, title: "Project details", defaultSub: "Type, readiness, co-finance" },
];

const WHY_COPY: Partial<Record<Step, { label: string; text: string }>> = {
  1: {
    label: "Why we ask",
    text: "These filters narrow the instrument list before you invest time in a full profile. You can skip straight to matches if you prefer.",
  },
  2: {
    label: "What this unlocks",
    text: "Fiscal tier and borrowing authority determine whether concessional loans are realistic. Climate data maturity affects grant and TA eligibility.",
  },
  3: {
    label: "About readiness stages",
    text: "Most instruments need at least a concept-stage project. A feasibility study opens concessional loans and blended finance.",
  },
};

export function WizardMobileProgress({ current }: { current: Step }) {
  return (
    <div className="wizard-mobile-progress" aria-label={`Step ${current} of 3`}>
      {STEPS.map((s) => (
        <div
          key={s.n}
          className={`wizard-mobile-step${current === s.n ? " active" : ""}${current > s.n ? " done" : ""}`}
        >
          <span className="wizard-mobile-num">{current > s.n ? <i className="ti ti-check" /> : s.n}</span>
          <span className="wizard-mobile-label">{s.title}</span>
        </div>
      ))}
    </div>
  );
}

export function WizardSidebar({ current }: { current: Step }) {
  const { step1Summary, step2Summary } = useTool();

  const subFor = (s: (typeof STEPS)[number]) => {
    if (s.n === 1 && current > 1) return step1Summary;
    if (s.n === 2 && current > 2) return step2Summary;
    return s.defaultSub;
  };

  const why = WHY_COPY[current];

  return (
    <aside className="wizard-sidebar">
      <p className="wizard-sidebar-eyebrow">City matcher</p>
      <div className="wizard-sidebar-label">Your progress</div>
      {STEPS.map((s) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className={`wizard-step${active ? " active" : ""}${done ? " done" : ""}`}>
            <div className="wizard-step-num">
              {done ? <i className="ti ti-check" /> : s.n}
            </div>
            <div>
              <div className="wizard-step-title">{s.title}</div>
              <div className="wizard-step-sub">{subFor(s)}</div>
            </div>
          </div>
        );
      })}
      {why && (
        <div className="wizard-why">
          <div className="wizard-why-label">{why.label}</div>
          <p>{why.text}</p>
        </div>
      )}
    </aside>
  );
}
