"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dossier } from "@/lib/dossier";

export default function PipelinePage() {
  const [subs, setSubs] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/submissions", { cache: "no-store" });
    setSubs(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="wrap">
      <div className="topbar" style={{ margin: "0 -24px 0", borderRadius: 0 }}>
        <div className="brand">IDB · <span>Control Tower</span> — Intake &amp; Triage</div>
        <span className="pill-tag">funder side</span>
        <div className="spacer" />
        <nav><Link href="/">← City journey</Link></nav>
      </div>

      <div className="hero">
        <h1>Incoming candidate dossiers</h1>
        <p>The funder side of the screen. Pre-scored candidates submitted from CityCatalyst arrive here as machine-readable dossiers, ready for the IDB Sub-Sovereign Finance Program (SFP) review. <span className="muted">(Stands in for the justagiraffe Control Tower receiving the handoff.)</span></p>
      </div>

      <div className="btn-row" style={{ marginBottom: 8 }}>
        <button className="btn secondary" onClick={load}>↻ Refresh</button>
        <span className="muted">{subs.length} dossier{subs.length === 1 ? "" : "s"}</span>
      </div>

      {loading ? (
        <div className="card"><div className="empty">Loading…</div></div>
      ) : subs.length === 0 ? (
        <div className="card"><div className="empty">No dossiers yet. Submit one from the <Link href="/">city journey</Link>.</div></div>
      ) : (
        subs.map((d) => (
          <div className="card" key={d.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>{d.name} <span className="pill-tag">{d.country}</span> <span className="pill-tag">{d.pathway}</span></h2>
              <span className={`tier ${d.readiness.tier}`}>{d.readiness.tier} · {d.readiness.composite}</span>
            </div>
            <p className="sub">{d.conceptNote.title} — {d.instrument.name} ({d.instrument.funder})</p>
            <div className="grid2">
              <div>
                <div className="kv"><span>Dossier</span><span>{d.id}</span></div>
                <div className="kv"><span>Ask</span><span>US${d.financials.askUSDm}M</span></div>
                <div className="kv"><span>Clearance</span><span>{d.readiness.cleared ? "Passed ✓" : "Capacity-building"}</span></div>
                {d.pool && <div className="kv"><span>Pool</span><span>{d.pool.members.length} members · anchor {d.pool.anchor}</span></div>}
              </div>
              <div>
                <div className="kv"><span>Sector</span><span>{d.conceptNote.sector}</span></div>
                <div className="kv"><span>City id</span><span className="muted" style={{ fontSize: 12 }}>{d.locode}</span></div>
                <div className="kv"><span>Received</span><span className="muted" style={{ fontSize: 12 }}>{new Date(d.submittedAt).toLocaleTimeString()}</span></div>
              </div>
            </div>
            <div className="btn-row" style={{ marginTop: 10 }}>
              <button className="btn secondary" style={{ padding: "7px 14px" }} onClick={() => setOpen(open === d.id ? null : d.id)}>
                {open === d.id ? "Hide dossier" : "Open dossier"}
              </button>
            </div>
            {open === d.id && (
              <div style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                <h2 style={{ fontSize: 15 }}>Concept note — plan</h2>
                <p className="sub">{d.conceptNote.summary}</p>
                {d.conceptNote.actions.map((a, i) => (
                  <div className="actionrow" key={i}><span>{a.name}</span><span className={`atype ${a.type}`}>{a.type}</span></div>
                ))}
                <h2 style={{ fontSize: 15, marginTop: 16 }}>Readiness — early creditworthiness assessment</h2>
                {d.readiness.pillars.map((p) => (
                  <div className="kv" key={p.key}><span>{p.label} <span className="muted" style={{ fontSize: 11 }}>({p.provenance})</span></span><span>{p.score}</span></div>
                ))}
                <h2 style={{ fontSize: 15, marginTop: 16 }}>Documentary due diligence</h2>
                {d.dueDiligence.map((c, i) => (
                  <div className="gate" key={i}><span className={`dot ${c.done ? "pass" : "fail"}`} />{c.label}</div>
                ))}
                <div className="note" style={{ marginTop: 14 }}>{d.provenanceNote}</div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
