// Plain-language diagram of how city data becomes citizen action.
// Three CityCatalyst inputs flow through a translation layer into things
// a resident can actually do.

const inputs = [
  { code: "GHGI", label: "Emissions inventory", desc: "Where the city's carbon comes from" },
  { code: "CCRA", label: "Climate risk", desc: "Which hazards threaten which neighborhoods" },
  { code: "HIAP", label: "Priority actions", desc: "What the city should do first" },
];

const outputs = [
  { label: "Understand", desc: "Plain-language explainers, no jargon" },
  { label: "Connect", desc: "Local groups, councils, public comment" },
  { label: "Act", desc: "Concrete next steps you can take this week" },
];

export default function FlowDiagram() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: "1.5rem",
        alignItems: "center",
      }}
    >
      {/* Inputs */}
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div className="eyebrow" style={{ marginBottom: "0.25rem" }}>
          CityCatalyst data
        </div>
        {inputs.map((i) => (
          <div
            key={i.code}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "0.85rem 1rem",
              background: "var(--bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{ fontWeight: 650 }}>{i.label}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)", fontWeight: 600 }}>
                {i.code}
              </span>
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--ink-soft)" }}>{i.desc}</div>
          </div>
        ))}
      </div>

      {/* Translation layer */}
      <div style={{ textAlign: "center", minWidth: 120 }}>
        <div
          aria-hidden
          style={{ color: "var(--ink-faint)", fontSize: "1.4rem", letterSpacing: "0.1em" }}
        >
          →
        </div>
        <div
          style={{
            margin: "0.5rem 0",
            padding: "0.6rem 0.8rem",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            borderRadius: 999,
            fontSize: "0.82rem",
            fontWeight: 650,
            whiteSpace: "nowrap",
          }}
        >
          translation layer
        </div>
        <div
          aria-hidden
          style={{ color: "var(--ink-faint)", fontSize: "1.4rem", letterSpacing: "0.1em" }}
        >
          →
        </div>
      </div>

      {/* Outputs */}
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div className="eyebrow" style={{ marginBottom: "0.25rem", color: "var(--ink-faint)" }}>
          What a citizen gets
        </div>
        {outputs.map((o, n) => (
          <div
            key={o.label}
            style={{
              border: "1px solid var(--accent-soft)",
              borderRadius: 12,
              padding: "0.85rem 1rem",
              background: "var(--bg)",
            }}
          >
            <div style={{ fontWeight: 650 }}>
              <span style={{ color: "var(--accent)" }}>{n + 1}.</span> {o.label}
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--ink-soft)" }}>{o.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
