import { portoAlegreEngagementRecommendations } from "../data/localEngagement";

export default function LocalEngagementPanel({ cityId }: { cityId: string }) {
  if (cityId !== "porto-alegre") return null;

  const topRecommendations = portoAlegreEngagementRecommendations.slice(0, 3);
  const sourceMap = new Map(
    portoAlegreEngagementRecommendations
      .flatMap((recommendation) => recommendation.sources)
      .map((source) => [source.id, source])
  );
  const sources = Array.from(sourceMap.values()).slice(0, 8);

  return (
    <div
      style={{
        marginTop: "1.25rem",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "1rem",
        background: "var(--bg-soft)",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: "0.45rem" }}>
        Local action sources
      </div>
      <p className="muted" style={{ fontSize: "0.88rem", marginBottom: "0.8rem" }}>
        A Porto Alegre-specific data layer connects the risk profile above to real engagement
        channels residents can use now.
      </p>

      <div style={{ display: "grid", gap: "0.65rem" }}>
        {topRecommendations.map((recommendation) => (
          <div key={recommendation.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 650 }}>{recommendation.title}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)", whiteSpace: "nowrap" }}>
                {recommendation.priority}
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", margin: "0.15rem 0 0" }}>
              {recommendation.firstActions[0]?.label}
            </p>
          </div>
        ))}
      </div>

      <details style={{ marginTop: "0.85rem" }}>
        <summary
          style={{
            cursor: "pointer",
            color: "var(--accent)",
            fontSize: "0.82rem",
            fontWeight: 650,
          }}
        >
          View source links
        </summary>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "0.6rem" }}>
          {sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              title={source.note}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: "0.18rem 0.5rem",
                fontSize: "0.72rem",
                color: source.type === "official" ? "var(--accent)" : "var(--ink-soft)",
                background: source.type === "official" ? "var(--accent-soft)" : "var(--bg)",
              }}
            >
              {source.name} ↗
            </a>
          ))}
        </div>
      </details>
    </div>
  );
}
