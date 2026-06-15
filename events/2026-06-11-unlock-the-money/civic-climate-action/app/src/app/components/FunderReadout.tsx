"use client";

import { useEffect, useState } from "react";
import type { FunderReadout as Readout, FunderTheme } from "../lib/pledgeStore";

const themeColor: Record<FunderTheme, string> = {
  Resilience: "var(--accent)",
  Greening: "#15803d",
  Mobility: "#2563eb",
  Energy: "#d97706",
};

// CCRA / priority framing per theme, so a funder reads engagement against risk.
const themeRisk: Record<FunderTheme, string> = {
  Resilience: "Floods & landslides — Very High (CCRA)",
  Greening: "Heatwaves",
  Mobility: "Transport — 77% of emissions",
  Energy: "Residential energy & comfort",
};

export default function FunderReadout() {
  const [r, setR] = useState<Readout | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/funders?city=porto-alegre")
        .then((res) => res.json())
        .then((d) => alive && setR(d.readout ?? null))
        .catch(() => {});
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (!r) return <p className="muted">Loading live engagement…</p>;

  const pct = Math.round(r.responseRate * 100);
  const themeMax = Math.max(1, ...r.byTheme.map((t) => t.total));
  const hoodMax = Math.max(1, ...r.byNeighborhood.map((h) => h.count));

  return (
    <div>
      {/* Headline numbers */}
      <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <Metric value={r.total.toLocaleString()} label="signed commitments" />
        <Metric value={r.sent.toLocaleString()} label="reported following through" />
        <Metric value={`${pct}%`} label="follow-through rate" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        {/* By theme */}
        <div>
          <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>Demand by climate priority</div>
          <div style={{ display: "grid", gap: "0.9rem" }}>
            {r.byTheme.map((t) => (
              <div key={t.theme}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 650 }}>{t.theme}</span>
                  <span style={{ color: "var(--ink-soft)" }}>{t.total} committed · {t.sent} acted</span>
                </div>
                <div style={{ height: 8, background: "var(--bg-soft)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${(t.total / themeMax) * 100}%`, height: "100%", background: themeColor[t.theme] }} />
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: "0.2rem" }}>{themeRisk[t.theme]}</div>
              </div>
            ))}
            {r.byTheme.length === 0 && <p className="muted" style={{ fontSize: "0.88rem" }}>No recorded commitments yet.</p>}
          </div>
        </div>

        {/* By neighborhood */}
        <div>
          <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>Where it&rsquo;s happening</div>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {r.byNeighborhood.slice(0, 8).map((h) => (
              <div key={h.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.86rem", minWidth: 140 }}>{h.name}</span>
                <div style={{ flex: 1, height: 8, background: "var(--bg-soft)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${(h.count / hoodMax) * 100}%`, height: "100%", background: "var(--accent)" }} />
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--ink-soft)", minWidth: 20, textAlign: "right" }}>{h.count}</span>
              </div>
            ))}
            {r.byNeighborhood.length === 0 && <p className="muted" style={{ fontSize: "0.88rem" }}>No neighborhoods recorded yet.</p>}
          </div>
          <p style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: "0.8rem" }}>
            Theme &amp; neighborhood breakdowns reflect named, recorded commitments (the headline total also includes the historical baseline).
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "0.3rem" }}>{label}</div>
    </div>
  );
}
