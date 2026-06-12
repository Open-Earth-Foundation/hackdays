"use client";

import { useMemo, useState } from "react";
import type { Category, Story } from "../data/types";
import { categoryMeta } from "../data/types";

export default function StoriesGallery({ stories }: { stories: Story[] }) {
  const categories = useMemo(() => {
    const present = Array.from(new Set(stories.map((s) => s.category)));
    return present as Category[];
  }, [stories]);

  const [active, setActive] = useState<Category | "All">("All");
  const shown = active === "All" ? stories : stories.filter((s) => s.category === active);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.75rem" }}>
        <Chip label="All" activeColor="var(--ink)" selected={active === "All"} onClick={() => setActive("All")} />
        {categories.map((c) => (
          <Chip
            key={c}
            label={categoryMeta[c].label}
            activeColor={categoryMeta[c].color}
            selected={active === c}
            onClick={() => setActive(c)}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {shown.map((s) => {
          const m = categoryMeta[s.category];
          return (
            <article
              key={s.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {s.image && (
                <div style={{ position: "relative", aspectRatio: "16 / 9", background: "var(--bg-soft)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image.url}
                    alt={`${s.title} — ${s.city}, ${s.country}`}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <a
                    href={s.image.sourcePageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${s.image.credit} · ${s.image.license}`}
                    style={{
                      position: "absolute",
                      bottom: 6,
                      right: 6,
                      fontSize: "0.62rem",
                      color: "#fff",
                      background: "rgba(0,0,0,0.45)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 6,
                    }}
                  >
                    © {s.image.license}
                  </a>
                </div>
              )}
              <div style={{ padding: "1.25rem 1.35rem", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.74rem", fontWeight: 600, color: m.color }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: m.color }} />
                  {m.label}
                </span>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-faint)" }}>{s.year}</span>
              </div>

              <h3 style={{ fontSize: "1.15rem", margin: "0.6rem 0 0.1rem" }}>{s.title}</h3>
              <div style={{ fontSize: "0.82rem", color: "var(--ink-faint)", marginBottom: "0.7rem" }}>
                {s.city}, {s.country}
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: "0 0 0.7rem" }}>
                {s.whatCitizensDid}
              </p>
              <p style={{ fontSize: "0.9rem", margin: "0 0 0.9rem" }}>
                <strong style={{ color: "var(--ink)" }}>Result. </strong>
                <span style={{ color: "var(--ink-soft)" }}>{s.outcome}</span>
              </p>

              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.8rem", marginTop: "auto" }}
              >
                Source: {s.sourceName} ↗
              </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  label,
  activeColor,
  selected,
  onClick,
}: {
  label: string;
  activeColor: string;
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
        borderColor: selected ? activeColor : "var(--line)",
        background: selected ? activeColor : "var(--bg)",
        color: selected ? "#fff" : "var(--ink-soft)",
      }}
    >
      {label}
    </button>
  );
}
