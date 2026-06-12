import mapping from "../../data/civic-action-mapping.json";

const priorityLabels: Record<string, string> = {
  very_high: "Very high",
  high: "High",
  medium: "Medium",
};

export default function Home() {
  const recommendations = mapping.recommendations;

  return (
    <main style={{ minHeight: "100vh", background: "#f7f8f4", color: "#17211d" }}>
      <section style={{ padding: "48px 24px 28px", borderBottom: "1px solid #d9ded5" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p style={{ margin: "0 0 12px", color: "#53645c", fontSize: 14, fontWeight: 700 }}>
            {mapping.meta.city} civic climate action mapping
          </p>
          <h1 style={{ margin: 0, maxWidth: 840, fontSize: 44, lineHeight: 1.05, letterSpacing: 0 }}>
            Turn CityCatalyst data into climate actions residents can join.
          </h1>
          <p style={{ maxWidth: 760, margin: "18px 0 0", color: "#4f5d55", fontSize: 18, lineHeight: 1.55 }}>
            A frontend-ready JSON layer that translates risk, emissions, and climate action data into
            plain-language civic pathways for Porto Alegre.
          </p>
        </div>
      </section>

      <section style={{ padding: "24px", borderBottom: "1px solid #d9ded5" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          <Metric label="Population" value={mapping.citySummary.population.toLocaleString("en-US")} />
          <Metric label="Area" value={`${mapping.citySummary.areaKm2} km2`} />
          <Metric label="Density" value={`${mapping.citySummary.densityPeoplePerKm2.toLocaleString("en-US")} / km2`} />
          <Metric label="Biome" value={mapping.citySummary.biome} />
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 56px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24 }}>Resident-facing recommendations</h2>
            <p style={{ margin: "8px 0 0", color: "#5d6a63", lineHeight: 1.45 }}>
              Ordered from strongest civic engagement signal to lighter-weight pathways.
            </p>
          </div>
          <code
            style={{
              color: "#315342",
              fontSize: 14,
              fontWeight: 700,
              whiteSpace: "nowrap",
              background: "#e9eee8",
              padding: "6px 8px",
              borderRadius: 6,
            }}
          >
            data/civic-action-mapping.json
          </code>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {recommendations.map((item) => (
            <article
              key={item.id}
              style={{
                background: "#ffffff",
                border: "1px solid #dfe4dc",
                borderRadius: 8,
                padding: 20,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: 20,
              }}
            >
              <div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <Tag>{priorityLabels[item.priority] ?? item.priority}</Tag>
                  <Tag>{item.category}</Tag>
                </div>
                <h3 style={{ margin: 0, fontSize: 22 }}>{item.title}</h3>
                <p style={{ margin: "10px 0 0", color: "#46534c", lineHeight: 1.5 }}>
                  {item.plainLanguageExplanation}
                </p>
                <p style={{ margin: "12px 0 0", color: "#69756e", fontSize: 14, lineHeight: 1.45 }}>
                  {item.whyItMattersLocally}
                </p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", color: "#5e6b63" }}>
                  First civic actions
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, color: "#334139", lineHeight: 1.45 }}>
                  {item.citizenActions.slice(0, 2).map((action) => (
                    <li key={`${item.id}-${action.type}-${action.label}`} style={{ marginBottom: 8 }}>
                      {action.label}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, color: "#627069", fontSize: 13 }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 750 }}>{value}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        border: "1px solid #ccd8d0",
        borderRadius: 999,
        color: "#1f4d36",
        background: "#eef5ef",
        padding: "4px 9px",
        fontSize: 12,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {children}
    </span>
  );
}
