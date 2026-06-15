"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ToolNav } from "@/components/tool/ToolNav";
import { filterCities } from "@/lib/tool/filter-cities";

export function FunderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [impact, setImpact] = useState("");
  const [risk, setRisk] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSet, setAlertSet] = useState(false);

  const results = useMemo(
    () => filterCities({ query, region, sector, impact, risk }),
    [query, region, sector, impact, risk]
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
            <Link href="/tool/role" className="btn btn-sm btn-secondary" style={{ textDecoration: "none" }}>
              Switch role
            </Link>
          </div>
        }
      />

      <div className="search-header">
        <div className="container">
          <div className="search-title">Discover cities seeking climate finance</div>
          <div className="search-sub">142 cities across 58 countries ready to match with funders</div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        <div className="search-filters">
          <div className="search-bar" style={{ marginBottom: 16 }}>
            <i className="ti ti-search" />
            <input
              type="text"
              placeholder="Search by city name, country or project..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-grid">
            <div>
              <label htmlFor="filter-region">Region</label>
              <select id="filter-region" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">All regions</option>
                <option>Latin America</option>
                <option>Sub-Saharan Africa</option>
                <option>South & Southeast Asia</option>
                <option>MENA</option>
                <option>Eastern Europe</option>
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
              <label htmlFor="filter-impact">Impact</label>
              <select id="filter-impact" value={impact} onChange={(e) => setImpact(e.target.value)}>
                <option value="">Any impact level</option>
                <option>High</option>
                <option>Medium-high</option>
                <option>Medium</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-risk">Risk category</label>
              <select id="filter-risk" value={risk} onChange={(e) => setRisk(e.target.value)}>
                <option value="">Any risk</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
            {results.length} cit{results.length === 1 ? "y" : "ies"} found
          </div>
        )}

        <div className="results-grid">
          {results.map((c) => (
            <div
              key={c.id}
              className="city-card"
              onClick={() => router.push(`/tool/funder/city/${c.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/tool/funder/city/${c.id}`)}
            >
              <div className="city-flag">{c.flag}</div>
              <div className="city-name">{c.name}</div>
              <div className="city-country">
                <i className="ti ti-map-pin" style={{ fontSize: 13 }} />
                {c.country} · {c.region}
              </div>
              <div className="city-tags">
                {c.tags.map((t, i) => (
                  <span key={t} className={`badge ${c.tagColors[i]}`}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="city-meta">
                <div>
                  <div className="funding-amount">{c.fundingNeed}</div>
                  <div className="funding-label">funding sought</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{c.co2Reduction}</div>
                  <div className="funding-label">impact potential</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div id="no-results">
            <div className="no-results">
              <i className="ti ti-map-search" />
              <h3>No cities match your criteria</h3>
              <p>Try broadening your filters, or set an alert to be notified when a matching city joins the platform.</p>
            </div>
            <div className="alert-box">
              <h4>
                <i className="ti ti-bell" /> Get notified when a match appears
              </h4>
              <p>Enter your email and we&apos;ll alert you when a city matching your criteria registers on the platform.</p>
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
                  <i className="ti ti-check" /> Alert set! We&apos;ll email you when a matching city is added.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
