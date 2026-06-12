"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import data from "@/data/valdivia.json";
import { SM, Profiles, PILLAR_ORDER, provenanceKind, type Comuna, type Scored } from "@/lib/engine";

const STEPS = [
  { n: 1, key: "enter", title: "Enter", sub: "Your city" },
  { n: 2, key: "discover", title: "Discover", sub: "Funders open" },
  { n: 3, key: "target", title: "Pick target", sub: "Choose a path" },
  { n: 4, key: "diagnose", title: "Diagnose", sub: "Readiness" },
  { n: 5, key: "prepare", title: "Prepare", sub: "Close the gap" },
  { n: 6, key: "pool", title: "Pool", sub: "If too small" },
  { n: 7, key: "submit", title: "Submit", sub: "To the funder" },
];

const comunas = (data as any).comunas as Comuna[];
const hero = comunas.find((c) => c.isAnchor)!;

function ProvBadge({ prov }: { prov: string }) {
  const kind = provenanceKind(prov);
  const label = kind === "real" ? "real" : kind === "intake" ? "intake" : "estimated";
  return <span className={`badge ${kind}`} title={prov}>{label}</span>;
}

function Pillars({ city }: { city: Comuna }) {
  const expl = SM.explainScore(city.readiness);
  return (
    <div>
      {PILLAR_ORDER.map((k) => {
        const e = expl.find((x) => x.key === k)!;
        return (
          <div className="pillar" key={k}>
            <div className="top">
              <span>{SM.PILLAR_LABELS[k]} <ProvBadge prov={city.provenance[k]} /></span>
              <span>{city.readiness[k]}</span>
            </div>
            <div className="bar"><i style={{ width: `${city.readiness[k]}%` }} /></div>
            <div className="meta">contributes {e.points} pts ({Math.round(e.weight * 100)}% weight)</div>
          </div>
        );
      })}
    </div>
  );
}

