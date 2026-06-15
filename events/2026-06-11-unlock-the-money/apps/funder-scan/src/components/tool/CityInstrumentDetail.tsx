"use client";

import Link from "next/link";
import { ToolNav } from "@/components/tool/ToolNav";
import { instrumentMatches, nextSteps } from "@/lib/tool/mock-data";
import { useTool } from "@/lib/tool/tool-context";

function tagClass(v?: string) {
  if (v === "ppf") return "instrument-tag ppf";
  if (v === "climate") return "instrument-tag climate";
  if (v === "bilateral") return "instrument-tag bilateral";
  return "instrument-tag";
}

function effortClass(e: string) {
  if (e === "done") return "effort-badge effort-done";
  if (e === "med") return "effort-badge effort-med";
  if (e === "high") return "effort-badge effort-high";
  return "effort-badge effort-low";
}

export function CityInstrumentDetail() {
  const { wizard, selectedInstrument } = useTool();
  const inst = instrumentMatches[selectedInstrument];

  const conceptContext = `Medium-sized city in ${wizard.country || "Chile"}, ${wizard.population || "population band selected"}. Fiscal tier ${wizard.fiscal.charAt(0) || "B"}. Priority sectors: ${wizard.sectors.join(" and ") || "waste and buildings"}. Project at ${wizard.readiness.toLowerCase()} stage. ${wizard.projectType} model.`;

  return (
    <>
      <ToolNav
        right={
          <Link href="/tool/city/results" className="btn btn-sm btn-secondary" style={{ textDecoration: "none" }}>
            <i className="ti ti-arrow-left" /> All matches
          </Link>
        }
      />
      <div className="flow-wrapper">
        <div className="detail-layout">
          <div className="detail-main">
            <div className="selected-instrument-card">
              <div className="sit-label">You selected</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="sit-name">{inst.name}</div>
                  <div className="instrument-tags">
                    {inst.tags.map((t) => (
                      <span key={t.label} className={tagClass(t.variant)}>
                        {t.label}
                      </span>
                    ))}
                    <span className="instrument-tag">{wizard.readiness} stage eligible</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="sit-score">{inst.score}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>fit score / 100</div>
                </div>
              </div>
            </div>

            <div className="detail-title">Your next steps to qualify</div>
            {nextSteps.map((s, i) => (
              <div
                key={s.title}
                className="next-step-item"
                style={i === nextSteps.length - 1 ? { borderBottom: "none" } : undefined}
              >
                <div className={`nsi-check${s.done ? " done" : ""}`} />
                <div>
                  <div className="nsi-title">{s.title}</div>
                  <div className="nsi-desc">{s.desc}</div>
                  <span className={effortClass(s.effort)}>
                    {s.effort === "done" ? "Done" : s.effort === "med" ? "Medium effort" : s.effort === "high" ? "High effort" : "Low effort"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="detail-sidebar">
            <div className="concept-sidebar-label">Concept note starter</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>C40 CFF format</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
              Pre-filled from your city profile. Edit the empty fields to complete your draft.
            </div>

            <div className="concept-section">
              <div className="concept-section-label">City &amp; project context</div>
              <div className="concept-prefilled">{conceptContext}</div>
            </div>
            <div className="concept-section">
              <div className="concept-section-label">Problem statement</div>
              <div className="concept-empty">
                <textarea placeholder="Describe the specific climate challenge this project addresses and the city's current situation." />
              </div>
            </div>
            <div className="concept-section">
              <div className="concept-section-label">Proposed intervention</div>
              <div className="concept-empty">
                <textarea placeholder="Describe what the project will do and how it will be implemented." />
              </div>
            </div>
            <div className="concept-section">
              <div className="concept-section-label">Expected outcomes</div>
              <div className="concept-empty">
                <textarea placeholder="Quantify the expected emissions reduction or adaptation benefit, with methodology." />
              </div>
            </div>
            <div className="concept-section">
              <div className="concept-section-label">Financing structure</div>
              <div className="concept-prefilled">
                {wizard.projectType} project. Co-financing of {wizard.cofinance} available. Repayment through cost savings over project lifetime where applicable.
              </div>
            </div>
            <div className="concept-section">
              <div className="concept-section-label">Implementation team</div>
              <div className="concept-empty">
                <textarea placeholder="Name the lead department, key personnel, and any implementation partners." />
              </div>
            </div>

            <div className="concept-actions">
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
                Export JSON
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }}>
                Download concept note <i className="ti ti-download" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
