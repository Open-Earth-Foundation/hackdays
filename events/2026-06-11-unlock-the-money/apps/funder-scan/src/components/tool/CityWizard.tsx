"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavBack, ToolNav } from "@/components/tool/ToolNav";
import { WizardSidebar } from "@/components/tool/WizardSidebar";
import { useTool } from "@/lib/tool/tool-context";

const READINESS_HINTS: Record<string, string> = {
  Idea: "An idea is a broad intention with no defined scope or cost estimates.",
  Concept:
    "A concept has a defined problem and rough scope but no cost estimates yet. Pre-feasibility includes initial cost estimates and a risk assessment.",
  "Pre-feasibility":
    "Pre-feasibility includes initial cost estimates and a risk identification. Most concessional instruments accept this stage.",
  Feasibility:
    "A full feasibility study unlocks the widest range of instruments, including concessional loans and blended finance.",
};

const FUNDING_OPTS = ["Grant", "Technical assistance", "Concessional loan", "Blended finance", "Not sure yet"];
const SECTOR_OPTS = ["Waste", "Transport", "Energy", "Nature-based solutions", "IPPU", "AFOLU", "Buildings", "Cross-cutting"];
const URGENCY_OPTS = ["Actively seeking funding now", "Exploring options for the future"];
const COUNTRIES = [
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Kenya", "Nigeria", "South Africa",
  "Bangladesh", "India", "Indonesia", "Philippines", "Vietnam", "Egypt", "Morocco", "Other",
];
const POP_OPTS = ["Small (<100k)", "Medium (100k–1M)", "Large (1M–5M)", "Megacity (>5M)"];
const FISCAL_OPTS = ["A — Strong", "B — Moderate", "C — Limited", "Unknown"];
const BORROW_OPTS = ["Yes", "No", "Unknown"];
const CAP_OPTS = ["Low — Limited dedicated staff", "Medium — Some capacity", "High — Dedicated team"];
const CLIMATE_OPTS = ["GHG Inventory (GHGI)", "Climate Risk Assessment", "Climate action list or plan exists"];
const PROJ_OPTS = ["Grant-like", "Savings-based", "Revenue-generating"];
const READY_OPTS = ["Idea", "Concept", "Pre-feasibility", "Feasibility"];
const COFIN_OPTS = ["None", "1–10%", "10–30%", ">30%"];
const MRV_OPTS = ["GHG baseline established", "Monitoring plan drafted", "Third-party verification ready"];

