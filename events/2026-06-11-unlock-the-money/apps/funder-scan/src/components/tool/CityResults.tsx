"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ToolNav } from "@/components/tool/ToolNav";
import { useChileMatch } from "@/lib/tool/use-chile-match";
import { useTool } from "@/lib/tool/tool-context";
import type { InstrumentMatch, ReadinessGap } from "@/lib/tool/types";

function tagClass(v?: string) {
  if (v === "ppf") return "instrument-tag ppf";
  if (v === "climate") return "instrument-tag climate";
  if (v === "bilateral") return "instrument-tag bilateral";
  return "instrument-tag";
}

function effortLabel(e: string, done: boolean) {
  if (done || e === "done") return "Done";
  if (e === "med") return "Medium effort";
  if (e === "high") return "High effort";
  return "Low effort";
}

function effortClass(e: string, done: boolean) {
  if (done || e === "done") return "effort-badge effort-done";
  if (e === "med") return "effort-badge effort-med";
  if (e === "high") return "effort-badge effort-high";
  return "effort-badge effort-low";
}

function ReadinessPanel({
  selected,
  step2Summary,
  readinessGaps,
  className = "",
}: {
  selected: InstrumentMatch;
  step2Summary: string;
  readinessGaps: ReadinessGap[];
  className?: string;
}) {
  const doneCount = readinessGaps.filter((g) => g.done).length;

  return (
    <aside className={`results-sidebar${className ? ` ${className}` : ""}`}>
      <div className="results-sidebar-head">
        <div className="readiness-label">Readiness gap</div>
        <div className="readiness-title">{selected.name}</div>
        <div className="readiness-sub">What you still need to qualify for this match</div>
        <div className="results-score-row">
          <span className="top-match-badge">
            <i className="ti ti-star" /> Fit score {selected.score}
          </span>
          <span className="results-progress-pill">
            {doneCount}/{readinessGaps.length} complete
          </span>
        </div>
      </div>

      <div className="results-gap-list">
        {readinessGaps.map((g, i) => (
          <div key={g.title} className={`gap-item${i === readinessGaps.length - 1 ? " last" : ""}`}>
            <div className={`gap-check${g.done ? " done" : ""}`} />
            <div>
              <div className="gap-item-title">{g.title}</div>
              <span className={effortClass(g.effort, g.done)}>{effortLabel(g.effort, g.done)}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="results-profile-hint">
        <i className="ti ti-map-pin" />
        {step2Summary}
      </p>
    </aside>
  );
}

export function CityResults() {
  const { wizard, selectedInstrument, setSelectedInstrument, step2Summary } = useTool();
  const { matches, readinessGaps, loading, error, engineLabel, comuna } = useChileMatch(wizard);

  useEffect(() => {
    if (selectedInstrument >= matches.length) setSelectedInstrument(0);
  }, [matches.length, selectedInstrument, setSelectedInstrument]);

  const selected = matches[selectedInstrument] ?? matches[0];

  const chips = [
    wizard.comuna ? `${wizard.comuna}, Chile` : `${wizard.country || "Chile"}`,
    wizard.population.split(" ")[0] || "Medium",
    `Fiscal ${wizard.fiscal.charAt(0) || "B"}`,
    wizard.sectors.slice(0, 2).join(" · ") || "Waste · Energy",
    `${wizard.readiness} stage`,
    wizard.projectType,
  ];

  if (loading) {
    return (
      <>
        <ToolNav />
        <div className="flow-wrapper">
          <p className="results-loading">Loading Chile matcher data…</p>
        </div>
      </>
    );
  }

  if (error || !selected) {
    return (
      <>
        <ToolNav />
        <div className="flow-wrapper">
          <p className="results-error">{error ?? "No matches found for this profile."}</p>
          <Link href="/tool/city/wizard/1" className="btn btn-primary">
            Edit inputs
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <ToolNav
        right={
          <Link href="/tool/city/wizard/1" className="btn btn-sm btn-secondary results-edit-link">
            <i className="ti ti-edit" /> Edit inputs
          </Link>
        }
      />
      <div className="flow-wrapper">
        <div className="results-layout">
          <div className="results-main">
            <header className="results-header">
              <p className="results-eyebrow">City path · Your matches</p>
              <h1 className="results-title">Your matched instruments</h1>
              <p className="results-subtitle">
                {matches.length} Chilean instruments match your profile via {engineLabel}.
                {comuna?.poolStatus === "anchor" && " This comuna is a pool anchor."}
              </p>
            </header>

            <div className="results-profile-card">
              <div className="results-profile-label">Profile summary</div>
              <div className="profile-chips">
                {chips.map((c) => (
                  <span key={c} className="profile-chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="result-section-label">Best matches — ranked by fit score</div>

            <div className="results-card-list">
              {matches.map((inst, i) => (
                <button
                  key={`${inst.name}-${i}`}
                  type="button"
                  className={`instrument-card${selectedInstrument === i ? " active-card" : ""}`}
                  onClick={() => setSelectedInstrument(i)}
                >
                  <div className="instrument-card-rank">#{i + 1}</div>
                  <div className="instrument-card-body">
                    <div className="instrument-card-top">
                      <div className="instrument-tags">
                        {inst.tags.map((t) => (
                          <span key={t.label} className={tagClass(t.variant)}>
                            {t.label}
                          </span>
                        ))}
                      </div>
                      <div className="fit-score-wrap">
                        <span className="fit-score">{inst.score}</span>
                        <span className="fit-score-max">/ 100</span>
                      </div>
                    </div>
                    <div className="instrument-name">{inst.name}</div>
                    <div className="fit-bar">
                      <div className="fit-fill" style={{ width: `${inst.score}%` }} />
                    </div>
                    <div className="why-box">{inst.why}</div>
                    {selectedInstrument === i && (
                      <span className="instrument-selected-label">
                        <i className="ti ti-check" /> Selected — see readiness gap
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <ReadinessPanel
              selected={selected}
              step2Summary={step2Summary}
              readinessGaps={readinessGaps}
              className="results-sidebar-mobile"
            />
          </div>

          <ReadinessPanel
            selected={selected}
            step2Summary={step2Summary}
            readinessGaps={readinessGaps}
          />
        </div>
      </div>
    </>
  );
}
