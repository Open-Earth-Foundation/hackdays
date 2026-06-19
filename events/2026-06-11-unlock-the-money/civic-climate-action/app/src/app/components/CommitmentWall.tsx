"use client";

import { useEffect, useState } from "react";
import type { PublicPledge, CityAggregate, ActionRank } from "../lib/pledgeStore";
import { worryByRecId } from "../lib/poaMoves";

const CITY_ID = "porto-alegre";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

const statusMeta: Record<string, { label: string; color: string }> = {
  committed: { label: "committed", color: "var(--ink-soft)" },
  sent: { label: "✅ sent", color: "var(--accent)" },
  responded: { label: "✅ got a response", color: "var(--accent)" },
};

export default function CommitmentWall() {
  const [recent, setRecent] = useState<PublicPledge[]>([]);
  const [agg, setAgg] = useState<CityAggregate | null>(null);
  const [ranking, setRanking] = useState<ActionRank[]>([]);

  useEffect(() => {
    let alive = true;
    const fetchWall = () =>
      fetch(`/api/wall?city=${CITY_ID}`)
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          setRecent(d.recent ?? []);
          setAgg(d.aggregate ?? null);
          setRanking(d.ranking ?? []);
        })
        .catch(() => {});
    fetchWall();
    // refresh when the tab regains focus, so a fresh signature shows up
    const onFocus = () => fetchWall();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <div>
      {agg && (
        <p style={{ fontSize: "1.05rem", marginBottom: "1.6rem", maxWidth: 640 }}>
          <strong style={{ color: "var(--accent)", fontSize: "1.3rem" }}>{agg.total.toLocaleString()}</strong>{" "}
          residents have signed a commitment ·{" "}
          <strong style={{ color: "var(--accent)", fontSize: "1.3rem" }}>{agg.sent.toLocaleString()}</strong>{" "}
          reported they followed through.
        </p>
      )}

      {ranking.length > 0 && (
        <div style={{ marginBottom: "2rem", maxWidth: 720 }}>
          <div className="eyebrow" style={{ marginBottom: "0.9rem" }}>Most-backed actions in Porto Alegre</div>
          <div style={{ display: "grid", gap: "0.7rem" }}>
            {ranking.slice(0, 5).map((a, i) => {
              const w = worryByRecId(a.actionId);
              const max = Math.max(1, ranking[0].count);
              return (
                <div key={a.actionId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ink-faint)", minWidth: 20 }}>#{i + 1}</span>
                  <span style={{ fontSize: "1.2rem" }}>{w?.icon ?? "•"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: "0.88rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600 }}>{w?.label ?? a.actionId}</span>
                      <span style={{ color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                        <strong style={{ color: "var(--ink)" }}>{a.count.toLocaleString()}</strong> committed · {a.sent} acted
                      </span>
                    </div>
                    <div style={{ height: 9, background: "var(--bg-soft)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${(a.count / max) * 100}%`, height: "100%", background: "var(--accent)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>Recent commitments</div>
      <div style={{ display: "grid", gap: "0.5rem", maxWidth: 720 }}>
        {recent.map((p) => {
          const s = statusMeta[p.status] ?? statusMeta.committed;
          return (
            <div
              key={p.id}
              style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "0.7rem 0.95rem", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)", flexWrap: "wrap" }}
            >
              <span style={{ fontWeight: 650 }}>{p.firstName}</span>
              <span style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>{p.neighborhood}</span>
              <span style={{ fontSize: "0.88rem", color: "var(--ink-soft)", flex: 1, minWidth: 200 }}>
                committed to <span style={{ color: "var(--ink)" }}>{p.worryLabel.toLowerCase()}</span> action
              </span>
              <span style={{ fontSize: "0.76rem", fontWeight: 600, color: s.color }}>{s.label}</span>
              <span style={{ fontSize: "0.74rem", color: "var(--ink-faint)" }}>{timeAgo(p.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
