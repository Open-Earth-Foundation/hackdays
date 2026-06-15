"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FundModal } from "@/components/tool/FundModal";
import { NavBack, ToolNav } from "@/components/tool/ToolNav";
import { similarCities } from "@/lib/tool/filter-cities";
import type { CityRecord } from "@/lib/tool/types";

type Tab = "overview" | "credibility" | "plan" | "contact";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "credibility", label: "Credibility" },
  { id: "plan", label: "Implementation plan" },
  { id: "contact", label: "Contact" },
];

export function FunderCityProfile({ city }: { city: CityRecord }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const similar = similarCities(city);

  return (
    <>
      <ToolNav right={<NavBack href="/tool/funder/search" label="Back to search" />} />

      <div className="profile-hero">
        <div className="container">
          <Link href="/tool/funder/search" className="profile-breadcrumb" style={{ textDecoration: "none" }}>
            <i className="ti ti-arrow-left" /> All cities
          </Link>
          <div className="profile-header">
            <div>
              <span className="profile-flag">{city.flag}</span>
              <div className="profile-city-name">{city.name}</div>
              <div className="profile-location">
                <i className="ti ti-map-pin" />
                <span>
                  {city.country} · {city.region}
                </span>
              </div>
              <div className="profile-badges">
                {city.tags.map((t) => (
                  <span key={t} className="profile-badge">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="profile-stats" style={{ minWidth: 300 }}>
              <div className="profile-stat">
                <span className="profile-stat-value">{city.fundingNeed}</span>
                <span className="profile-stat-label">Funding sought</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{city.population}</span>
                <span className="profile-stat-label">Population</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{city.co2Reduction}</span>
                <span className="profile-stat-label">CO₂ impact</span>
              </div>
            </div>
          </div>
          <div className="profile-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`profile-tab${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="profile-body">
        <div className="container">
          {tab === "overview" && (
            <div id="tab-overview">
              <div className="profile-section">
                <div className="section-title">
                  <i className="ti ti-info-circle" /> City introduction
                </div>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>{city.intro}</p>
              </div>
              <div className="profile-section">
                <div className="section-title">
                  <i className="ti ti-currency-dollar" /> Why this city should access climate funding
                </div>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>{city.why}</p>
              </div>
              <div className="profile-section">
                <div className="section-title">
                  <i className="ti ti-chart-pie" /> Political overview &amp; governance
                </div>
                <div
                  style={{ color: "var(--text-muted)", lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: city.political }}
                />
              </div>
            </div>
          )}

          {tab === "credibility" && (
            <div id="tab-credibility">
              <div className="profile-section">
                <div className="section-title">
                  <i className="ti ti-certificate" /> Credibility scores
                </div>
                <div className="credibility-grid">
                  {city.credibility.map((cr) => (
                    <div key={cr.label} className="credibility-item">
                      <div className="credibility-score" style={{ color: cr.color }}>
                        {cr.value}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>{cr.label}</div>
                      <div className="credibility-label">{cr.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="profile-section">
                <div className="section-title">
                  <i className="ti ti-alert-triangle" /> Risk assessment
                </div>
                <div id="risk-assessment">
                  {city.risks.map((r) => (
                    <div key={r.label} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.level}%</span>
                      </div>
                      <div className="risk-bar">
                        <div className="risk-fill" style={{ width: `${r.level}%`, background: r.color }} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{r.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "plan" && (
            <div id="tab-plan">
              <div className="profile-section">
                <div className="section-title">
                  <i className="ti ti-timeline" /> Implementation roadmap
                </div>
                <div className="impl-timeline">
                  {city.timeline.map((t) => (
                    <div key={t.phase} className="impl-item">
                      <div className="impl-phase">{t.phase}</div>
                      <div className="impl-desc">{t.desc}</div>
                      <div className="impl-date">{t.date}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="profile-section">
                <div className="section-title">
                  <i className="ti ti-target" /> Key milestones &amp; KPIs
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                  {city.kpis.map((k) => (
                    <div
                      key={k.label}
                      style={{
                        background: "var(--gray-50)",
                        borderRadius: 8,
                        padding: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          background: "var(--green-light)",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <i className={`ti ${k.icon}`} style={{ color: "var(--green)", fontSize: 17 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green-dark)" }}>{k.value}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{k.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "contact" && (
            <div id="tab-contact">
              <div className="profile-section">
                <div className="section-title">
                  <i className="ti ti-users" /> City contacts
                </div>
                <div className="contact-grid">
                  {city.contacts.map((ct) => (
                    <div
                      key={ct.email}
                      className="contact-item"
                      style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "var(--green-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            color: "var(--green-dark)",
                            fontSize: 14,
                          }}
                        >
                          {ct.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{ct.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{ct.role}</div>
                        </div>
                      </div>
                      <div style={{ width: "100%", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <i className="ti ti-mail" style={{ fontSize: 14 }} />
                          {ct.email}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <i className="ti ti-phone" style={{ fontSize: 14 }} />
                          {ct.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fund-cta">
        <div className="fund-cta-inner">
          <div className="fund-cta-text">
            <h4>Ready to fund this city?</h4>
            <p>Explore funding opportunities in {city.name}</p>
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setModalOpen(true)}>
            <i className="ti ti-heart-handshake" /> Fund this action plan
          </button>
        </div>
      </div>

      <div className="similar-section">
        <div className="container">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Similar cities</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Other cities with comparable profiles and funding needs
          </p>
          <div className="similar-grid">
            {similar.map((s) => (
              <div
                key={s.id}
                className="city-card"
                onClick={() => router.push(`/tool/funder/city/${s.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/tool/funder/city/${s.id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>{s.flag}</span>
                  <div>
                    <div className="city-name" style={{ fontSize: 16 }}>
                      {s.name}
                    </div>
                    <div className="city-country">{s.country}</div>
                  </div>
                </div>
                <div className="city-tags">
                  {s.tags.map((t, i) => (
                    <span key={t} className={`badge ${s.tagColors[i]}`}>
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: "var(--green-dark)" }}>
                  {s.fundingNeed}{" "}
                  <span style={{ fontWeight: 400, fontSize: 12, color: "var(--text-muted)" }}>funding sought</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FundModal city={city} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
