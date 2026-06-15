"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ToolNav } from "@/components/tool/ToolNav";
import { loadChileComunas } from "@/lib/tool/chile-data";
import { loadChileRegions, locodeToSlug, sectorLabels } from "@/lib/tool/chile-regions";
import { filterComunas } from "@/lib/tool/filter-comunas";
import type { ChileComuna } from "@/lib/tool/types";

function poolBadgeClass(status?: string) {
  if (status === "anchor") return "badge green";
  if (status === "in viable pool") return "badge blue";
  return "badge amber";
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="nav-role">Funder</span>
            <a href="/tool/role" className="btn btn-sm btn-secondary" style={{ textDecoration: "none" }}>
              Switch role
            </a>
          </div>
        }
      />

      <div className="search-header">
        <div className="container">
          <div className="search-title">Discover Chilean comunas seeking climate finance</div>
          <div className="search-sub">
            {loading ? "Loading…" : `${comunas.length} comunas scored in the national coordination engine`}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        <div className="search-filters">
          <div className="search-bar" style={{ marginBottom: 16 }}>
            <i className="ti ti-search" />
            <input
              type="text"
              placeholder="Search by comuna name or region…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-grid">
            <div>
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
            <div>
              <label htmlFor="filter-sector">Sector</label>
              <select id="filter-sector" value={sector} onChange={(e) => setSector(e.target.value)}>
                <option value="">All sectors</option>
                <option>Transport & mobility</option>
                <option>Energy transition</option>
                <option>Waste management</option>
                <option>Water & sanitation</option>
                <option>Urban resilience</option>
                <option>Nature-based solutions</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-pool">Pool status</label>
              <select id="filter-pool" value={poolStatus} onChange={(e) => setPoolStatus(e.target.value)}>
                <option value="">Any status</option>
                <option value="anchor">Anchor</option>
                <option value="in viable pool">In viable pool</option>
                <option value="needs TA">Needs TA</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-fiscal">Fiscal tier</label>
              <select id="filter-fiscal" value={fiscal} onChange={(e) => setFiscal(e.target.value)}>
                <option value="">Any tier</option>
                <option value="A">A — Strong</option>
                <option value="B">B — Moderate</option>
                <option value="C">C — Limited</option>
              </select>
            </div>
          </div>
        </div>

        {!loading && results.length > 0 && (
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
            {results.length} comun{results.length === 1 ? "a" : "as"} found
          </div>
        )}

        {loading && <p style={{ color: "var(--text-muted)" }}>Loading comuna data…</p>}

        <div className="results-grid">
          {results.map((c) => (
            <div
              key={c.locode}
              className="city-card"
              onClick={() => router.push(`/tool/funder/comuna/${locodeToSlug(c.locode)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && router.push(`/tool/funder/comuna/${locodeToSlug(c.locode)}`)
              }
            >
              <div className="city-flag">🇨🇱</div>
              <div className="city-name">{c.name}</div>
              <div className="city-country">
                <i className="ti ti-map-pin" style={{ fontSize: 13 }} />
                Chile · {c.region}
              </div>
              <div className="city-tags">
                {c.poolStatus && (
                  <span className={poolBadgeClass(c.poolStatus)}>{c.poolStatus}</span>
                )}
                {sectorLabels(c.salientSectors).slice(0, 2).map((t) => (
                  <span key={t} className="badge blue">
                    {t}
                  </span>
                ))}
              </div>
              <div className="city-meta">
                <div>
                  <div className="funding-amount">
                    {c.population != null ? `${(c.population / 1000).toFixed(0)}k` : "—"}
                  </div>
                  <div className="funding-label">population</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                    {c.cofinanceScore != null ? c.cofinanceScore.toFixed(1) : "—"}
                  </div>
                  <div className="funding-label">co-finance score</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && results.length === 0 && (
          <div id="no-results">
            <div className="no-results">
              <i className="ti ti-map-search" />
              <h3>No comunas match your criteria</h3>
              <p>Try broadening your filters, or set an alert to be notified when a matching comuna is scored.</p>
            </div>
            <div className="alert-box">
              <h4>
                <i className="ti ti-bell" /> Get notified when a match appears
              </h4>
              <p>Enter your email and we&apos;ll alert you when a comuna matching your criteria is added.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="email"
                  placeholder="you@organization.org"
                  style={{ flex: 1 }}
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                />
                <button type="button" className="btn btn-primary" onClick={setAlert}>
                  <i className="ti ti-bell" /> Set alert
                </button>
              </div>
              {alertSet && (
                <div style={{ marginTop: 12, fontSize: 14, color: "var(--green-dark)", fontWeight: 500 }}>
                  <i className="ti ti-check" /> Alert set! We&apos;ll email you when a matching comuna is added.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
