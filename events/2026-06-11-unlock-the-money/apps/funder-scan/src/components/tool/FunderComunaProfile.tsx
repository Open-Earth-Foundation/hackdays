"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ComunaFundModal } from "@/components/tool/ComunaFundModal";
import { NavBack, ToolNav } from "@/components/tool/ToolNav";
import { locodeToSlug, sectorLabels } from "@/lib/tool/chile-regions";
import { similarComunas } from "@/lib/tool/filter-comunas";
import { matchComunaForBrowse } from "@/lib/tool/match-engine";
import type { ChileComuna, ChileFund, InstrumentMatch, ValdiviaDetail, ValdiviaInstrument } from "@/lib/tool/types";

type Tab = "overview" | "pool" | "instruments";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "ti-info-circle" },
  { id: "pool", label: "Pool & unit", icon: "ti-stack-2" },
  { id: "instruments", label: "Instruments", icon: "ti-cash" },
];

function poolBadgeClass(status?: string) {
  if (status === "anchor") return "comuna-tag comuna-tag-anchor";
  if (status === "in viable pool") return "comuna-tag comuna-tag-pool";
  return "comuna-tag comuna-tag-ta";
}

function cofinancePct(score: number | null | undefined) {
  if (score == null) return 0;
  return Math.min(100, Math.round((score / 70) * 100));
}

