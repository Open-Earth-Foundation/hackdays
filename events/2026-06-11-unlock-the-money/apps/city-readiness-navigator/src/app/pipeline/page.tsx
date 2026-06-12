"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import type { Submission } from "@/lib/store";

export default function PipelinePage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/submissions", { cache: "no-store" });
    setSubs(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return (
    <>
      <TopBar active="pipeline" />
      <div className="wrap">
        <div className="hero">
          <h1>IDB pipeline — incoming candidates</h1>
          <p>The funder side of the screen. Pre-scored cities and pools submitted from CityCatalyst land here, ready for Project Review. <span className="muted">(Stands in for the justagiraffe Control Tower receiving the handoff.)</span></p>
        </div>

        <div className="btn-row" style={{ marginBottom: 8 }}>
          <button className="btn secondary" onClick={load}>↻ Refresh</button>
          <span className="muted">{subs.length} candidate{subs.length === 1 ? "" : "s"}</span>
        </div>

        {loading ? (
          <div className="card"><div className="empty">Loading…</div></div>
        ) : subs.length === 0 ? (
          <div className="card"><div className="empty">No candidates yet. Submit one from the <a href="/">city journey</a>.</div></div>
        ) : (
          subs.map((s) => (
            <div className="card" key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>{s.name} <span className="pill-tag">{s.kind}</span></h2>
                <span className={`tier ${s.tier}`}>{s.tier} · {s.compositeReadiness}</span>
              </div>
              <p className="sub">{s.proposal.title}</p>
              <div className="grid2">
                <div>
                  <div className="kv"><span>Submission</span><span>{s.id}</span></div>
                  <div className="kv"><span>Target</span><span>{s.targetProfileId}</span></div>
                  <div className="kv"><span>Anchor</span><span>{s.anchorLocode}</span></div>
                  <div className="kv"><span>Members</span><span>{s.members.length}</span></div>
                </div>
                <div>
                  <div className="kv"><span>Ask</span><span>US${s.proposal.askUSDm}M</span></div>
                  <div className="kv"><span>Clearance</span><span>{s.clearancePassed ? "Passed ✓" : "Blocked"}</span></div>
                  <div className="kv"><span>Sector</span><span>{s.proposal.sector}</span></div>
                  <div className="kv"><span>Received</span><span className="muted" style={{ fontSize: 12 }}>{new Date(s.submittedAt).toLocaleTimeString()}</span></div>
                </div>
              </div>
              <div className="note" style={{ marginTop: 12 }}>
                Trust layer: fiscal health & governance scored on <b>real SINIM/FCM data</b> via the City-Funder Matching Engine.
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
