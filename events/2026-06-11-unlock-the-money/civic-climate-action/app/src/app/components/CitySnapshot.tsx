import type { City, RiskLevel } from "../data/types";

const riskColor: Record<RiskLevel, string> = {
  Low: "#16a34a",
  Medium: "#d97706",
  High: "#dc2626",
  "Very High": "#991b1b",
};

const sectorColor: Record<string, string> = {
  "Stationary Energy": "#2563eb",
  Transportation: "#0ea5e9",
  Waste: "#7c3aed",
  IPPU: "#d97706",
  AFOLU: "#15803d",
  "Buildings/Energy": "#2563eb",
  Buildings: "#2563eb",
  Energy: "#2563eb",
};

function formatCo2e(tonnes: number): string {
  if (tonnes >= 1_000_000) return `${(tonnes / 1_000_000).toFixed(1)} Mt`;
  if (tonnes >= 1_000) return `${Math.round(tonnes / 1_000).toLocaleString()} kt`;
  return `${Math.round(tonnes).toLocaleString()} t`;
}

function ProvenanceBadge({ provenance }: { provenance: City["dataProvenance"] }) {
  const live = provenance === "CityCatalyst";
  return (
    <span
      style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        color: live ? "var(--accent)" : "var(--ink-faint)",
        background: live ? "var(--accent-soft)" : "var(--bg-soft)",
        border: "1px solid",
        borderColor: live ? "var(--accent-soft)" : "var(--line)",
        padding: "0.15rem 0.5rem",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {live ? "CityCatalyst live" : "External source"}
    </span>
  );
}

export default function CitySnapshot({ city }: { city: City }) {
  const { emissions, risk } = city;
  if (!emissions && !risk) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.25rem",
        marginTop: "1.25rem",
        padding: "1.1rem 1.2rem",
        border: "1px solid var(--line)",
        borderRadius: 14,
        background: "var(--bg-soft)",
      }}
    >
      {/* Emissions */}
      {emissions && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.6rem" }}>
            <span className="eyebrow">Emissions</span>
            <ProvenanceBadge provenance={city.dataProvenance} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: "1.7rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              {formatCo2e(emissions.totalTonnesCo2e)}
            </span>
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              CO₂e / year
            </span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)", marginBottom: emissions.note ? "0.35rem" : "0.7rem" }}>
            Inventory {emissions.inventoryYear}
            {emissions.perCapitaTonnes
              ? ` · ${emissions.perCapitaTonnes.toFixed(1)} t per person`
              : ""}
          </div>
          {emissions.note && (
            <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)", fontStyle: "italic", marginBottom: "0.7rem" }}>
              {emissions.note}
            </div>
          )}

          {emissions.sectors &&
            emissions.sectors.slice(0, 5).map((s) => (
              <div key={s.sector} style={{ marginBottom: "0.45rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span>{s.sector}</span>
                  <span className="muted">{s.sharePct}%</span>
                </div>
                <div style={{ height: 6, background: "var(--line)", borderRadius: 999, marginTop: 2 }}>
                  <div
                    style={{
                      width: `${Math.min(100, s.sharePct)}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: sectorColor[s.sector] ?? "var(--accent)",
                    }}
                  />
                </div>
              </div>
            ))}

          {!emissions.sectors && emissions.topSector && (
            <div style={{ fontSize: "0.85rem" }}>
              <span className="muted">Largest source: </span>
              <span style={{ fontWeight: 600 }}>{emissions.topSector}</span>
            </div>
          )}

          <a
            href={emissions.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.76rem", display: "inline-block", marginTop: "0.4rem" }}
          >
            {emissions.source} ↗
          </a>
        </div>
      )}

      {/* Risk */}
      {risk && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.6rem" }}>
            <span className="eyebrow">Climate risk</span>
            <ProvenanceBadge provenance={city.dataProvenance} />
          </div>

          {risk.summary && (
            <p className="muted" style={{ fontSize: "0.85rem", margin: "0 0 0.7rem" }}>
              {risk.summary}
            </p>
          )}

          <div style={{ display: "grid", gap: "0.45rem" }}>
            {risk.topHazards.map((h) => (
              <div
                key={h.hazard}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
              >
                <span style={{ fontSize: "0.88rem", textTransform: "capitalize" }}>
                  {h.hazard}
                  {h.keyImpact ? (
                    <span style={{ color: "var(--ink-faint)" }}> · {h.keyImpact}</span>
                  ) : null}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#fff",
                    background: riskColor[h.level],
                    padding: "0.1rem 0.5rem",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h.level}
                </span>
              </div>
            ))}
          </div>

          <a
            href={risk.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.76rem", display: "inline-block", marginTop: "0.7rem" }}
          >
            {risk.source} ↗
          </a>
        </div>
      )}
    </div>
  );
}
