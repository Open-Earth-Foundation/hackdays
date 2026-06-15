"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ToolNav } from "@/components/tool/ToolNav";
import { loadChileComunas } from "@/lib/tool/chile-data";
import { loadChileRegions, locodeToSlug, sectorLabels } from "@/lib/tool/chile-regions";
import { filterComunas } from "@/lib/tool/filter-comunas";
import type { ChileComuna } from "@/lib/tool/types";

const SECTOR_OPTS = [
  "Transport & mobility",
  "Energy transition",
  "Waste management",
  "Water & sanitation",
  "Urban resilience",
  "Nature-based solutions",
] as const;

const POOL_OPTS = [
  { value: "", label: "Any status" },
  { value: "anchor", label: "Anchor" },
  { value: "in viable pool", label: "In viable pool" },
  { value: "needs TA", label: "Needs TA" },
] as const;

function poolBadgeClass(status?: string) {
  if (status === "anchor") return "comuna-tag comuna-tag-anchor";
  if (status === "in viable pool") return "comuna-tag comuna-tag-pool";
  if (status === "needs TA") return "comuna-tag comuna-tag-ta";
  return "comuna-tag";
}

const PAGE_SIZE = 12;

function cofinancePct(score: number | null | undefined) {
  if (score == null) return 0;
  return Math.min(100, Math.round((score / 70) * 100));
}

