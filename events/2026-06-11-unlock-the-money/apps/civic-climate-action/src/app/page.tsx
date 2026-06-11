import { city, type ActionPathway } from "./data";

const kindColor: Record<ActionPathway["engagement"][number]["kind"], string> = {
  Community: "#0369a1",
  Policy: "#7c3aed",
  Lawmaking: "#b45309",
  Volunteer: "#15803d",
};

const sourceLabel: Record<ActionPathway["source"], string> = {
  HIAP: "High-impact action",
  GHGI: "Emissions data",
  CCRA: "Climate risk",
};

const riskColor: Record<string, string> = {
  High: "#dc2626",
  Medium: "#d97706",
  Low: "#16a34a",
};

export default function Home() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      {/* Hero */}
      <section style={{ marginBottom: "3rem" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#0369a1",
            background: "#e0f2fe",
            padding: "0.3rem 0.7rem",
            borderRadius: 999,
          }}
        >
          Civic Climate Action · a CityCatalyst companion
        </span>
        <h1 style={{ fontSize: "2.6rem", lineHeight: 1.1, margin: "1.2rem 0 0.6rem" }}>
          Your city, your move.
        </h1>
        <p style={{ fontSize: "1.25rem", color: "#475569", maxWidth: 680, margin: 0 }}>
          We have emissions, risks, and priority actions for cities to implement top-down.
          This turns that data into <strong>bottom-up</strong> pathways: discover what your
          city is doing on climate, learn what it means, and find a concrete way to engage.
        </p>
        <blockquote
          style={{
            margin: "1.5rem 0 0",
            paddingLeft: "1rem",
            borderLeft: "3px solid #cbd5e1",
            color: "#64748b",
            fontStyle: "italic",
          }}
        >
          “I, as a citizen, want to know what’s happening in my city and how I could take
          better action.”
        </blockquote>
      </section>

      {/* The journey */}
      <section style={{ display: "flex", gap: "1rem", marginBottom: "3rem", flexWrap: "wrap" }}>
        {[
          { step: "1 · Discover", text: "What is my city doing on climate? Pulled from GHGI, CCRA, and HIAP." },
          { step: "2 · Learn", text: "Plain-language explainers on local emissions, risks, and priorities." },
          { step: "3 · Engage", text: "Concrete next steps: groups, public comment, council meetings, campaigns." },
        ].map((s) => (
          <div
            key={s.step}
            style={{
              flex: "1 1 240px",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "1.1rem 1.2rem",
            }}
          >
            <div style={{ fontWeight: 700, color: "#0369a1", marginBottom: "0.4rem" }}>{s.step}</div>
            <div style={{ color: "#475569", fontSize: "0.95rem" }}>{s.text}</div>
          </div>
        ))}
      </section>

      {/* Discover: city snapshot */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
          {city.name}, {city.country}
        </h2>
        <p style={{ color: "#64748b", margin: "0 0 1.5rem" }}>
          Population {city.population} · GHG inventory {city.inventoryYear}
        </p>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {/* Emissions */}
          <div style={{ flex: "1 1 380px" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.8rem" }}>Where emissions come from</h3>
            {city.emissions.map((e) => (
              <div key={e.sector} style={{ marginBottom: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                  <span style={{ fontWeight: 600 }}>{e.sector}</span>
                  <span style={{ color: "#64748b" }}>{e.share}%</span>
                </div>
                <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999, marginTop: 4 }}>
                  <div
                    style={{
                      width: `${e.share}%`,
                      height: "100%",
                      background: "#0ea5e9",
                      borderRadius: 999,
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 3 }}>
                  {e.plainLanguage}
                </div>
              </div>
            ))}
          </div>

          {/* Risks */}
          <div style={{ flex: "1 1 320px" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.8rem" }}>Climate risks near you</h3>
            {city.risks.map((r) => (
              <div
                key={r.hazard}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "0.8rem 1rem",
                  marginBottom: "0.7rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>{r.hazard}</span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#fff",
                      background: riskColor[r.level],
                      padding: "0.15rem 0.55rem",
                      borderRadius: 999,
                    }}
                  >
                    {r.level}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 4 }}>
                  {r.neighborhoodNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engage: action pathways */}
      <section>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Ways to take action</h2>
        <p style={{ color: "#64748b", margin: "0 0 1.5rem" }}>
          Each pathway is generated from a CityCatalyst signal and translated into things a
          resident can actually do.
        </p>

        <div style={{ display: "grid", gap: "1.2rem" }}>
          {city.pathways.map((p) => (
            <article
              key={p.title}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "1.4rem 1.5rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#334155",
                    background: "#f1f5f9",
                    padding: "0.2rem 0.55rem",
                    borderRadius: 6,
                  }}
                >
                  {sourceLabel[p.source]} · {p.source}
                </span>
                {p.priority === "High" && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#b91c1c",
                      background: "#fee2e2",
                      padding: "0.2rem 0.55rem",
                      borderRadius: 6,
                    }}
                  >
                    Priority
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "1.2rem", margin: "0 0 0.4rem" }}>{p.title}</h3>
              <p style={{ color: "#475569", margin: "0 0 0.9rem", fontSize: "0.95rem" }}>
                {p.whyItMatters}
              </p>

              <ul style={{ margin: "0 0 1rem", paddingLeft: "1.1rem", color: "#334155", fontSize: "0.95rem" }}>
                {p.citizenSteps.map((s) => (
                  <li key={s} style={{ marginBottom: "0.3rem" }}>
                    {s}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {p.engagement.map((g) => (
                  <span
                    key={g.label}
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: kindColor[g.kind],
                      border: `1px solid ${kindColor[g.kind]}33`,
                      background: `${kindColor[g.kind]}11`,
                      padding: "0.3rem 0.7rem",
                      borderRadius: 999,
                    }}
                  >
                    {g.label}
                    <span style={{ color: "#94a3b8", fontWeight: 500 }}> · {g.kind}</span>
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer / revenue framing */}
      <footer
        style={{
          marginTop: "3.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid #e2e8f0",
          color: "#64748b",
          fontSize: "0.9rem",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Why it pays:</strong> civic participation is a co-benefit funders (MDBs, IDB,
          philanthropy) already score. This module operationalizes it — visible, measurable
          community engagement that de-risks city climate projects. Built for OEF Hackday 26Q2.
        </p>
      </footer>
    </main>
  );
}
