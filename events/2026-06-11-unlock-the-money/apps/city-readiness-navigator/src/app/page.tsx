"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar, { type StageDef } from "@/components/Sidebar";
import MapView from "@/components/MapView";
import { SCOPES, mapPoints, scopeLegend, journeyCity, DATA } from "@/lib/adapters";
import { SM, provenanceKind, type Scored, type Comuna } from "@/lib/engine";
import { getCityContext, agentAssist } from "@/lib/context";
import { assembleDossier } from "@/lib/dossier";

const STAGES: StageDef[] = [
  { key: "explore", title: "Explore", sub: "Map & scope" },
  { key: "context", title: "City context", sub: "Source: inventory + plan" },
  { key: "readiness", title: "Readiness pathways", sub: "Assess & route" },
  { key: "portfolio", title: "Portfolio", sub: "Instrument · pool · prepare" },
  { key: "intake", title: "Funder intake", sub: "Dossier & submit" },
];

function ProvBadge({ prov }: { prov: string }) {
  const kind = provenanceKind(prov);
  return <span className={`badge ${kind}`} title={prov}>{kind}</span>;
}

function Pillars({ city }: { city: Comuna }) {
  const expl = SM.explainScore(city.readiness);
  return (
    <div>
      {expl.map((e) => (
        <div className="pillar" key={e.key}>
          <div className="top">
            <span>{e.label} <ProvBadge prov={(city.provenance as any)[e.key]} /></span>
            <span>{city.readiness[e.key as keyof typeof city.readiness]}</span>
          </div>
          <div className="bar"><i style={{ width: `${city.readiness[e.key as keyof typeof city.readiness]}%` }} /></div>
          <div className="meta">{e.points} pts · {Math.round(e.weight * 100)}% weight</div>
        </div>
      ))}
    </div>
  );
}

function pathwayOf(s: Scored): "instrument" | "pool" | "capacity-building" {
  if (!s.canEnterProjectReview) return "capacity-building";
  if (s.eligibility.eligible) return "instrument";
  return "pool";
}