export function FunderSearch() {
  const router = useRouter();
  const [comunas, setComunas] = useState<ChileComuna[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [poolStatus, setPoolStatus] = useState("");
  const [fiscal, setFiscal] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSet, setAlertSet] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([loadChileComunas(), loadChileRegions()])
      .then(([c, r]) => {
        setComunas(c);
        setRegions(r);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const results = useMemo(
    () => filterComunas(comunas, { query, region, sector, poolStatus, fiscal }),
    [comunas, query, region, sector, poolStatus, fiscal],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, region, sector, poolStatus, fiscal]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageResults = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  const rangeStart = results.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, results.length);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const anchors = comunas.filter((c) => c.poolStatus === "anchor").length;
    const inPool = comunas.filter((c) => c.poolStatus === "in viable pool").length;
    return { total: comunas.length, anchors, inPool };
  }, [comunas]);

  const hasFilters = !!(query || region || sector || poolStatus || fiscal);

  const clearFilters = () => {
    setQuery("");
    setRegion("");
    setSector("");
    setPoolStatus("");
    setFiscal("");
    setPage(1);
  };

  const setAlert = () => {
    if (!alertEmail) {
      alert("Please enter your email address.");
      return;
    }
    setAlertSet(true);
  };

  return (
    <>
      <ToolNav
        right={
          <div className="search-nav-right">
            <span className="nav-role">Funder path</span>
            <Link href="/tool/funder/profile" className="btn btn-sm btn-secondary search-nav-btn">
              <i className="ti ti-adjustments" /> Criteria
            </Link>
            <Link href="/tool/role" className="btn btn-sm btn-secondary search-nav-btn">
              Switch role
            </Link>
          </div>
        }
      />

      <div className="search-hero">
        <div className="container search-hero-inner">
          <p className="search-eyebrow">Funder path · Browse comunas</p>
          <h1 className="search-hero-title">Find pool-ready Chilean comunas</h1>
          <p className="search-hero-lead">
            Every comuna is scored for co-finance capacity, pool viability, and sector salience — the same
            engine that bundles gaps into deals.
          </p>
          <div className="search-kpi-row">
            <div className="search-kpi">
              <span className="search-kpi-value">{loading ? "…" : stats.total}</span>
              <span className="search-kpi-label">Comunas scored</span>
            </div>
            <div className="search-kpi">
              <span className="search-kpi-value">{loading ? "…" : stats.anchors}</span>
              <span className="search-kpi-label">Pool anchors</span>
            </div>
            <div className="search-kpi">
              <span className="search-kpi-value">{loading ? "…" : stats.inPool}</span>
              <span className="search-kpi-label">In viable pools</span>
            </div>
          </div>
        </div>
      </div>

      <div className="search-body">
        <div className="container search-layout">
          <aside className="search-sidebar">
            <div className="search-filters-card">
              <div className="search-filters-head">
                <i className="ti ti-filter" />
                <span>Filter comunas</span>
              </div>

              <div className="search-field">
                <label htmlFor="search-query">Search</label>
                <div className="search-bar">
                  <i className="ti ti-search" />
                  <input
                    id="search-query"
                    type="text"
                    placeholder="Comuna or region…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-field">
                <label htmlFor="filter-region">Chile region</label>
                <select id="filter-region" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">All regions</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="filter-sector">Sector salience</label>
                <select id="filter-sector" value={sector} onChange={(e) => setSector(e.target.value)}>
                  <option value="">All sectors</option>
                  {SECTOR_OPTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label>Pool status</label>
                <div className="search-pool-pills">
                  {POOL_OPTS.map((o) => (
                    <button
                      key={o.value || "all"}
                      type="button"
                      className={`search-pool-pill${poolStatus === o.value ? " sel" : ""}`}
                      onClick={() => setPoolStatus(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="search-field search-field-last">
                <label htmlFor="filter-fiscal">Fiscal tier</label>
                <select id="filter-fiscal" value={fiscal} onChange={(e) => setFiscal(e.target.value)}>
                  <option value="">Any tier</option>
                  <option value="A">A — Strong</option>
                  <option value="B">B — Moderate</option>
                  <option value="C">C — Limited</option>
                </select>
              </div>

              {hasFilters && (
                <button type="button" className="search-clear-btn" onClick={clearFilters}>
                  <i className="ti ti-x" /> Clear filters
                </button>
              )}
            </div>
          </aside>

          <main className="search-main">
            <div className="search-results-head">
              <div>
                <p className="search-results-eyebrow">Results</p>
                <h2 className="search-results-title">
                  {loading
                    ? "Loading comunas…"
                    : `${results.length} comun${results.length === 1 ? "a" : "as"} match`}
                </h2>
                {!loading && results.length > 0 && (
                  <p className="search-results-range">
                    Showing {rangeStart}–{rangeEnd}
                  </p>
                )}
              </div>
              {!loading && results.length > 0 && (
                <span className="search-results-hint">
                  <i className="ti ti-click" /> Select a comuna for profile details
                </span>
              )}
            </div>

            {loading && (
              <div className="search-loading">
                <i className="ti ti-loader" />
                Loading Chile comuna data…
              </div>
            )}

            {!loading && results.length > 0 && (
              <>
                <div className="comuna-grid">
                  {pageResults.map((c) => (
                  <button
                    key={c.locode}
                    type="button"
                    className={`comuna-card${c.poolStatus === "anchor" ? " comuna-card-anchor" : ""}`}
                    onClick={() => router.push(`/tool/funder/comuna/${locodeToSlug(c.locode)}`)}
                  >
                    <div className="comuna-card-top">
                      <div className="comuna-card-icon">
                        <i className="ti ti-building-community" />
                      </div>
                      <div className="comuna-card-head">
                        <div className="comuna-card-name">{c.name}</div>
                        <div className="comuna-card-region">
                          <i className="ti ti-map-pin" />
                          {c.region}
                        </div>
                      </div>
                      <i className="ti ti-arrow-right comuna-card-arrow" />
                    </div>

                    <div className="comuna-card-tags">
                      {c.poolStatus && (
                        <span className={poolBadgeClass(c.poolStatus)}>{c.poolStatus}</span>
                      )}
                      {sectorLabels(c.salientSectors).slice(0, 2).map((t) => (
                        <span key={t} className="comuna-tag comuna-tag-sector">
                          {t}
                        </span>
                      ))}
                      <span className="comuna-tag comuna-tag-fiscal">Fiscal {c.fiscalBand.charAt(0)}</span>
                    </div>

                    <div className="comuna-card-metrics">
                      <div className="comuna-metric">
                        <span className="comuna-metric-value">
                          {c.population != null ? c.population.toLocaleString() : "—"}
                        </span>
                        <span className="comuna-metric-label">Population</span>
                      </div>
                      <div className="comuna-metric">
                        <span className="comuna-metric-value">
                          {c.cofinanceScore != null ? c.cofinanceScore.toFixed(1) : "—"}
                        </span>
                        <span className="comuna-metric-label">Co-finance score</span>
                      </div>
                    </div>

                    {c.cofinanceScore != null && (
                      <div className="comuna-score-bar">
                        <div
                          className="comuna-score-fill"
                          style={{ width: `${cofinancePct(c.cofinanceScore)}%` }}
                        />
                      </div>
                    )}
                  </button>
                ))}
                </div>

                {totalPages > 1 && (
                  <nav className="search-pagination" aria-label="Comuna results pages">
                    <span className="search-pagination-info">
                      Page {page} of {totalPages}
                    </span>
                    <div className="search-pagination-controls">
                      <button
                        type="button"
                        className="search-page-btn nav"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <i className="ti ti-chevron-left" /> Prev
                      </button>
                      {pageNumbers[0] > 1 && (
                        <>
                          <button type="button" className="search-page-btn" onClick={() => setPage(1)}>
                            1
                          </button>
                          {pageNumbers[0] > 2 && <span className="search-pagination-info">…</span>}
                        </>
                      )}
                      {pageNumbers.map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`search-page-btn${n === page ? " sel" : ""}`}
                          onClick={() => setPage(n)}
                          aria-current={n === page ? "page" : undefined}
                        >
                          {n}
                        </button>
                      ))}
                      {pageNumbers[pageNumbers.length - 1] < totalPages && (
                        <>
                          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                            <span className="search-pagination-info">…</span>
                          )}
                          <button
                            type="button"
                            className="search-page-btn"
                            onClick={() => setPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="search-page-btn nav"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next <i className="ti ti-chevron-right" />
                      </button>
                    </div>
                  </nav>
                )}
              </>
            )}

            {!loading && results.length === 0 && (
              <div className="search-empty">
                <div className="search-empty-icon">
                  <i className="ti ti-map-search" />
                </div>
                <h3>No comunas match your criteria</h3>
                <p>Try broadening your filters, or set an alert to be notified when a matching comuna is scored.</p>
                <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                  Clear all filters
                </button>

                <div className="search-alert-box">
                  <h4>
                    <i className="ti ti-bell" /> Get notified when a match appears
                  </h4>
                  <p>We&apos;ll email you when a comuna matching your criteria is added to the engine.</p>
                  <div className="search-alert-row">
                    <input
                      type="email"
                      placeholder="you@organization.org"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                    />
                    <button type="button" className="btn btn-primary" onClick={setAlert}>
                      <i className="ti ti-bell" /> Set alert
                    </button>
                  </div>
                  {alertSet && (
                    <p className="search-alert-ok">
                      <i className="ti ti-check" /> Alert set — we&apos;ll notify you when a match is added.
                    </p>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