export function CityWizard({ step }: { step: 1 | 2 | 3 }) {
  const router = useRouter();
  const { wizard, patchWizard } = useTool();

  const toggleSector = (s: string) => {
    const next = wizard.sectors.includes(s)
      ? wizard.sectors.filter((x) => x !== s)
      : [...wizard.sectors, s];
    patchWizard({ sectors: next });
  };

  const toggleClimate = (c: string) => {
    const next = wizard.climateChecks.includes(c)
      ? wizard.climateChecks.filter((x) => x !== c)
      : [...wizard.climateChecks, c];
    patchWizard({ climateChecks: next });
  };

  const toggleMrv = (m: string) => {
    const next = wizard.mrv.includes(m) ? wizard.mrv.filter((x) => x !== m) : [...wizard.mrv, m];
    patchWizard({ mrv: next });
  };

  return (
    <>
      <ToolNav
        right={
          <Link href="/tool/role" className="btn btn-sm btn-secondary" style={{ textDecoration: "none" }}>
            Switch role
          </Link>
        }
      />
      <div className="flow-wrapper">
        <div className="wizard-layout">
          <WizardSidebar current={step} />
          <div className="wizard-main">
            {step === 1 && (
              <>
                <NavBack href="/tool/role" />
                <div className="wizard-step-label-top" style={{ marginTop: 32 }}>
                  Step 1 of 3
                </div>
                <div className="wizard-title">What are you looking for?</div>
                <div className="wizard-subtitle">
                  This helps us filter the right funding instruments for your city before you fill in your full profile.
                </div>

                <div className="wizard-section">
                  <div className="wizard-q">What type of funding are you seeking?</div>
                  <div className="wizard-q-sub">Select one</div>
                  <div className="pill-dark">
                    {FUNDING_OPTS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={`pill-d${wizard.funding === o ? " sel" : ""}`}
                        onClick={() => patchWizard({ funding: o })}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="wizard-q">Which sectors does your project cover?</div>
                  <div className="wizard-q-sub">Select all that apply</div>
                  <div className="pill-dark">
                    {SECTOR_OPTS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={`pill-d${wizard.sectors.includes(o) ? " sel" : ""}`}
                        onClick={() => toggleSector(o)}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="wizard-q">Where are you in the process?</div>
                  <div className="wizard-q-sub">Select one</div>
                  <div className="pill-dark">
                    {URGENCY_OPTS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={`pill-d${wizard.urgency === o ? " sel" : ""}`}
                        onClick={() => patchWizard({ urgency: o })}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wizard-actions">
                  <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push("/tool/city/wizard/2")}>
                    Continue <i className="ti ti-arrow-right" />
                  </button>
                  <button type="button" className="wizard-skip" onClick={() => router.push("/tool/city/results")}>
                    Skip to instruments
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <NavBack href="/tool/city/wizard/1" />
                <div className="wizard-step-label-top" style={{ marginTop: 32 }}>
                  Step 2 of 3
                </div>
                <div className="wizard-title">City profile</div>
                <div className="wizard-subtitle">
                  Tell us about your city. This determines which instruments are eligible and how your profile is scored.
                </div>

                <div className="wizard-section">
                  <div className="wizard-section-label">Location &amp; size</div>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Country / region</label>
                      <select value={wizard.country} onChange={(e) => patchWizard({ country: e.target.value })}>
                        <option value="">Choose option...</option>
                        {COUNTRIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Population band</label>
                      <select value={wizard.population} onChange={(e) => patchWizard({ population: e.target.value })}>
                        <option value="">Choose option...</option>
                        {POP_OPTS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="wizard-section-label">Fiscal health</div>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div>
                      <label style={{ marginBottom: 10 }}>Fiscal tier</label>
                      <div className="tier-grid">
                        {FISCAL_OPTS.map((o) => (
                          <button
                            key={o}
                            type="button"
                            className={`tier-opt${wizard.fiscal === o ? " sel" : ""}`}
                            onClick={() => patchWizard({ fiscal: o })}
                          >
                            <div className="tier-radio" />
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ marginBottom: 10 }}>Borrowing authority</label>
                      <div className="tier-grid">
                        {BORROW_OPTS.map((o) => (
                          <button
                            key={o}
                            type="button"
                            className={`tier-opt${wizard.borrowing === o ? " sel" : ""}`}
                            onClick={() => patchWizard({ borrowing: o })}
                          >
                            <div className="tier-radio" />
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="wizard-section-label">Institutional capacity</div>
                  <div className="wizard-q">Technical capacity</div>
                  <div className="tier-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                    {CAP_OPTS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={`tier-opt${wizard.capacity === o ? " sel" : ""}`}
                        onClick={() => patchWizard({ capacity: o })}
                      >
                        <div className="tier-radio" />
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="wizard-section-label">Climate data maturity</div>
                  <div className="check-cards">
                    {CLIMATE_OPTS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`check-card${wizard.climateChecks.includes(c) ? " sel" : ""}`}
                        onClick={() => toggleClimate(c)}
                        style={{ border: "1.5px solid var(--border)", textAlign: "left", width: "100%" }}
                      >
                        <div className="check-box" />
                        <div>
                          <div className="check-card-label">{c}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wizard-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => router.push("/tool/city/wizard/1")}>
                    <i className="ti ti-arrow-left" /> Back
                  </button>
                  <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push("/tool/city/wizard/3")}>
                    Continue <i className="ti ti-arrow-right" />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <NavBack href="/tool/city/wizard/2" />
                <div className="wizard-step-label-top" style={{ marginTop: 32 }}>
                  Step 3 of 3
                </div>
                <div className="wizard-title">Project details</div>
                <div className="wizard-subtitle">
                  Tell us about the specific project you want to fund. This determines finance model fit and eligibility for debt instruments.
                </div>

                <div className="wizard-section">
                  <div className="wizard-section-label">Project type</div>
                  <div className="radio-cards">
                    {PROJ_OPTS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={`radio-card${wizard.projectType === o ? " sel" : ""}`}
                        onClick={() => patchWizard({ projectType: o })}
                        style={{ border: "1.5px solid var(--border)", textAlign: "left" }}
                      >
                        <div className="rc-dot" />
                        <div className="rc-title">{o}</div>
                        <div className="rc-desc">
                          {o === "Grant-like" && "Public benefit, no income stream. Suited to grants and TA."}
                          {o === "Savings-based" && "Reduces costs — energy efficiency, waste reduction, etc."}
                          {o === "Revenue-generating" && "Income via tariffs, fees, or offtake agreements."}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wizard-section">
                  <div className="wizard-section-label">Readiness stage</div>
                  <div className="seg-ctrl">
                    {READY_OPTS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={`seg-opt${wizard.readiness === o ? " sel" : ""}`}
                        onClick={() => patchWizard({ readiness: o })}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>
                    {READINESS_HINTS[wizard.readiness] ?? ""}
                  </p>
                </div>

                <div className="wizard-section">
                  <div className="wizard-section-label">Finance readiness</div>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div>
                      <label style={{ marginBottom: 10 }}>Co-financing available</label>
                      <div className="seg-ctrl">
                        {COFIN_OPTS.map((o) => (
                          <button
                            key={o}
                            type="button"
                            className={`seg-opt${wizard.cofinance === o ? " sel" : ""}`}
                            onClick={() => patchWizard({ cofinance: o })}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ marginBottom: 10 }}>MRV and data status</label>
                      <div className="check-cards" style={{ gridTemplateColumns: "1fr" }}>
                        {MRV_OPTS.map((m) => (
                          <button
                            key={m}
                            type="button"
                            className={`check-card${wizard.mrv.includes(m) ? " sel" : ""}`}
                            onClick={() => toggleMrv(m)}
                            style={{ padding: "12px 14px", border: "1.5px solid var(--border)", textAlign: "left", width: "100%" }}
                          >
                            <div className="check-box" />
                            <div className="check-card-label">{m}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wizard-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => router.push("/tool/city/wizard/2")}>
                    <i className="ti ti-arrow-left" /> Back
                  </button>
                  <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push("/tool/city/results")}>
                    Find matching instruments <i className="ti ti-arrow-right" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
