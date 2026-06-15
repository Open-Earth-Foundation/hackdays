"use client";

import { useTool } from "@/lib/tool/tool-context";

type Step = 1 | 2 | 3;

export function WizardSidebar({ current }: { current: Step }) {
  const { step1Summary, step2Summary } = useTool();

  const steps: { n: Step; title: string; sub: string }[] = [
    { n: 1, title: "What are you looking for?", sub: current > 1 ? step1Summary : "Funding type, sector, urgency" },
    { n: 2, title: "City profile", sub: current > 2 ? step2Summary : "Who you are and your capacity" },
    { n: 3, title: "Project details", sub: "What you want to build" },
  ];

  return (
    <div className="wizard-sidebar">
      <div className="wizard-sidebar-label">Your progress</div>
      {steps.map((s) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div
            key={s.n}
            className={`wizard-step${active ? " active" : ""}${done ? " done" : ""}`}
          >
            <div className="wizard-step-num">
              {done ? <i className="ti ti-check" style={{ fontSize: 12 }} /> : s.n}
            </div>
            <div>
              <div className="wizard-step-title">{s.title}</div>
              <div className="wizard-step-sub">{s.sub}</div>
            </div>
          </div>
        );
      })}
      {current === 1 && (
        <div className="wizard-why">
          <div className="wizard-why-label">Why we ask</div>
          <p>
            These three questions let us filter out instruments that aren&apos;t relevant before we
            ask for detailed information. You can skip this step and browse everything.
          </p>
        </div>
      )}
      {current === 3 && (
        <div className="wizard-why">
          <div className="wizard-why-label">About readiness stages</div>
          <p>
            Most instruments require at least a concept-stage project. A feasibility study unlocks
            the widest range of funding, including concessional loans and blended instruments.
          </p>
        </div>
      )}
    </div>
  );
}
