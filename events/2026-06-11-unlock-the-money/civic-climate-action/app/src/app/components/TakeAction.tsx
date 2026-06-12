"use client";

import { useMemo, useState } from "react";
import { actionPathways } from "../data/actions";
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
