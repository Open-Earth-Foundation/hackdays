"use client";

import { useMemo } from "react";
import type { City } from "../data/types";
import { usePledges } from "../lib/pledgeContext";
import { engagementReadiness, type ReadinessBand } from "../lib/engagementScore";
import { funderBrief } from "../lib/funderBrief";

const bandColor: Record<ReadinessBand, string> = {
  Strong: "#15803d",
  Developing: "#d97706",
  Emerging: "#6b7280",
};

export default function EngagementReadiness({ city }: { city: City }) {
  const { count, loaded } = usePledges();
  const pledges = count(city.id);
  const readiness = useMemo(() => engagementReadiness(city, pledges), [city, pledges]);

  function download() {
    const md = funderBrief(city, readiness);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engagement-readiness-${city.id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      style={{
        marginTop: "1.25rem",
        border: "1px solid var(--accent-soft)",
        borderRadius: 14,
        padding: "1.2rem 1.35rem",
        background: "var(--bg)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">For funders · Civic engagement readiness</div>
          <p className="muted" style={{ fontSize: "0.85rem", margin: "0.3rem 0 0", maxWidth: 460 }}>
            The civic-participation co-benefit funders already score (MDBs · IDB · philanthropy),
            made visible — so &ldquo;is this city engaged?&rdquo; becomes something you can see and export.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1, color: bandColor[readiness.band] }}>
            {readiness.score}
            <span style={{ fontSize: "1rem", color: "var(--ink-faint)", fontWeight: 600 }}> / 100</span>
          </div>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: bandColor[readiness.band] }}>
            {readiness.band}
          </div>
          <div style={{ fontSize: "0.66rem", color: "var(--ink-faint)" }}>prototype index</div>
        </div>
      </div>

      <div style={{ margin: "1rem 0", padding: "0.6rem 0.8rem", background: "var(--accent-soft)", borderRadius: 10, fontSize: "0.88rem" }}>
        <strong style={{ color: "var(--ink)" }}>{pledges.toLocaleString()}</strong> resident commitments captured here
        {!loaded && <span style={{ color: "var(--ink-faint)" }}> · loading…</span>}
      </div>

      <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>How the score is built</div>
      <div style={{ display: "grid", gap: "0.55rem" }}>
        {readiness.inputs.map((i) => (
          <div key={i.label.en}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <span>
                {i.label.en} <span style={{ color: "var(--ink-faint)" }}>· {i.value}</span>
              </span>
              <span className="muted">
                {i.contribution}/{i.weight}
              </span>
            </div>
            <div style={{ height: 6, background: "var(--line)", borderRadius: 999, marginTop: 2 }}>
              <div
                style={{
                  width: `${(i.contribution / i.weight) * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "var(--accent)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "1rem", flexWrap: "wrap" }}>
        <button
          onClick={download}
          style={{
            font: "inherit",
            fontSize: "0.84rem",
            fontWeight: 650,
            cursor: "pointer",
            color: "#fff",
            background: "var(--accent)",
            border: "none",
            borderRadius: 8,
            padding: "0.5rem 0.95rem",
          }}
        >
          ↓ Download engagement brief
        </button>
        <span style={{ fontSize: "0.7rem", color: "var(--ink-faint)" }}>
          Prototype index over demo participation data — not an audited metric.
        </span>
      </div>
    </div>
  );
}
