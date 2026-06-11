"use client";

import { useMemo, useState } from "react";

export type Row = {
  ibge: string;
  name: string;
  uf: string;
  capag: string;
  debt: string;
  savings: string;
  liquidity: string;
  icf: string;
  locode: string;
};

const TIERS = ["A+", "A", "B+", "B", "C", "D", "n.d.", "n.e."] as const;

const TIER_COLORS: Record<string, string> = {
  "A+": "#15803d",
  A: "#22c55e",
  "B+": "#a3b818",
  B: "#eab308",
  C: "#f97316",
  D: "#dc2626",
  "n.d.": "#9ca3af",
  "n.e.": "#d1d5db",
};

const TIER_LABELS: Record<string, string> = {
  "A+": "bankable, top accounting",
  A: "bankable",
  "B+": "credit-eligible",
  B: "credit-eligible",
  C: "no federal credit → blended finance",
  D: "bottom tier",
  "n.d.": "not rated (bad data) → TA market",
  "n.e.": "not evaluated",
};

function Badge({ tier }: { tier: string }) {
  return (
    <span
      style={{
        background: TIER_COLORS[tier] ?? "#e5e7eb",
        color: tier === "n.e." ? "#374151" : "#fff",
        borderRadius: 4,
        padding: "1px 7px",
        fontSize: 12,
        fontWeight: 700,
        display: "inline-block",
        minWidth: 26,
        textAlign: "center",
      }}
    >
      {tier}
    </span>
  );
}

export default function Explorer({ rows }: { rows: Row[] }) {
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [uf, setUf] = useState("");
  const [q, setQ] = useState("");

  const ufs = useMemo(
    () => Array.from(new Set(rows.map((r) => r.uf))).sort(),
    [rows]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[r.capag] = (c[r.capag] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!tierFilter || r.capag === tierFilter) &&
        (!uf || r.uf === uf) &&
        (!needle || r.name.toLowerCase().includes(needle))
    );
  }, [rows, tierFilter, uf, q]);

  const shown = filtered.slice(0, 300);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.7rem", marginBottom: 4 }}>CAPAG Funder Scan</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        {rows.length.toLocaleString()} Brazilian municipalities — Treasury fiscal capacity
        (CAPAG, Nov 2025) joined to CityCatalyst climate data. Indicative screening signal,
        not a credit decision.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "1.2rem 0" }}>
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => setTierFilter(tierFilter === t ? null : t)}
            style={{
              border: tierFilter === t ? `2px solid ${TIER_COLORS[t]}` : "1px solid #e5e7eb",
              background: tierFilter === t ? "#fafafa" : "#fff",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              textAlign: "left",
              minWidth: 118,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Badge tier={t} />
              <strong style={{ fontSize: 16 }}>{(counts[t] ?? 0).toLocaleString()}</strong>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{TIER_LABELS[t]}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input
          placeholder="Search municipality…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
        />
        <select
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
        >
          <option value="">All states</option>
          {ufs.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: 13, color: "#6b7280" }}>
        {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}
        {filtered.length > shown.length ? ` — showing first ${shown.length}` : ""}
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>
            <th style={{ padding: "6px 8px" }}>Municipality</th>
            <th style={{ padding: "6px 8px" }}>UF</th>
            <th style={{ padding: "6px 8px" }}>CAPAG</th>
            <th style={{ padding: "6px 8px" }} title="Indicator 1 — consolidated debt / net current revenue">Debt</th>
            <th style={{ padding: "6px 8px" }} title="Indicator 2 — current expenses vs revenues (3yr)">Savings</th>
            <th style={{ padding: "6px 8px" }} title="Indicator 3 — cash vs short-term obligations">Liquidity</th>
            <th style={{ padding: "6px 8px" }} title="Siconfi accounting-quality ranking">ICF</th>
            <th style={{ padding: "6px 8px" }}>LOCODE</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.ibge} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "6px 8px" }}>{r.name}</td>
              <td style={{ padding: "6px 8px", color: "#6b7280" }}>{r.uf}</td>
              <td style={{ padding: "6px 8px" }}><Badge tier={r.capag} /></td>
              <td style={{ padding: "6px 8px" }}>{r.debt}</td>
              <td style={{ padding: "6px 8px" }}>{r.savings}</td>
              <td style={{ padding: "6px 8px" }}>{r.liquidity}</td>
              <td style={{ padding: "6px 8px", color: "#6b7280" }}>{r.icf}</td>
              <td style={{ padding: "6px 8px", color: "#9ca3af", fontFamily: "monospace", fontSize: 12 }}>{r.locode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