function Gate({ scored }: { scored: Scored }) {
  const elig = scored.eligibility;
  const profile = SM.activeProfile();
  const labels: Record<string, string> = {};
  profile.projectEligibility.forEach((c: any) => (labels[c.key] = c.label));
  return (
    <div>
      {Object.entries(elig).filter(([k]) => k !== "eligible").map(([k, v]) => (
        <div className="gate" key={k}>
          <span className={`dot ${v ? "pass" : "fail"}`} />
          <span>{labels[k] || k}</span>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const [step, setStep] = useState(1);
  const [target, setTarget] = useState<string | null>(null);
  const [pooled, setPooled] = useState(false);
  const [submitState, setSubmitState] = useState<{ id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const heroScored = useMemo(() => SM.scoreSNG(hero), []);
  const poolScored = useMemo(() => SM.scoreSNG({ ...hero, proposal: (data as any).pool.pooledProposal }), []);
  const profiles = Profiles.listProfiles();

  const max = STEPS.length;
  const go = (n: number) => setStep(Math.min(max, Math.max(1, n)));

  async function submit() {
    setSubmitting(true);
    const handoff = {
      candidateId: pooled ? "POOL-LosRios-U11" : hero.id,
      kind: pooled ? "pool" : "city",
      name: pooled ? (data as any).pool.bundle?.sector ? "Los Ríos unit 11 (transport bundle)" : "Los Ríos pool" : hero.name,
      locode: hero.locode,
      cityId: hero.cityId,
      anchorLocode: (data as any).pool.anchorLocode,
      members: pooled ? (data as any).pool.members.map((m: any) => m.locode).filter(Boolean) : [hero.locode],
      targetProfileId: SM.activeProfile().id,
      compositeReadiness: (pooled ? poolScored : heroScored).compositeReadiness,
      tier: (pooled ? poolScored : heroScored).tier,
      clearancePassed: (pooled ? poolScored : heroScored).canEnterProjectReview,
      proposal: pooled
        ? { title: (data as any).pool.pooledProposal.title, askUSDm: (data as any).pool.pooledProposal.askUSDm, sector: "transport" }
        : { title: hero.proposal.title, askUSDm: hero.proposal.askUSDm, sector: hero.proposal.sector },
      provenance: hero.provenance,
    };
    const res = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(handoff) });
    const rec = await res.json();
    setSubmitState({ id: rec.id });
    setSubmitting(false);
  }

  return (
    <>
      <TopBar active="city" />
      <div className="wrap">
        <div className="hero">
          <h1>Unlock financing for {hero.name}&apos;s climate plan</h1>
          <p>
            See which funders your plan can reach, how ready you are for the <b>IDB Sub-Sovereign Finance Program</b>,
            and what to do next — then submit. Real fiscal signals from the City-Funder Matching Engine, scored live by
            the Readiness Engine.
          </p>
        </div>

        <div className="stepper">
          {STEPS.map((s) => (
            <button key={s.n} className={`step ${step === s.n ? "active" : ""} ${step > s.n ? "done" : ""}`} onClick={() => go(s.n)}>
              <b>{s.title}</b>
              <small>{s.sub}</small>
            </button>
          ))}
        </div>

        {/* STEP 1 — ENTER */}
        {step === 1 && (
          <div className="card">
            <h2>1 · Your city</h2>
            <p className="sub">Loaded from your CityCatalyst profile. <span className="muted">(Live CityCatalyst city-context wiring is Phase 4; here it&apos;s the locode-keyed record.)</span></p>
            <div className="grid2">
              <div>
                <div className="kv"><span>City</span><span>{hero.name}</span></div>
                <div className="kv"><span>UN/LOCODE</span><span>{hero.locode}</span></div>
                <div className="kv"><span>Region</span><span>Región de Los Ríos</span></div>
              </div>
              <div>
                <div className="kv"><span>Population</span><span>{hero.population?.toLocaleString()}</span></div>
                <div className="kv"><span>Country</span><span>Chile (IDB member)</span></div>
                <div className="kv"><span>CityCatalyst id</span><span className="muted" style={{ fontSize: 12 }}>{hero.cityId?.slice(0, 12)}…</span></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — DISCOVER */}
        {step === 2 && (
          <div className="card">
            <h2>2 · Funders your plan can reach</h2>
            <p className="sub">From the City-Funder Matching Engine — instruments matched to {hero.name}&apos;s prioritized actions, tagged by the role you can play.</p>
            <div className="grid2" style={{ marginBottom: 16 }}>
              <div className="note"><b>{(data as any).funders.counts.applicant}</b> funds you can apply to directly · <b>{(data as any).funders.counts.facilitator}</b> facilitator · <b>{(data as any).funders.counts.referrer}</b> referrer-only · <b>{(data as any).funders.counts.total}</b> reachable in total</div>
              <div className="note">IDB SFP appears as a <b>structural debt</b> path for your transport plan — explored in steps 3–6.</div>
            </div>
            <table className="tablelike">
              <thead><tr><th>Program</th><th>Funder</th><th>Role</th></tr></thead>
              <tbody>
                {(data as any).funders.sample.slice(0, 10).map((f: any, i: number) => (
                  <tr key={i}>
                    <td>{f.program}</td>
                    <td className="muted">{f.funder}</td>
                    <td><span className={`badge role-${f.role}`}>{f.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STEP 3 — PICK TARGET */}
        {step === 3 && (
          <div className="card">
            <h2>3 · Pick a financing path</h2>
            <p className="sub">Each path has its own <b>readiness profile</b> — the criteria you&apos;re assessed against. Readiness is target-specific.</p>
            {profiles.map((p: any) => {
              const prof = Profiles.getProfile(p.id);
              const selected = (target || "idb-sfp") === p.id;
              return (
                <div key={p.id} className="card" style={{ borderColor: selected ? "var(--cc-blue)" : undefined, background: selected ? "var(--cc-blue-tint)" : undefined, cursor: p.illustrative ? "not-allowed" : "pointer", opacity: p.illustrative ? 0.6 : 1 }}
                  onClick={() => { if (!p.illustrative) { setTarget(p.id); SM.setActiveProfile(p.id); } }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h3>{prof.funder}{p.illustrative && <span className="muted"> (template)</span>}</h3>
                    {selected && !p.illustrative && <span className="pill-tag">selected</span>}
                  </div>
                  <p className="sub" style={{ marginBottom: 8 }}>{prof.instrument} — {prof.summary}</p>
                  {!p.illustrative && (
                    <div className="muted" style={{ fontSize: 13 }}>
                      Pillars: {prof.pillars.map((pl: any) => `${pl.label} ${Math.round(pl.weight * 100)}%`).join(" · ")}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="note">Same engine, different profile. Other MDBs (CAF, World Bank, GCF) plug in their own criteria — the city app doesn&apos;t change.</div>
          </div>
        )}

        {/* STEP 4 — DIAGNOSE */}
        {step === 4 && (
          <div className="card">
            <h2>4 · Readiness for IDB SFP</h2>
            <p className="sub">Scored live by the Readiness Engine against the IDB profile. Badges show real vs. estimated signals.</p>
            <div className="grid2">
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
                  <span className="scorebig">{heroScored.compositeReadiness}<small>/100</small></span>
                  <span className={`tier ${heroScored.tier}`}>{heroScored.tier}</span>
                </div>
                <Pillars city={hero} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>IDB project-eligibility gate</h3>
                <Gate scored={heroScored} />
                <div className="note" style={{ marginTop: 12 }}>
                  {hero.name} is <b>{heroScored.tier}</b> and cleared on creditworthiness — but its transport project <b>alone</b> is below the US$15M high-impact threshold, so it isn&apos;t project-eligible on its own. That gap is solved in step 6.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — PREPARE */}
        {step === 5 && (
          <div className="card">
            <h2>5 · Close the gap</h2>
            <p className="sub">What each readiness level is routed to — the funded path to becoming loan-ready (IDB Subprogram 2 TC, ~US$13M envelope).</p>
            <table className="tablelike">
              <thead><tr><th>Comuna</th><th>Tier</th><th>Recommended action</th></tr></thead>
              <tbody>
                {comunas.map((c) => {
                  const s = SM.scoreSNG(c);
                  return (
                    <tr key={c.id} className={c.isAnchor ? "anchor-row" : ""}>
                      <td>{c.name}{c.isAnchor && <span className="muted"> (you)</span>}</td>
                      <td><span className={`tier ${s.tier}`}>{s.tier}</span></td>
                      <td className="muted">{s.readinessAction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="note" style={{ marginTop: 14 }}>
              {hero.name}&apos;s gap isn&apos;t readiness — it&apos;s <b>scale</b>. Its neighbours aren&apos;t ready to borrow alone. Pooling (next step) fixes both at once.
            </div>
          </div>
        )}

        {/* STEP 6 — POOL */}
        {step === 6 && (
          <div className="card">
            <h2>6 · The gap becomes the deal</h2>
            <p className="sub">Your transport actions have no instrument that fits {hero.name} alone — so the engine pools the unit into one financeable package.</p>
            <div className="note" style={{ marginBottom: 14 }}>
              Transport: <b>{(data as any).transportGap.nActions} actions</b>, best single-city fit <b>{(data as any).transportGap.bestFit}</b> ({(data as any).transportGap.bestFunder}) — no dedicated instrument. For one city, a dead end.
            </div>
            <table className="tablelike">
              <thead><tr><th>Comuna</th><th>Co-finance</th><th>Readiness</th><th>Role</th></tr></thead>
              <tbody>
                {comunas.map((c) => {
                  const s = SM.scoreSNG(c);
                  return (
                    <tr key={c.id} className={c.isAnchor ? "anchor-row" : ""}>
                      <td>{c.name}</td>
                      <td>{c.cofinanceScore ?? "—"}</td>
                      <td><span className={`tier ${s.tier}`}>{s.tier}</span></td>
                      <td>{c.isAnchor ? <b>Anchor</b> : <span className="muted">Member</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="grid2" style={{ marginTop: 16 }}>
              <div className="kv"><span>Pooled ask</span><span>US${(data as any).pool.pooledProposal.askUSDm}M</span></div>
              <div className="kv"><span>Pool readiness (anchor-led)</span><span><span className={`tier ${poolScored.tier}`}>{poolScored.tier}</span> · {poolScored.eligibility.eligible ? "eligible ✓" : "not eligible"}</span></div>
            </div>
            <div className="btn-row">
              <button className="btn" onClick={() => { setPooled(true); go(7); }}>Use the pooled package →</button>
            </div>
          </div>
        )}

        {/* STEP 7 — SUBMIT */}
        {step === 7 && (
          <div className="card">
            <h2>7 · Submit to IDB</h2>
            {!submitState ? (
              <>
                <p className="sub">This sends a pre-scored candidate to the IDB-side pipeline (the Control Tower), with your CityCatalyst data attached.</p>
                <div className="grid2">
                  <div>
                    <div className="kv"><span>Submitting</span><span>{pooled ? "Pooled package (6 comunas)" : `${hero.name} (city)`}</span></div>
                    <div className="kv"><span>Anchor</span><span>{hero.name}</span></div>
                    <div className="kv"><span>Target</span><span>IDB SFP</span></div>
                  </div>
                  <div>
                    <div className="kv"><span>Readiness</span><span>{(pooled ? poolScored : heroScored).compositeReadiness} · {(pooled ? poolScored : heroScored).tier}</span></div>
                    <div className="kv"><span>Ask</span><span>US${pooled ? (data as any).pool.pooledProposal.askUSDm : hero.proposal.askUSDm}M</span></div>
                    <div className="kv"><span>Eligible</span><span>{(pooled ? poolScored : heroScored).eligibility.eligible ? "Yes ✓" : "No"}</span></div>
                  </div>
                </div>
                {!pooled && <div className="note" style={{ marginTop: 12 }}>Tip: go back to step 6 and use the pooled package — {hero.name} alone isn&apos;t project-eligible (sub-scale).</div>}
                <div className="btn-row">
                  <button className="btn" onClick={submit} disabled={submitting || !(pooled ? poolScored : heroScored).eligibility.eligible}>
                    {submitting ? "Submitting…" : "Submit to IDB pipeline"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="sub">Submitted. The candidate is now on the funder&apos;s side of the screen.</p>
                <div className="note"><b>{submitState.id}</b> — {pooled ? "Los Ríos transport pool" : hero.name} is in the IDB pipeline.</div>
                <div className="btn-row">
                  <Link href="/pipeline" className="btn">See it in the funder pipeline →</Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Nav */}
        <div className="btn-row">
          {step > 1 && <button className="btn secondary" onClick={() => go(step - 1)}>← Back</button>}
          {step < max && <button className="btn" onClick={() => go(step + 1)}>Next →</button>}
        </div>
      </div>
    </>
  );
}
