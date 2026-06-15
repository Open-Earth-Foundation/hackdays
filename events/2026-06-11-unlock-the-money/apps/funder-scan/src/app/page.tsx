import { getNational, getValdivia } from "@/lib/data";
import MapPanel from "@/components/MapPanel";
import SiteNav from "@/components/SiteNav";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function Home() {
  const nat = getNational();
  const val = getValdivia();
  const k = nat.kpis;

  // Los Ríos region slice for beat 2
  const losRios = (nat.comunas as { region: string; unit_id: string; comuna: string }[]).filter(
    (c) => c.region?.includes("Los Ríos")
  );
  const losRiosUnits = new Set(losRios.map((c) => c.unit_id)).size;

  return (
    <>
      <SiteNav />
      <main>
      {/* ===================== HERO / BEAT 1 ===================== */}
      <section id="overview" className="hero">
        <div className="wrap">
          <div className="eyebrow">OpenEarth · Unlock the Money · Chile</div>
          <h1>The same engine that returns &ldquo;no match&rdquo; for one city returns a financeable deal for six.</h1>
          <p>
            Cities have needs, funders have instruments, and the matching is manual today. We built the
            engine that does it automatically — and the interesting part isn&rsquo;t the easy matches, it&rsquo;s
            the <strong style={{ color: "#fff" }}>gaps</strong>, pooled into deals.
          </p>

          <div className="kpi-row">
            <div className="kpi">
              <div className="num">{k.viable_anchors}</div>
              <div className="label">viable pools — regions with an anchor that can hold a deal</div>
            </div>
            <div className="kpi">
              <div className="num">{k.feasible_bundles}</div>
              <div className="label">candidate bundles a city couldn&rsquo;t finance alone</div>
            </div>
            <div className="kpi">
              <div className="num">{fmt(k.passengers)}</div>
              <div className="label">&ldquo;passenger&rdquo; comunas that pooling pulls into a deal</div>
            </div>
          </div>
        </div>
      </section>

      {/* national map */}
      <section id="national" className="beat">
        <div className="wrap">
          <span className="beat-tag">Beat 1 · The national pipeline</span>
          <h2>One computation, every region in Chile</h2>
          <p className="lead">
            Each comuna shaded by its role in a financeable pool: who can <strong>anchor</strong> a deal,
            who rides along in a viable pool, and who is served individually by grants and technical
            assistance. {k.units} coordination units · {k.viable_anchors} with a viable anchor.
          </p>

          <div className="map-grid" style={{ marginTop: 28 }}>
            <div>
              <MapPanel url="/data/comunas.geojson" mode="national" height={680} />
              <div className="legend">
                <span><i className="dot" style={{ background: "var(--anchor)" }} /> anchor (can lead a deal)</span>
                <span><i className="dot" style={{ background: "var(--pooled)" }} /> in a viable pool</span>
                <span><i className="dot" style={{ background: "var(--needs-ta)" }} /> needs TA (no anchor)</span>
                <span><i className="dot" style={{ background: "var(--unscored)" }} /> not scored</span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
              <div className="panel">
                <h3 style={{ fontSize: 18, marginBottom: 14 }}>Feasible bundles by sector</h3>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th className="num-cell">🟢 capex</th>
                      <th className="num-cell">🟡 prep</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nat.bundle_table.map((r) => (
                      <tr key={r.sector}>
                        <td>{r.sector}</td>
                        <td className="num-cell">{r.highly_coordinated}</td>
                        <td className="num-cell">{r.semi_coordinated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="panel">
                <h3 style={{ fontSize: 18, marginBottom: 14 }}>Largest energy-capex pools</h3>
                <table className="tbl">
                  <thead>
                    <tr><th>Anchor</th><th>Region</th><th className="num-cell">Comunas</th></tr>
                  </thead>
                  <tbody>
                    {nat.flagship.map((f) => (
                      <tr key={f.anchor}>
                        <td>{f.anchor}</td>
                        <td className="muted">{f.region.replace("Región de ", "").replace("Región del ", "")}</td>
                        <td className="num-cell">{f.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="callout" style={{ marginTop: 28 }}>
            <strong>Candidate pipeline, not costed deals.</strong> These are poolable by structure;
            amounts (adequacy) and award rates (competitiveness) are flagged 🔴, not faked — and demand
            is a proxy, not per-comuna HIAP yet. That honesty is what a funder trusts.
          </div>
        </div>
      </section>

      {/* ===================== BEAT 2 — REGION ===================== */}
      <section id="region" className="beat">
        <div className="wrap">
          <span className="beat-tag">Beat 2 · Drill into a region</span>
          <h2>Los Ríos, in miniature</h2>
          <p className="lead">
            {losRios.length} comunas across {losRiosUnits} coordination units. The region view is the
            buyer a development bank actually wants: a ready, pre-bundled pipeline. Valdivia anchors
            unit 11 — let&rsquo;s meet it.
          </p>
        </div>
      </section>

      {/* ===================== BEAT 3 — CITY ===================== */}
      <section id="valdivia" className="beat">
        <div className="wrap">
          <span className="beat-tag">Beat 3 · Meet the city</span>
          <h2>Valdivia — funders open to you</h2>
          <p className="lead">
            Population {fmt(val.profile.population)} · FCM transfer-dependency {val.profile.fcm_dependency_pct}%.
            Across {val.actions.total} plan actions, the engine first answers a question the city spends
            weeks on manually: <em>which funders can I actually hold?</em>
          </p>

          <div className="grid-3" style={{ marginTop: 28 }}>
            <RoleCard role="applicant" count={val.funders_count.applicant} label="you can apply directly" />
            <RoleCard role="facilitator" count={val.funders_count.facilitator} label="you can only facilitate" />
            <RoleCard role="referrer" count={val.funders_count.referrer} label="you can only refer (the actor gap)" />
          </div>

          <div className="panel" style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>The actor gap — the #1 error mode</h3>
            <p className="muted" style={{ fontSize: 15, marginTop: 0 }}>
              {val.actions.referrer} of {val.actions.total} actions match a fund on sector — but the eligible
              applicant is a firm or household, so the municipality legally can&rsquo;t hold it. Without the role
              tag these look like matches. The tag turns a false &ldquo;yes&rdquo; into the right move: refer your
              local firms.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              {Object.entries(val.blocked_by).map(([f, n]) => (
                <span key={f} className="chip chip-referrer">{n} → {f.replace(/\s*\(.*\)/, "")}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BEAT 4 — THE GAP ===================== */}
      <section id="gap" className="beat">
        <div className="wrap">
          <span className="beat-tag">Beat 4 · The gap</span>
          <h2>Where one city stops: transport</h2>
          <p className="lead">
            Valdivia&rsquo;s {val.transport.n_actions} transport actions (e-buses, BRT, modal shift) have{" "}
            <strong>no dedicated instrument</strong>. The best the engine can find is a generic risk-prevention
            program — fit <strong>{val.transport.best_af.toFixed(2)}</strong>. For one city, a dead end.
          </p>

          <div className="panel" style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={{ fontSize: 18 }}>Transport playbook</h3>
              <span className="muted" style={{ fontSize: 14 }}>
                best fit: {val.transport.best_inst} · {val.transport.best_af.toFixed(2)}
              </span>
            </div>
            {val.transport.actions.map((a, i) => (
              <div key={i} className="action-line">
                <span>{a.action}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${a.af * 100}%`, background: a.af < 0.65 ? "var(--needs-ta)" : "var(--pooled)" }} />
                </div>
                <span className="num-cell" style={{ fontVariantNumeric: "tabular-nums" }}>{a.af.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== BEAT 5 — THE POOL ===================== */}
      <section id="pool" className="beat">
        <div className="wrap">
          <span className="beat-tag">Beat 5 · The payoff</span>
          <h2>The gap becomes the deal</h2>
          <p className="lead">
            Transport is a 🟢 highly-coordinated action — standardized enough to underwrite as one package.
            So the engine doesn&rsquo;t stop at &ldquo;no match.&rdquo; It pools Valdivia with its unit-11 neighbours
            into one procurement, anchored on the only comuna with the balance sheet to lead.
          </p>

          <div className="grid-2" style={{ marginTop: 28 }}>
            <MapPanel url="/data/losrios.geojson" mode="losrios" height={420} />
            <div className="panel">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Comuna</th>
                    <th className="num-cell">Population</th>
                    <th className="num-cell">FCM dep.</th>
                    <th className="num-cell">Co-finance</th>
                  </tr>
                </thead>
                <tbody>
                  {val.pool.map((p) => (
                    <tr key={p.comuna} className={p.is_anchor ? "anchor-row" : ""}>
                      <td>{p.comuna}{p.is_anchor ? " · anchor" : ""}</td>
                      <td className="num-cell">{p.population ? fmt(p.population) : "—"}</td>
                      <td className="num-cell">{p.fcm_dependency_pct != null ? `${Math.round(p.fcm_dependency_pct)}%` : "—"}</td>
                      <td className="num-cell">{p.cofinance_score ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="muted" style={{ fontSize: 14, marginTop: 14, marginBottom: 0 }}>
                Corral — 5,493 people, 88% transfer-dependent, co-finance 10.7 — could never lead a
                development-bank deal. Valdivia (65.7) can. Pooling lets the small comunas ride the
                anchor&rsquo;s balance sheet.
              </p>
            </div>
          </div>

          <div className="closing" style={{ marginTop: 36 }}>
            The same engine that returned <em>&ldquo;no match&rdquo;</em> for Valdivia alone returns a financeable
            package for six comunas — and a pipeline of <em>{k.feasible_bundles}</em> for the country.
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          OpenEarth Foundation · City ↔ Funder Matching · Chile prototype. Figures generated from{" "}
          <code>data/derived/</code> via <code>scripts/build_data.py</code>; reproducible in{" "}
          <code>notebooks/analyze.ipynb</code>. Green scored · red flagged, not faked.
        </div>
      </footer>
      </main>
    </>
  );
}

function RoleCard({ role, count, label }: { role: "applicant" | "facilitator" | "referrer"; count: number; label: string }) {
  return (
    <div className="panel">
      <div className="role-head">
        <span className="count">{count}</span>
        <span className={`chip chip-${role}`}>{role}</span>
      </div>
      <div className="muted" style={{ fontSize: 15 }}>{label}</div>
    </div>
  );
}
