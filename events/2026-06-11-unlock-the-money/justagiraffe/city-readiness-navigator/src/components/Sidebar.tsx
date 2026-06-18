"use client";

import Link from "next/link";

export interface StageDef { key: string; title: string; sub: string }

export default function Sidebar({
  stages, active, maxReached, onSelect,
}: {
  stages: StageDef[];
  active: number;
  maxReached: number;
  onSelect: (i: number) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="logo">City<span>Catalyst</span> · Climate-Finance Readiness</div>
      <div className="tagline">Navigator — get cities &amp; regions ready to access climate finance</div>

      <div className="menu-label">Process</div>
      <div style={{ position: "relative" }}>
        <div className="rail" />
        {stages.map((s, i) => (
          <button
            key={s.key}
            className={`navitem ${i === active ? "active" : ""} ${i < maxReached ? "done" : ""}`}
            disabled={i > maxReached}
            onClick={() => onSelect(i)}
          >
            <span className="ni-num">{i < maxReached ? "✓" : i + 1}</span>
            <span className="ni-text"><b>{s.title}</b><small>{s.sub}</small></span>
          </button>
        ))}
      </div>

      <div className="menu-label" style={{ marginTop: 22 }}>Funder side</div>
      <Link href="/pipeline" className="navitem" style={{ textDecoration: "none" }}>
        <span className="ni-num">→</span>
        <span className="ni-text"><b>Funder intake</b><small>IDB Control Tower</small></span>
      </Link>
    </aside>
  );
}
