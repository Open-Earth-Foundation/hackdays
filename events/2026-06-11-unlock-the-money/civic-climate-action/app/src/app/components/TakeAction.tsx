"use client";

import { useMemo, useState } from "react";
import { actionPathways } from "../data/actions";
import { portoAlegreEngagementRecommendations } from "../data/localEngagement";
import type { Category } from "../data/types";
import { categoryMeta } from "../data/types";

export default function TakeAction() {
  const categories = useMemo(() => {
    const present = new Set<Category>();
    actionPathways.forEach((a) => a.categories.forEach((c) => present.add(c)));
    return Array.from(present);
  }, []);

  const [cause, setCause] = useState<Category | "All">("All");
  const shown =
    cause === "All" ? actionPathways : actionPathways.filter((a) => a.categories.includes(cause));

  return (
    <div>
      <section
        aria-labelledby="porto-alegre-actions"
        style={{
          border: "1px solid var(--line)",
          borderRadius: 18,
          background: "var(--bg-soft)",
          padding: "1.4rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <div className="eyebrow">Demo city · Porto Alegre</div>
            <h3 id="porto-alegre-actions" style={{ fontSize: "1.45rem", margin: "0.45rem 0 0.45rem" }}>
              Local civic actions with real engagement sources
            </h3>
            <p className="muted" style={{ fontSize: "0.95rem" }}>
              These cards turn the Porto Alegre CityCatalyst risk and emissions signals into
              specific resident pathways, backed by official city channels and local community
              sources.
            </p>
          </div>
          <a
            href="#explore"
            style={{
              border: "1px solid var(--line)",
              borderRadius: 999,
              padding: "0.45rem 0.85rem",
              fontSize: "0.82rem",
              fontWeight: 650,
              whiteSpace: "nowrap",
              background: "var(--bg)",
            }}
          >
            See Porto Alegre data
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "1rem",
          }}
        >
          {portoAlegreEngagementRecommendations.map((item) => (
            <article
              key={item.id}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "1.1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <Badge>{item.priority}</Badge>
                <Badge>{item.theme}</Badge>
              </div>
              <div>
                <h4 style={{ fontSize: "1.05rem", margin: "0 0 0.45rem" }}>{item.title}</h4>
                <p style={{ fontSize: "0.87rem", color: "var(--ink-soft)", margin: 0 }}>
                  {item.whyItMatters}
                </p>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: "0.35rem" }}>
                  First moves
                </div>
                <ul style={{ margin: 0, paddingLeft: "1rem", color: "var(--ink-soft)", fontSize: "0.86rem" }}>
                  {item.firstActions.map((action) => (
                    <li key={action.label} style={{ marginBottom: "0.35rem" }}>
                      {action.label}
                      <span style={{ color: "var(--ink-faint)" }}> · {action.timeRequired}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: "auto", borderTop: "1px solid var(--line)", paddingTop: "0.75rem" }}>
                <div className="eyebrow" style={{ marginBottom: "0.4rem" }}>
                  Sources
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {item.sources.map((source) => (
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
                        background: source.type === "official" ? "var(--accent-soft)" : "var(--bg-soft)",
                      }}
                    >
                      {source.name} ↗
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.75rem" }}>
        <Chip label="Anything" color="var(--ink)" selected={cause === "All"} onClick={() => setCause("All")} />
        {categories.map((c) => (
          <Chip
            key={c}
            label={categoryMeta[c].label}
            color={categoryMeta[c].color}
            selected={cause === c}
            onClick={() => setCause(c)}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.1rem",
        }}
      >
        {shown.map((a, i) => (
          <article
            key={a.id}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "1.3rem 1.4rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--ink-faint)",
                  border: "1px solid var(--line)",
                  borderRadius: 999,
                  padding: "0.1rem 0.5rem",
                }}
              >
                {a.effort} effort
              </span>
            </div>

            <h3 style={{ fontSize: "1.15rem", margin: "0 0 0.4rem" }}>{a.title}</h3>
            <p style={{ fontSize: "0.92rem", color: "var(--ink-soft)", margin: "0 0 0.9rem" }}>
              {a.what}
            </p>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "0.85rem",
                borderTop: "1px solid var(--line)",
              }}
            >
              <div className="eyebrow" style={{ marginBottom: "0.25rem" }}>
                First step
              </div>
              <p style={{ fontSize: "0.9rem", margin: 0 }}>{a.firstStep}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Closing CTA */}
      <div
        style={{
          marginTop: "2.5rem",
          padding: "2rem 2.2rem",
          borderRadius: 16,
          background: "var(--accent)",
          color: "#fff",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.25rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <h3 style={{ fontSize: "1.5rem", margin: "0 0 0.4rem", color: "#fff" }}>
            Start where you are.
          </h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.9)", fontSize: "1rem" }}>
            Pick your city, see what it&rsquo;s facing, and take one step this week. Citizen action
            is how a city&rsquo;s plan becomes real — and how funders see it&rsquo;s ready.
          </p>
        </div>
        <a
          href="#explore"
          style={{
            background: "#fff",
            color: "var(--accent)",
            fontWeight: 650,
            padding: "0.75rem 1.4rem",
            borderRadius: 999,
            whiteSpace: "nowrap",
            textDecoration: "none",
          }}
        >
          Find my city →
        </a>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        border: "1px solid var(--line)",
        borderRadius: 999,
        color: "var(--ink-soft)",
        background: "var(--bg-soft)",
        padding: "0.12rem 0.48rem",
        fontSize: "0.7rem",
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function Chip({
  label,
  color,
  selected,
  onClick,
}: {
  label: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        font: "inherit",
        fontSize: "0.84rem",
        fontWeight: 600,
        cursor: "pointer",
        padding: "0.35rem 0.85rem",
        borderRadius: 999,
        border: "1px solid",
        borderColor: selected ? color : "var(--line)",
        background: selected ? color : "var(--bg)",
        color: selected ? "#fff" : "var(--ink-soft)",
      }}
    >
      {label}
    </button>
  );
}
