"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar, { type StageDef } from "@/components/Sidebar";
import MapView from "@/components/MapView";
import { SCOPES, mapPoints, scopeLegend, journeyCity, DATA } from "@/lib/adapters";
import { SM, provenanceKind, type Scored, type Comuna } from "@/lib/engine";
import { getCityContext, agentAssist } from "@/lib/context";
import { assembleDossier } from "@/lib/dossier";
import { FUNDERS, getFunder } from "@/lib/funders";

const STAGES: StageDef[] = [
  { key: "explore", title: "Explore", sub: "Region & data" },
  { key: "context", title: "City context", sub: "From CityCatalyst" },
  { key: "instrument", title: "Find financing", sub: "Funder · program · instrument" },
  { key: "readiness", title: "Readiness pathways", sub: "Assess & route" },
  { key: "portfolio", title: "Portfolio", sub: "Reach the ticket" },
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
  const [viewLevel, setViewLevel] = useState<"cities" | "state">("cities");
  const [cityId, setCityId] = useState<string | null>(null);
  const [entry, setEntry] = useState<"entity" | "project">("entity");
  const [selFunderId, setSelFunderId] = useState<string | null>(null);
  const [selProgramId, setSelProgramId] = useState<string | null>(null);
  const [selInstrumentId, setSelInstrumentId] = useState<string | null>(null);
  const [portfolioMode, setPortfolioMode] = useState<"intra" | "cross">("intra");
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

  const selFunder = getFunder(selFunderId);
  const selProgram = selFunder?.programs.find((p) => p.id === selProgramId) || null;
  const selInstrument = selProgram?.instruments.find((i) => i.id === selInstrumentId) || null;
  const instrLabel = selProgram && selInstrument ? `${selProgram.name} · ${selInstrument.name}` : SM.activeProfile().instrument;

  // Cross-city pool (Chile) and intra-city portfolio (the city's own projects).
  const pool = scopeId === "cl-losrios" ? DATA.cl.pool : null;
  const poolScored = scored && pool ? SM.scoreSNG({ ...(scored as any), proposal: pool.pooledProposal }) : null;
  const intraTotal = ctx ? ctx.projects.reduce((a, p) => a + p.askUSDm, 0) : 0;
  const intraScored = scored && ctx ? SM.scoreSNG({ ...(scored as any), proposal: { title: `${scored.name} climate portfolio`, sector: "multi-sector", askUSDm: intraTotal, stage: "Structuring", cofinance: true } }) : null;

  function goto(i: number) { setStage(i); setMaxReached((m) => Math.max(m, i)); }
  function pickCity(id: string) { setCityId(id); setSubmitState(null); setSelFunderId(null); setSelProgramId(null); setSelInstrumentId(null); goto(1); }

  // Region-level summary (the "state layer").
  const regionSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of points) counts[p.tier] = (counts[p.tier] || 0) + 1;
    return counts;
  }, [points]);

  async function submit() {
    if (!scored || !pathway) return;
    setSubmitting(true);
    let opts: any;
    if (pathway === "capacity-building") {
      opts = { scored, kind: "city", pathway: "capacity-building", instrumentName: "Capacity-building / PPF + blended finance", pool: null, proposal: scored.proposal };
    } else if (portfolioMode === "cross" && pool) {
      opts = { scored: poolScored, kind: "pool", pathway: "pool", instrumentName: instrLabel,
        pool: { anchor: scored.name, members: pool.members.map((m: any) => ({ name: m.name, role: m.isAnchor ? "anchor" : "member", cofinance: m.cofinanceScore })) },
        proposal: pool.pooledProposal };
    } else {
      opts = { scored: intraScored, kind: "city", pathway: "instrument", pool: null, instrumentName: instrLabel,
        proposal: { title: `${scored.name} climate portfolio (${ctx!.projects.length} projects)`, sector: "multi-sector", askUSDm: intraTotal, cofinance: true } };
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
        <div className="crumbs">{scope.country} · {scope.region} · adapter: {scope.adapter}{scored ? ` · ${scored.name}` : ""}</div>

        {/* 0 — EXPLORE */}
        {stage === 0 && (
          <>
            <div className="h-stage">Explore financial readiness</div>
            <p className="h-sub">Identity &amp; context for a city come from <b>CityCatalyst</b> (inventory, CCRA, HIAP, plan). Here — for the demo — pick a region and a city to open its readiness journey.</p>

            <div className="scopebar">
              {SCOPES.map((s) => (
                <button key={s.id} className={`scopebtn ${s.id === scopeId ? "active" : ""}`} onClick={() => { setScopeId(s.id); setCityId(null); }}>
                  {s.country} · {s.region}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              <div className="entrytoggle" style={{ marginBottom: 0 }}>
                <button className={viewLevel === "state" ? "active" : ""} onClick={() => setViewLevel("state")}>State / region</button>
                <button className={viewLevel === "cities" ? "active" : ""} onClick={() => setViewLevel("cities")}>Cities</button>
              </div>
              <label className="muted" style={{ fontSize: 12 }}>
                Data source:{" "}
                <select defaultValue="src" style={{ font: "inherit", fontSize: 12, padding: "4px 8px", borderRadius: 7, border: "1px solid var(--line)" }}>
                  <option value="src">{scope.adapter}</option>
                  <option value="import" disabled>Import data…</option>
                </select>
              </label>
            </div>

            <MapView scopeId={scopeId} points={points} center={scope.center} zoom={scope.zoom} onSelect={pickCity} />
            <div className="maplegend">
              {legend.map((l) => <span key={l.cls}><i className={`dot-${l.cls}`} />{l.label}</span>)}
            </div>

            {viewLevel === "state" ? (
              <div className="card" style={{ marginTop: 16 }}>
                <h2>{scope.region} — region readiness summary</h2>
                <p className="sub">Aggregate across the region (from {scope.adapter}). Useful for a GORE / state / development bank scanning where to act.</p>
                {Object.entries(regionSummary).map(([t, n]) => (
                  <div className="kv" key={t}><span><i className={`dot-${t}`} style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, marginRight: 6 }} />{t}</span><span>{n} {n === 1 ? "city" : "cities"}</span></div>
                ))}
                <div className="note" style={{ marginTop: 12 }}>Switch to <b>Cities</b> to open an individual city&apos;s readiness journey.</div>
              </div>
            ) : (
              <div className="card" style={{ marginTop: 16 }}>
                <h2>Open a city</h2>
                <p className="sub">Cities with a full readiness profile in this region:</p>
                {points.filter((p) => p.journeyable).map((p) => (
                  <div className="actionrow" key={p.id}>
                    <span><b>{p.name}</b> <span className="muted">· {p.capag ? `CAPAG ${p.capag}` : p.tier}</span></span>
                    <button className="btn" style={{ padding: "6px 14px" }} onClick={() => pickCity(p.id)}>Open →</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 1 — CITY CONTEXT */}
        {stage === 1 && scored && ctx && (
          <>
            <div className="h-stage">{scored.name}</div>
            <p className="h-sub">Loaded from {scored.name}&apos;s CityCatalyst context. <span className="muted">(Live CityCatalyst MCP wiring is the seam; here it&apos;s simulated.)</span></p>
            <div className="entrytoggle">
              <button className={entry === "entity" ? "active" : ""} onClick={() => setEntry("entity")}>Entity-first (a loan for the city)</button>
              <button className={entry === "project" ? "active" : ""} onClick={() => setEntry("project")}>Project-first (fund a project)</button>
            </div>
            <div className="grid2">
              <div className="card">
                <h2>GHG inventory</h2>
                <p className="sub">{ctx.inventory.source} · {ctx.inventory.year}</p>
                {ctx.inventory.topSectors.map((s) => <div className="kv" key={s.sector}><span>{s.sector}</span><span>{s.sharePct}%</span></div>)}
              </div>
              <div className="card">
                <h2>CCRA — climate risk</h2>
                <p className="sub">{ctx.ccra.source}</p>
                {ctx.ccra.hazards.map((h) => <div className="kv" key={h.hazard}><span>{h.hazard}</span><span className={`tier ${h.risk === "high" ? "Early" : h.risk === "medium" ? "Developing" : "Ready"}`}>{h.risk}</span></div>)}
              </div>
              <div className="card">
                <h2>HIAP priorities</h2>
                <p className="sub">Top prioritized climate actions</p>
                {ctx.hiap.map((a) => <div className="actionrow" key={a.actionId}><span>{a.rank}. {a.name}</span><span className={`atype ${a.type}`}>{a.type}</span></div>)}
              </div>
              <div className="card">
                <h2>Climate plan</h2>
                <p className="sub">{ctx.plan.status}</p>
                <div className="kv"><span>Plan</span><span>{ctx.plan.name}</span></div>
                <div className="kv"><span>Actions</span><span>{ctx.plan.actionsCount}</span></div>
                <div className="kv"><span>Own project pipeline</span><span>{ctx.projects.length} projects</span></div>
              </div>
            </div>
            {entry === "project" && (
              <div className="note">Project-first: <b>import a prepared project</b> (a Concept Note from the <b>Project Preparator</b>) — it enters at the Portfolio step. <button className="btn secondary" style={{ marginLeft: 10, padding: "5px 12px" }} disabled>Import project from Preparator (mock)</button></div>
            )}
            <div className="btn-row"><button className="btn" onClick={() => goto(2)}>Find financing →</button></div>
          </>
        )}

        {/* 2 — FIND FINANCING (funder navigator: funder → program → instrument) */}
        {stage === 2 && scored && (
          <>
            <div className="h-stage">Find a financing line</div>
            <p className="h-sub">Readiness is specific to the product. Drill down <b>funder → program → instrument</b>. {entry === "entity" ? "Entity-first: a direct line for the city." : "Project-first: also surfaces grants & PPFs via the matching service / Preparator."}</p>

            <div className="crumbs" style={{ marginBottom: 12 }}>
              {selFunder ? <b>{selFunder.short}</b> : "Funder"} › {selProgram ? <b>{selProgram.name}</b> : "Program"} › {selInstrument ? <b>{selInstrument.name}</b> : "Instrument"}
            </div>

            <div className="card">
              <h2>1 · Funder</h2>
              {FUNDERS.map((f) => (
                <div key={f.id} className="actionrow">
                  <span>{f.name} {f.template && <span className="pill-tag">template</span>}</span>
                  <button className={`btn ${selFunderId === f.id ? "" : "secondary"}`} style={{ padding: "5px 12px" }} disabled={f.template} onClick={() => { setSelFunderId(f.id); setSelProgramId(null); setSelInstrumentId(null); }}>
                    {selFunderId === f.id ? "Selected" : f.template ? "Coming soon" : "Select"}
                  </button>
                </div>
              ))}
            </div>

            {selFunder && (
              <div className="card">
                <h2>2 · Program <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>within {selFunder.short}</span></h2>
                {selFunder.programs.map((p) => (
                  <div key={p.id} className={`card pathcard ${selProgramId === p.id ? "ok" : ""}`} style={{ marginBottom: 10, cursor: "pointer", borderColor: selProgramId === p.id ? "var(--cc-blue)" : undefined }} onClick={() => { setSelProgramId(p.id); setSelInstrumentId(null); SM.setActiveProfile(p.profileId); }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><h2 style={{ fontSize: 16 }}>{p.name}</h2>{selProgramId === p.id && <span className="pill-tag">selected</span>}</div>
                    <p className="sub" style={{ marginBottom: p.eligibilityNote && selProgramId === p.id ? 8 : 0 }}>{p.summary}</p>
                    {p.eligibilityNote && selProgramId === p.id && <div className="note">{p.eligibilityNote}</div>}
                  </div>
                ))}
              </div>
            )}

            {selProgram && (
              <div className="card">
                <h2>3 · Instrument <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>within {selProgram.name}</span></h2>
                {selProgram.instruments.map((i) => (
                  <div key={i.id} className="actionrow">
                    <span><b>{i.name}</b> {i.note && <span className="muted">· {i.note}</span>}</span>
                    <button className={`btn ${selInstrumentId === i.id ? "" : "secondary"}`} style={{ padding: "5px 12px" }} onClick={() => setSelInstrumentId(i.id)}>{selInstrumentId === i.id ? "Selected" : "Select"}</button>
                  </div>
                ))}
              </div>
            )}

            <div className="note" style={{ background: "#f1f5f9", color: "#475569" }}>Fed by the <b>funder sourcing service</b> — a converged catalog (today fragmented across CityCatalyst + the hackday apps). Mock for the demo.</div>
            <div className="btn-row"><button className="btn" disabled={!selInstrumentId} onClick={() => goto(3)}>Assess readiness against {selFunder ? selFunder.short : "—"}{selProgram ? ` · ${selProgram.name}` : ""} →</button></div>
          </>
        )}

        {/* 3 — READINESS PATHWAYS */}
        {stage === 3 && scored && (
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
                  {pathway === "instrument" && <p className="sub">Ready and eligible — proceed to the instrument.</p>}
                  {pathway === "pool" && <p className="sub"><b>Ready, but a single project is sub-scale.</b> Reach the ticket size via a <b>portfolio</b> — the city&apos;s own projects, or pooling with neighbours.</p>}
                  {pathway === "capacity-building" && <p className="sub"><b>Not yet eligible.</b> Route → <b>capacity-building</b> before the instrument. Not a debt problem — see the signals.</p>}
                </div>
              </div>
            </div>
            {(() => { const a = agentAssist({ cityName: scored.name, tier: scored.tier, cleared: scored.canEnterProjectReview, pathway: pathway! });
              return <div className="agent"><div className="who">CityCatalyst agent <span className="sim">simulated</span></div>{a.text}</div>; })()}
            <div className="btn-row"><button className="btn" onClick={() => goto(4)}>{pathway === "capacity-building" ? "See capacity-building track →" : "Build the portfolio →"}</button></div>
          </>
        )}

        {/* 4 — PORTFOLIO / CAPACITY */}
        {stage === 4 && scored && ctx && (
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
                <div className="btn-row"><button className="btn" onClick={() => goto(5)}>Prepare referral →</button></div>
              </>
            ) : (
              <>
                <div className="h-stage">Build a financeable portfolio</div>
                <p className="h-sub">A single project is below the {SM.activeProfile().funder} ticket size. Two ways to reach it:</p>
                <div className="entrytoggle">
                  <button className={portfolioMode === "intra" ? "active" : ""} onClick={() => setPortfolioMode("intra")}>Intra-city portfolio</button>
                  <button className={portfolioMode === "cross" ? "active" : ""} onClick={() => setPortfolioMode("cross")}>Cross-city pool</button>
                </div>

                {portfolioMode === "intra" ? (
                  <div className="card">
                    <h2>{scored.name}&apos;s own projects</h2>
                    <p className="sub">Bundle the city&apos;s own pipeline into one financeable portfolio — a single creditworthy borrower.</p>
                    <table className="tablelike">
                      <thead><tr><th>Project</th><th>Sector</th><th>Ask</th></tr></thead>
                      <tbody>{ctx.projects.map((p) => <tr key={p.title}><td>{p.title}</td><td className="muted">{p.sector}</td><td>US${p.askUSDm}M</td></tr>)}</tbody>
                    </table>
                    <div className="grid2" style={{ marginTop: 14 }}>
                      <div className="kv"><span>Portfolio ask</span><span>US${intraTotal}M</span></div>
                      <div className="kv"><span>Readiness</span><span><span className={`tier ${intraScored!.tier}`}>{intraScored!.tier}</span> · {intraScored!.eligibility.eligible ? "eligible ✓" : "not eligible"}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <h2>Pool with neighbouring cities</h2>
                    <p className="sub">Pool credit lines across cities — {scored.name} anchors; small comunas ride the anchor. Other cities&apos; readiness shown.</p>
                    <table className="tablelike">
                      <thead><tr><th>City</th><th>Co-finance</th><th>Readiness</th><th>Role</th></tr></thead>
                      <tbody>{(DATA.cl.comunas as Comuna[]).map((c) => { const cs = SM.scoreSNG(c); return <tr key={c.id} className={c.isAnchor ? "anchor-row" : ""}><td>{c.name}</td><td>{c.cofinanceScore ?? "—"}<span className="muted"> /100</span></td><td><span className={`tier ${cs.tier}`}>{cs.tier}</span></td><td>{c.isAnchor ? <b>Anchor</b> : <span className="muted">Member</span>}</td></tr>; })}</tbody>
                    </table>
                    <div className="grid2" style={{ marginTop: 14 }}>
                      <div className="kv"><span>Pooled ask</span><span>US${pool!.pooledProposal.askUSDm}M</span></div>
                      <div className="kv"><span>Pool readiness</span><span><span className={`tier ${poolScored!.tier}`}>{poolScored!.tier}</span> · {poolScored!.eligibility.eligible ? "eligible ✓" : "not eligible"}</span></div>
                    </div>
                  </div>
                )}
                <div className="note">{portfolioMode === "intra" ? "Intra-city: one ready city, its own projects — cleanest path to the ticket." : "Cross-city: a pooled pipeline for a region / development bank — the deal that no single small city could reach alone."}</div>
                <div className="btn-row"><button className="btn" onClick={() => goto(5)}>Assemble dossier →</button></div>
              </>
            )}
          </>
        )}

        {/* 5 — FUNDER INTAKE */}
        {stage === 5 && scored && pathway && (
          <>
            <div className="h-stage">Funder intake</div>
            {!submitState ? (
              <>
                <p className="h-sub">Assemble the machine-readable <b>candidate dossier</b> (Concept Note + creditworthiness + portfolio) and submit it to the funder&apos;s pipeline.</p>
                <div className="card">
                  <div className="kv"><span>Candidate</span><span>{pathway === "capacity-building" ? scored.name : portfolioMode === "cross" ? `${scored.name} pool (6 cities)` : `${scored.name} portfolio (${ctx!.projects.length} projects)`}</span></div>
                  <div className="kv"><span>Pathway</span><span>{pathway === "capacity-building" ? "capacity-building" : portfolioMode === "cross" ? "cross-city pool" : "intra-city portfolio"}</span></div>
                  <div className="kv"><span>Target</span><span>{pathway === "capacity-building" ? "Capacity-building / PPF" : SM.activeProfile().instrument}</span></div>
                  <div className="kv"><span>Ask</span><span>US${pathway === "capacity-building" ? scored.proposal.askUSDm : portfolioMode === "cross" ? pool!.pooledProposal.askUSDm : intraTotal}M</span></div>
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : pathway === "capacity-building" ? "Submit capacity-building referral" : "Submit to funder pipeline"}</button>
                </div>
              </>
            ) : (
              <>
                <p className="h-sub">Submitted — the dossier is now on the funder&apos;s side of the screen.</p>
                <div className="note"><b>{submitState.id}</b> — {scored.name} is in the funder pipeline.</div>
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