export function FunderComunaProfile({
  comuna,
  allComunas,
  funds,
  valdiviaInstruments,
  valdiviaDetail,
}: {
  comuna: ChileComuna;
  allComunas: ChileComuna[];
  funds: ChileFund[];
  valdiviaInstruments: ValdiviaInstrument[];
  valdiviaDetail: ValdiviaDetail | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [modalOpen, setModalOpen] = useState(false);

  const isValdivia = comuna.locode === "CL ZAL";
  const sectors = sectorLabels(comuna.salientSectors);
  const similar = similarComunas(comuna, allComunas);

  const unitMembers = useMemo(() => {
    if (!comuna.unitId) return [];
    return allComunas
      .filter((c) => c.unitId === comuna.unitId)
      .sort((a, b) => (b.cofinanceScore ?? -1) - (a.cofinanceScore ?? -1));
  }, [allComunas, comuna.unitId]);

  const matches: InstrumentMatch[] = useMemo(
    () => matchComunaForBrowse(comuna, funds, valdiviaInstruments, 6),
    [comuna, funds, valdiviaInstruments],
  );

  const intro = isValdivia
    ? `Valdivia (pop. ${comuna.population?.toLocaleString() ?? "166,958"}) anchors unit-11 in Los Ríos — the demo city for the Chile engine. ${valdiviaDetail?.funders_count.applicant ?? 52} instruments accept the municipality as applicant; transport actions top out at ${valdiviaDetail?.transport.best_af.toFixed(2) ?? "0.61"} action-fit without a dedicated instrument.`
    : `${comuna.name} is scored in the national coordination engine (${comuna.region}). Pool status reflects whether this comuna can anchor a deal, ride in a viable pool, or needs technical assistance before bundling.`;

  return (
    <>
      <ToolNav right={<NavBack href="/tool/funder/search" label="Back to search" />} />

      <div className="comuna-hero">
        <div className="container">
          <Link href="/tool/funder/search" className="comuna-breadcrumb">
            <i className="ti ti-arrow-left" /> All comunas
          </Link>

          <div className="comuna-hero-grid">
            <div>
              <p className="comuna-hero-eyebrow">Chile · {comuna.region}</p>
              <h1 className="comuna-hero-name">{comuna.name}</h1>
              <div className="comuna-hero-badges">
                {comuna.poolStatus && (
                  <span className="comuna-hero-badge">{comuna.poolStatus}</span>
                )}
                {comuna.unitId && (
                  <span className="comuna-hero-badge">Unit {comuna.unitId}</span>
                )}
                {sectors.map((s) => (
                  <span key={s} className="comuna-hero-badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="comuna-hero-stats">
              <div className="comuna-hero-stat">
                <span className="comuna-hero-stat-value">
                  {comuna.population != null ? comuna.population.toLocaleString() : "—"}
                </span>
                <span className="comuna-hero-stat-label">Population</span>
              </div>
              <div className="comuna-hero-stat">
                <span className="comuna-hero-stat-value">
                  {comuna.cofinanceScore != null ? comuna.cofinanceScore.toFixed(1) : "—"}
                </span>
                <span className="comuna-hero-stat-label">Co-finance score</span>
              </div>
              <div className="comuna-hero-stat">
                <span className="comuna-hero-stat-value">{comuna.fiscalBand.charAt(0)}</span>
                <span className="comuna-hero-stat-label">Fiscal tier</span>
              </div>
              <div className="comuna-hero-stat">
                <span className="comuna-hero-stat-value">
                  {comuna.fcmDependencyPct != null ? `${comuna.fcmDependencyPct.toFixed(0)}%` : "—"}
                </span>
                <span className="comuna-hero-stat-label">FCM dependency</span>
              </div>
            </div>
          </div>

          <div className="comuna-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`comuna-tab${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <i className={`ti ${t.icon}`} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="comuna-body">
        <div className="container comuna-body-inner">
          {tab === "overview" && (
            <>
              <div className="comuna-section">
                <div className="comuna-section-title">
                  <i className="ti ti-building-community" /> Municipal profile
                </div>
                <p className="comuna-section-lead">{intro}</p>
                <span className="comuna-honesty-chip">
                  <i className="ti ti-info-circle" /> Scored pipeline — not a costed deal
                </span>
              </div>

              <div className="comuna-cred-grid">
                <div className="comuna-cred-item">
                  <div className="comuna-cred-value">{comuna.compositeScore?.toFixed(1) ?? "—"}</div>
                  <div className="comuna-cred-label">Composite score</div>
                  <div className="comuna-cred-sub">Engine capacity index</div>
                </div>
                <div className="comuna-cred-item">
                  <div className="comuna-cred-value">{comuna.anchorScore?.toFixed(1) ?? "—"}</div>
                  <div className="comuna-cred-label">Anchor score</div>
                  <div className="comuna-cred-sub">Pool leadership potential</div>
                </div>
                <div className="comuna-cred-item">
                  <div className="comuna-cred-value">
                    {comuna.professionalizationPct != null
                      ? `${comuna.professionalizationPct.toFixed(0)}%`
                      : "—"}
                  </div>
                  <div className="comuna-cred-label">Professionalization</div>
                  <div className="comuna-cred-sub">Municipal staff share</div>
                </div>
              </div>

              <div className="comuna-section">
                <div className="comuna-section-title">
                  <i className="ti ti-chart-bar" /> Capacity &amp; fiscal health
                </div>
                <div className="comuna-metrics-grid">
                  <div className="comuna-metric-row">
                    <span className="comuna-metric-key">Institutional capacity</span>
                    <span className="comuna-metric-val">{comuna.capacityBand}</span>
                  </div>
                  <div className="comuna-metric-row">
                    <span className="comuna-metric-key">Fiscal band</span>
                    <span className="comuna-metric-val">{comuna.fiscalBand}</span>
                  </div>
                  <div className="comuna-metric-row">
                    <span className="comuna-metric-key">Population band</span>
                    <span className="comuna-metric-val">{comuna.populationBand}</span>
                  </div>
                  <div className="comuna-metric-row">
                    <span className="comuna-metric-key">Staff per 1,000</span>
                    <span className="comuna-metric-val">
                      {comuna.staffPer1000?.toFixed(1) ?? "—"}
                    </span>
                  </div>
                </div>
                {comuna.cofinanceScore != null && (
                  <div className="comuna-score-block">
                    <div className="comuna-score-head">
                      <span>Co-finance capacity</span>
                      <span>{comuna.cofinanceScore.toFixed(1)} / 70</span>
                    </div>
                    <div className="comuna-score-bar comuna-score-bar-lg">
                      <div
                        className="comuna-score-fill"
                        style={{ width: `${cofinancePct(comuna.cofinanceScore)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isValdivia && valdiviaDetail && (
                <div className="comuna-section comuna-section-highlight">
                  <div className="comuna-section-title">
                    <i className="ti ti-map-2" /> Demo engine — Valdivia
                  </div>
                  <div className="comuna-valdivia-kpis">
                    <div>
                      <strong>{valdiviaDetail.funders_count.applicant}</strong>
                      <span>Applicant instruments</span>
                    </div>
                    <div>
                      <strong>{valdiviaDetail.actions.match}</strong>
                      <span>Action matches</span>
                    </div>
                    <div>
                      <strong>{valdiviaDetail.transport.best_af.toFixed(2)}</strong>
                      <span>Transport best-fit</span>
                    </div>
                  </div>
                  <p className="comuna-section-lead">
                    Transport has {valdiviaDetail.transport.n_actions} salient actions but no dedicated
                    instrument — best fit {valdiviaDetail.transport.best_funder} at{" "}
                    {valdiviaDetail.transport.best_af.toFixed(2)}. That gap becomes the pool deal on the
                    homepage demo.
                  </p>
                  <Link href="/" className="btn btn-primary">
                    Open Chile engine narrative <i className="ti ti-arrow-right" />
                  </Link>
                </div>
              )}
            </>
          )}

          {tab === "pool" && (
            <>
              <div className="comuna-section">
                <div className="comuna-section-title">
                  <i className="ti ti-stack-2" /> Coordination unit
                </div>
                <p className="comuna-section-lead">
                  {comuna.unitId
                    ? `Unit ${comuna.unitId} groups comunas that can bundle sector actions into a single financeable package. ${unitMembers.length} comuna${unitMembers.length === 1 ? "" : "s"} in this unit.`
                    : "This comuna is not assigned to a scored coordination unit in the engine."}
                </p>
              </div>

              {unitMembers.length > 0 ? (
                <div className="comuna-pool-table-wrap">
                  <table className="comuna-pool-table">
                    <thead>
                      <tr>
                        <th>Comuna</th>
                        <th>Role</th>
                        <th>Co-finance</th>
                        <th>FCM dep.</th>
                        <th>Population</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isValdivia && valdiviaDetail?.pool ? valdiviaDetail.pool : unitMembers).map(
                        (row) => {
                          const isPoolRow = "comuna" in row && !("locode" in row);
                          const name = isPoolRow
                            ? (row as ValdiviaDetail["pool"][0]).comuna
                            : (row as ChileComuna).name;
                          const member = allComunas.find((c) => c.name === name);
                          const cof = isPoolRow
                            ? (row as ValdiviaDetail["pool"][0]).cofinance_score
                            : (row as ChileComuna).cofinanceScore;
                          const fcm = isPoolRow
                            ? (row as ValdiviaDetail["pool"][0]).fcm_dependency_pct
                            : (row as ChileComuna).fcmDependencyPct;
                          const pop = isPoolRow
                            ? (row as ValdiviaDetail["pool"][0]).population
                            : (row as ChileComuna).population;
                          const isAnchor = isPoolRow
                            ? (row as ValdiviaDetail["pool"][0]).is_anchor
                            : member?.isAnchor;
                          const isCurrent = name === comuna.name;

                          return (
                            <tr
                              key={name}
                              className={`${isCurrent ? "current" : ""}${isAnchor ? " anchor-row" : ""}`}
                            >
                              <td>
                                {member && !isCurrent ? (
                                  <button
                                    type="button"
                                    className="comuna-pool-link"
                                    onClick={() =>
                                      router.push(
                                        `/tool/funder/comuna/${locodeToSlug(member.locode)}`,
                                      )
                                    }
                                  >
                                    {name}
                                  </button>
                                ) : (
                                  <strong>{name}</strong>
                                )}
                              </td>
                              <td>
                                <span
                                  className={
                                    isAnchor ? "comuna-tag comuna-tag-anchor" : "comuna-tag comuna-tag-pool"
                                  }
                                >
                                  {isAnchor ? "Anchor" : "Member"}
                                </span>
                              </td>
                              <td>{cof != null ? cof.toFixed(1) : "—"}</td>
                              <td>{fcm != null ? `${fcm.toFixed(1)}%` : "—"}</td>
                              <td>{pop != null ? pop.toLocaleString() : "—"}</td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="comuna-empty-note">No unit members to display.</p>
              )}
            </>
          )}

          {tab === "instruments" && (
            <>
              <div className="comuna-section">
                <div className="comuna-section-title">
                  <i className="ti ti-cash" /> Top matching instruments
                </div>
                <p className="comuna-section-lead">
                  Ranked by sector salience, fiscal tier, and pool role
                  {isValdivia ? " (Valdivia uses full action-level engine matches)." : " (catalog heuristic)."}
                </p>
              </div>

              {matches.length > 0 ? (
                <div className="comuna-instrument-list">
                  {matches.map((m, i) => (
                    <div key={`${m.name}-${i}`} className="comuna-instrument-row">
                      <div className="comuna-instrument-rank">#{i + 1}</div>
                      <div className="comuna-instrument-body">
                        <div className="comuna-instrument-top">
                          <span className="comuna-instrument-name">{m.name}</span>
                          <span className="comuna-instrument-score">{m.score}</span>
                        </div>
                        <div className="comuna-instrument-tags">
                          {m.tags.map((t) => (
                            <span key={t.label} className="comuna-tag comuna-tag-sector">
                              {t.label}
                            </span>
                          ))}
                        </div>
                        <p className="comuna-instrument-why">{m.why}</p>
                        <div className="comuna-instrument-bar">
                          <div className="comuna-score-fill" style={{ width: `${m.score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="comuna-empty-note">No instruments matched for this profile.</p>
              )}

              <Link href="/tool/city/wizard/1" className="comuna-city-path-link">
                <i className="ti ti-building-skyscraper" /> Run full city wizard for this comuna
                <i className="ti ti-arrow-right" />
              </Link>
            </>
          )}

          {similar.length > 0 && (
            <div className="comuna-similar">
              <div className="comuna-section-title">
                <i className="ti ti-arrows-shuffle" /> Similar comunas
              </div>
              <div className="comuna-similar-grid">
                {similar.map((c) => (
                  <button
                    key={c.locode}
                    type="button"
                    className="comuna-similar-card"
                    onClick={() => router.push(`/tool/funder/comuna/${locodeToSlug(c.locode)}`)}
                  >
                    <div className="comuna-similar-name">{c.name}</div>
                    <div className="comuna-similar-region">{c.region}</div>
                    {c.poolStatus && (
                      <span className={poolBadgeClass(c.poolStatus)}>{c.poolStatus}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fund-cta">
        <div className="fund-cta-inner">
          <div className="fund-cta-text">
            <h4>Interested in {comuna.name}?</h4>
            <p>Send an expression of interest to explore pool coordination or direct municipal finance.</p>
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setModalOpen(true)}>
            <i className="ti ti-send" /> Express interest
          </button>
        </div>
      </div>

      <ComunaFundModal comunaName={comuna.name} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