export default function Page() {
  const [scopeId, setScopeId] = useState("cl-losrios");
  const [cityId, setCityId] = useState<string | null>(null);
  const [entry, setEntry] = useState<"entity" | "project">("entity");
  const [stage, setStage] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [submitState, setSubmitState] = useState<{ id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const scope = SCOPES.find((s) => s.id === scopeId)!;
  const points = useMemo(() => mapPoints(scopeId), [scopeId]);
  const legend = scopeLegend(scopeId);

  const scored = cityId ? journeyCity(cityId) : null;
  const ctx = cityId ? getCityContext(cityId) : null;
  const pathway = scored ? pathwayOf(scored) : null;
  const pool = scopeId === "cl-losrios" ? DATA.cl.pool : null;
  const poolScored = scored && pool ? SM.scoreSNG({ ...(scored as any), proposal: pool.pooledProposal }) : null;

  function goto(i: number) { setStage(i); setMaxReached((m) => Math.max(m, i)); }
  function pickCity(id: string) { setCityId(id); setSubmitState(null); goto(1); }

  async function submit() {
    if (!scored || !pathway) return;
    setSubmitting(true);
    let opts: any;
    if (pathway === "pool" && pool) {
      opts = { scored: poolScored, kind: "pool", pathway: "pool",
        pool: { anchor: scored.name, members: pool.members.map((m: any) => ({ name: m.name, role: m.isAnchor ? "anchor" : "member", cofinance: m.cofinanceScore })) },
        proposal: pool.pooledProposal };
    } else if (pathway === "capacity-building") {
      opts = { scored, kind: "city", pathway: "capacity-building", instrumentName: "Capacity-building / PPF + blended finance",
        pool: null, proposal: scored.proposal };
    } else {
      opts = { scored, kind: "city", pathway: "instrument", pool: null, proposal: scored.proposal };
    }
    const dossier = assembleDossier(opts);
    const res = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dossier) });
    const rec = await res.json();
    setSubmitState({ id: rec.id });
    setSubmitting(false);
  }

  return (
    <div className="app-shell">
      <Sidebar stages={STAGES} active={stage} maxReached={maxReached} onSelect={goto} />
      <main className="main">
        <div className="crumbs">{scope.country} · {scope.region} · adapter: {scope.adapter}</div>

        {/* 0 — EXPLORE */}
        {stage === 0 && (
          <>
            <div className="h-stage">Explore financial readiness</div>
            <p className="h-sub">A geographic view of readiness across a scope, from real national fiscal data. Pick a highlighted city to open its readiness journey.</p>
            <div className="scopebar">
              {SCOPES.map((s) => (
                <button key={s.id} className={`scopebtn ${s.id === scopeId ? "active" : ""}`} onClick={() => { setScopeId(s.id); setCityId(null); }}>
                  {s.country} · {s.region}
                </button>
              ))}
            </div>
            <MapView scopeId={scopeId} points={points} center={scope.center} zoom={scope.zoom} onSelect={pickCity} />
            <div className="maplegend">
              {legend.map((l) => <span key={l.cls}><i className={`dot-${l.cls}`} />{l.label}</span>)}
              <span className="muted">· data: {scope.adapter}</span>
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <h2>Open a city</h2>
              <p className="sub">Cities with a full readiness profile in this scope:</p>
              {points.filter((p) => p.journeyable).map((p) => (
                <div className="actionrow" key={p.id}>
                  <span><b>{p.name}</b> <span className="muted">· {p.capag ? `CAPAG ${p.capag}` : p.tier}</span></span>
                  <button className="btn" style={{ padding: "6px 14px" }} onClick={() => pickCity(p.id)}>Open →</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 1 — CITY CONTEXT */}
        {stage === 1 && scored && ctx && (
          <>
            <div className="h-stage">{scored.name}</div>
            <p className="h-sub">Loaded from {scored.name}&apos;s CityCatalyst context — GHG inventory and HIAP-prioritized actions. <span className="muted">(Live CityCatalyst MCP wiring is the seam; here it&apos;s simulated context.)</span></p>
            <div className="entrytoggle">
              <button className={entry === "entity" ? "active" : ""} onClick={() => setEntry("entity")}>Entity-first</button>
              <button className={entry === "project" ? "active" : ""} onClick={() => setEntry("project")}>Project-first (import)</button>
            </div>
            <div className="grid2">
              <div className="card">
                <h2>GHG inventory</h2>
                <p className="sub">{ctx.inventory.source} · {ctx.inventory.year}</p>
                {ctx.inventory.topSectors.map((s) => (
                  <div className="kv" key={s.sector}><span>{s.sector}</span><span>{s.sharePct}%</span></div>
                ))}
              </div>
              <div className="card">
                <h2>HIAP priorities</h2>
                <p className="sub">Top prioritized climate actions</p>
                {ctx.hiap.map((a) => (
                  <div className="actionrow" key={a.actionId}>
                    <span>{a.rank}. {a.name}</span>
                    <span className={`atype ${a.type}`}>{a.type}</span>
                  </div>
                ))}
              </div>
            </div>
            {entry === "project" && (
              <div className="note">Project-first: import a prepared project (a <b>Concept Note</b> from the Project Preparator) — it enters at the Portfolio step (②). For this demo the entity-first path is wired; project import is the interop seam.</div>
            )}
            <div className="btn-row"><button className="btn" onClick={() => goto(2)}>Assess readiness →</button></div>
          </>
        )}

        {/* 2 — READINESS PATHWAYS */}
        {stage === 2 && scored && (
          <>
            <div className="h-stage">Readiness pathways</div>
            <p className="h-sub">The early creditworthiness assessment for the <b>{SM.activeProfile().instrument}</b>, scored on real fiscal data. The diagnosis routes the next step.</p>
            <div className="grid2">
              <div className="card">
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
                  <span className="scorebig">{scored.compositeReadiness}<small>/100</small></span>
                  <span className={`tier ${scored.tier}`}>{scored.tier}</span>
                </div>
                <Pillars city={scored} />
              </div>
              <div>
                <div className="card">
                  <h2>Eligibility gate</h2>
                  {Object.entries(scored.eligibility).filter(([k]) => k !== "eligible").map(([k, v]) => {
                    const lbl = (SM.activeProfile().projectEligibility.find((c: any) => c.key === k) || {}).label || k;
                    return <div className="gate" key={k}><span className={`dot ${v ? "pass" : "fail"}`} />{lbl}</div>;
                  })}
                </div>
                <div className={`card pathcard ${pathway === "instrument" ? "ok" : pathway === "pool" ? "warn" : "block"}`}>
                  <h2>Recommended pathway</h2>
                  {pathway === "instrument" && <p className="sub">Ready and eligible — proceed directly to the instrument.</p>}
                  {pathway === "pool" && <p className="sub"><b>Ready, but sub-scale.</b> {scored.name} clears creditworthiness, but its project is below the instrument&apos;s ticket size. Route → <b>portfolio / pooling</b>.</p>}
                  {pathway === "capacity-building" && <p className="sub"><b>Not yet eligible.</b> Route → <b>capacity-building</b>: targeted TC / PPF before the instrument. Not a debt problem — see the signals.</p>}
                </div>
              </div>
            </div>
            {(() => { const a = agentAssist({ cityName: scored.name, tier: scored.tier, cleared: scored.canEnterProjectReview, pathway: pathway! });
              return <div className="agent"><div className="who">CityCatalyst agent <span className="sim">simulated</span></div>{a.text}</div>; })()}
            <div className="btn-row"><button className="btn" onClick={() => goto(3)}>{pathway === "capacity-building" ? "See capacity-building track →" : "Build the portfolio →"}</button></div>
          </>
        )}

        {/* 3 — PORTFOLIO / CAPACITY */}
        {stage === 3 && scored && (
          <>
            {pathway === "capacity-building" ? (
              <>
                <div className="h-stage">Capacity-building track</div>
                <p className="h-sub">{scored.name} routes here instead of the loan instrument — what to fix to become eligible, and the funded routes to do it.</p>
                {(scored as any).capag && (
                  <div className="card">
                    <h2>Why — the CAPAG signals</h2>
                    <p className="sub">Real Tesouro Nacional indicators. The gap is not debt.</p>
                    <div className="kv"><span>Debt / RCL (endividamento)</span><span>grade {(scored as any).capag.nota1} ✓</span></div>
                    <div className="kv"><span>Current savings (poupança)</span><span>grade {(scored as any).capag.nota2}</span></div>
                    <div className="kv"><span>Liquidity (liquidez)</span><span>grade {(scored as any).capag.nota3}</span></div>
                    <div className="kv"><span>Accounting quality (ICF)</span><span>{(scored as any).capag.icf}</span></div>
                  </div>
                )}
                <div className="card">
                  <h2>Funded routes to readiness</h2>
                  <div className="actionrow"><span>Accounting / fiscal management TA → lift the ICF rating</span><span className="muted">PPF · regular TC</span></div>
                  <div className="actionrow"><span>Build cash reserves &amp; current savings</span><span className="muted">reform + TC</span></div>
                  <div className="actionrow"><span>Grant / blended finance for adaptation now</span><span className="muted">CCFLA / blended</span></div>
                </div>
                <div className="note">Once the city re-rates (CAPAG B/A), it re-enters the instrument path. Submitting here registers a <b>capacity-building referral</b>, not a loan.</div>
                <div className="btn-row"><button className="btn" onClick={() => goto(4)}>Prepare referral →</button></div>
              </>
            ) : pathway === "pool" && pool ? (
              <>
                <div className="h-stage">Build a financeable portfolio</div>
                <p className="h-sub">The gap between {scored.name}&apos;s project and the instrument&apos;s ticket size is closed by pooling neighbours into one package — portfolio design.</p>
                <div className="note" style={{ marginBottom: 14 }}>Transport: <b>{DATA.cl.transportGap.nActions} actions</b>, best single-city fit {DATA.cl.transportGap.bestFit} — no instrument fits {scored.name} alone.</div>
                <div className="card">
                  <table className="tablelike">
                    <thead><tr><th>Comuna</th><th>Co-finance index</th><th>Readiness</th><th>Role</th></tr></thead>
                    <tbody>
                      {(DATA.cl.comunas as Comuna[]).map((c) => {
                        const cs = SM.scoreSNG(c);
                        return <tr key={c.id} className={c.isAnchor ? "anchor-row" : ""}><td>{c.name}</td><td>{c.cofinanceScore ?? "—"}<span className="muted"> /100</span></td><td><span className={`tier ${cs.tier}`}>{cs.tier}</span></td><td>{c.isAnchor ? <b>Anchor</b> : <span className="muted">Member</span>}</td></tr>;
                      })}
                    </tbody>
                  </table>
                  <div className="grid2" style={{ marginTop: 14 }}>
                    <div className="kv"><span>Pooled ask</span><span>US${pool.pooledProposal.askUSDm}M</span></div>
                    <div className="kv"><span>Pool readiness</span><span><span className={`tier ${poolScored!.tier}`}>{poolScored!.tier}</span> · {poolScored!.eligibility.eligible ? "eligible ✓" : "not eligible"}</span></div>
                  </div>
                </div>
                <div className="btn-row"><button className="btn" onClick={() => goto(4)}>Assemble dossier →</button></div>
              </>
            ) : (
              <>
                <div className="h-stage">Instrument</div>
                <p className="h-sub">{scored.name} is ready and eligible — proceed to the instrument.</p>
                <div className="card"><div className="kv"><span>Instrument</span><span>{SM.activeProfile().instrument}</span></div><div className="kv"><span>Ask</span><span>US${scored.proposal.askUSDm}M</span></div></div>
                <div className="btn-row"><button className="btn" onClick={() => goto(4)}>Assemble dossier →</button></div>
              </>
            )}
          </>
        )}

        {/* 4 — FUNDER INTAKE */}
        {stage === 4 && scored && pathway && (
          <>
            <div className="h-stage">Funder intake</div>
            {!submitState ? (
              <>
                <p className="h-sub">Assemble the machine-readable <b>candidate dossier</b> (Concept Note + creditworthiness + instrument + pool) and submit it to the funder&apos;s pipeline.</p>
                <div className="card">
                  <div className="kv"><span>Candidate</span><span>{pathway === "pool" ? `${scored.name} pool (6 comunas)` : scored.name}</span></div>
                  <div className="kv"><span>Pathway</span><span>{pathway}</span></div>
                  <div className="kv"><span>Target</span><span>{pathway === "capacity-building" ? "Capacity-building / PPF" : SM.activeProfile().instrument}</span></div>
                  <div className="kv"><span>Readiness</span><span>{(pathway === "pool" ? poolScored! : scored).compositeReadiness} · {(pathway === "pool" ? poolScored! : scored).tier}</span></div>
                  <div className="kv"><span>Ask</span><span>US${pathway === "pool" ? pool.pooledProposal.askUSDm : scored.proposal.askUSDm}M</span></div>
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : pathway === "capacity-building" ? "Submit capacity-building referral" : "Submit to funder pipeline"}</button>
                </div>
              </>
            ) : (
              <>
                <p className="h-sub">Submitted — the dossier is now on the funder&apos;s side of the screen.</p>
                <div className="note"><b>{submitState.id}</b> — {scored.name} ({pathway}) is in the funder pipeline.</div>
                <div className="btn-row"><Link href="/pipeline" className="btn">See it in the funder pipeline →</Link></div>
              </>
            )}
          </>
        )}

        {stage > 0 && (
          <div className="btn-row">
            <button className="btn secondary" onClick={() => goto(stage - 1)}>← Back</button>
          </div>
        )}
      </main>
    </div>
  );
}
