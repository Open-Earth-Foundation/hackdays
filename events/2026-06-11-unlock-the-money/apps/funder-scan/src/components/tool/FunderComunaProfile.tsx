"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavBack, ToolNav } from "@/components/tool/ToolNav";
import { locodeToSlug, sectorLabels } from "@/lib/tool/chile-regions";
import { similarComunas } from "@/lib/tool/filter-comunas";
import type { ChileComuna } from "@/lib/tool/types";

function poolBadgeClass(status?: string) {
  if (status === "anchor") return "badge green";
  if (status === "in viable pool") return "badge blue";
  return "badge amber";
}

export function FunderComunaProfile({
  comuna,
  allComunas,
}: {
  comuna: ChileComuna;
  allComunas: ChileComuna[];
}) {
  const router = useRouter();
  const similar = similarComunas(comuna, allComunas);
  const sectors = sectorLabels(comuna.salientSectors);
  const isValdivia = comuna.locode === "CL ZAL";

  return (
    <>
      <ToolNav right={<NavBack href="/tool/funder/search" label="Back to search" />} />

      <div className="profile-hero">
        <div className="container">
          <Link href="/tool/funder/search" className="profile-breadcrumb" style={{ textDecoration: "none" }}>
            <i className="ti ti-arrow-left" /> All comunas
          </Link>
          <div className="profile-header">
            <div>
              <span className="profile-flag">🇨🇱</span>
              <div className="profile-city-name">{comuna.name}</div>
              <div className="profile-location">
                <i className="ti ti-map-pin" />
                <span>
                  Chile · {comuna.region}
                </span>
              </div>
              <div className="profile-badges">
                {comuna.poolStatus && (
                  <span className="profile-badge">{comuna.poolStatus}</span>
                )}
                {sectors.map((s) => (
                  <span key={s} className="profile-badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="profile-stats" style={{ minWidth: 300 }}>
              <div className="profile-stat">
                <span className="profile-stat-value">
                  {comuna.population != null ? comuna.population.toLocaleString() : "—"}
                </span>
                <span className="profile-stat-label">Population</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">
                  {comuna.cofinanceScore != null ? comuna.cofinanceScore.toFixed(1) : "—"}
                </span>
                <span className="profile-stat-label">Co-finance score</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{comuna.fiscalBand.charAt(0)}</span>
                <span className="profile-stat-label">Fiscal tier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">
            <i className="ti ti-building-community" /> Municipal profile
          </div>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
            {isValdivia
              ? "Valdivia is the demo anchor for unit-11 (Los Ríos): 52 applicant instruments, transport gap at 0.61, and a six-comuna pool. See the Chile engine homepage for the full narrative."
              : `${comuna.name} is scored in the national coordination engine. Pool status and co-finance scores reflect whether this comuna can anchor or join a bundled deal.`}
          </p>
          <div className="form-row">
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Capacity</div>
              <div style={{ fontWeight: 600 }}>{comuna.capacityBand}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>FCM dependency</div>
              <div style={{ fontWeight: 600 }}>
                {comuna.fcmDependencyPct != null ? `${comuna.fcmDependencyPct.toFixed(1)}%` : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Composite score</div>
              <div style={{ fontWeight: 600 }}>
                {comuna.compositeScore != null ? comuna.compositeScore.toFixed(1) : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Unit</div>
              <div style={{ fontWeight: 600 }}>{comuna.unitId ?? "—"}</div>
            </div>
          </div>
        </div>

        {isValdivia && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">
              <i className="ti ti-map-2" /> Demo deep-dive
            </div>
            <p style={{ marginBottom: 16, color: "var(--text-muted)" }}>
              Valdivia has the only full action-level match run in this prototype.
            </p>
            <Link href="/" className="btn btn-primary">
              Open Chile engine demo <i className="ti ti-arrow-right" />
            </Link>
          </div>
        )}

        {similar.length > 0 && (
          <>
            <div className="section-title" style={{ marginBottom: 16 }}>
              Similar comunas
            </div>
            <div className="results-grid">
              {similar.map((c) => (
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
                    {c.region}
                  </div>
                  <div className="city-tags">
                    {c.poolStatus && (
                      <span className={poolBadgeClass(c.poolStatus)}>{c.poolStatus}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
