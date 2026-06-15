"use client";

import Link from "next/link";
import { ToolNav } from "@/components/tool/ToolNav";
import { instrumentMatches, readinessGaps } from "@/lib/tool/mock-data";
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

export function CityResults() {
  const { wizard, selectedInstrument, setSelectedInstrument, step2Summary } = useTool();
  const selected = instrumentMatches[selectedInstrument];

  const chips = [
    `${wizard.country || "Chile"} · ${wizard.population.split(" ")[0] || "Medium"}`,
    `Fiscal ${wizard.fiscal.charAt(0) || "B"}`,
    wizard.sectors.slice(0, 2).join(" · ") || "Waste · Energy",
    `${wizard.readiness} stage`,
    wizard.projectType,
  ];

  return (
    <>
      <ToolNav
        right={
          <Link href="/tool/city/wizard/1" className="btn btn-sm btn-secondary" style={{ textDecoration: "none" }}>
            <i className="ti ti-edit" /> Edit inputs
          </Link>
        }
      />
      <div className="flow-wrapper">
        <div className="results-layout">
          <div className="results-main">
            <div className="results-title">Your matched instruments</div>
            <div className="results-subtitle">
              {instrumentMatches.length} instruments match your profile. Select one to see readiness gaps.
            </div>
            <div className="profile-chips">
              {chips.map((c) => (
                <span key={c} className="profile-chip">
                  {c}
                </span>
              ))}
            </div>

            <div className="result-section-label">Best matches — ranked by fit score</div>

            {instrumentMatches.map((inst, i) => (
              <div
                key={inst.id}
                className={`instrument-card${selectedInstrument === i ? " active-card" : ""}`}
                onClick={() => setSelectedInstrument(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedInstrument(i)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="instrument-tags">
                    {inst.tags.map((t) => (
                      <span key={t.label} className={tagClass(t.variant)}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <div className="fit-score">{inst.score}</div>
                </div>
                <div className="instrument-name">{inst.name}</div>
                <div className="fit-bar">
                  <div className="fit-fill" style={{ width: `${inst.score}%` }} />
                </div>
                <div className="why-box">{inst.why}</div>
              </div>
            ))}
          </div>

          <div className="results-sidebar">
            <div className="readiness-label">Readiness gap</div>
            <div className="readiness-title">{selected.name}</div>
            <div className="readiness-sub">What you still need to qualify for this match</div>
            <div className="top-match-badge">
              <i className="ti ti-star" style={{ fontSize: 14, color: "var(--amber)" }} /> Score {selected.score}
            </div>
            {readinessGaps.map((g, i) => (
              <div key={g.title} className="gap-item" style={i === readinessGaps.length - 1 ? { borderBottom: "none" } : undefined}>
                <div className={`gap-check${g.done ? " done" : ""}`} />
                <div>
                  <div className="gap-item-title">{g.title}</div>
                  <span className={effortClass(g.effort)}>{g.done ? "Done" : g.effort === "med" ? "Medium effort" : g.effort === "high" ? "High effort" : "Low effort"}</span>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>{step2Summary}</p>
          </div>
        </div>
      </div>
    </>
  );
}
