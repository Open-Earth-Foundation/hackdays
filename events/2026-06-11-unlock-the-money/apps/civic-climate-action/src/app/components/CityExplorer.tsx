"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { City, Story } from "../data/types";
import { categoryMeta } from "../data/types";

const CityMap = dynamic(() => import("./CityMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "var(--bg-soft)",
        borderRadius: 14,
        color: "var(--ink-faint)",
      }}
    >
      Loading map…
    </div>
  ),
});

function CategoryDot({ category }: { category: Story["category"] }) {
  const m = categoryMeta[category];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: "0.74rem",
        fontWeight: 600,
        color: m.color,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: m.color }} />
      {m.label}
    </span>
  );
}

export default function CityExplorer({ cities, stories }: { cities: City[]; stories: Story[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(cities[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q)
    );
  }, [query, cities]);

  const selected = cities.find((c) => c.id === selectedId) ?? null;
  const selectedStories = selected
    ? stories.filter((s) => selected.storyIds.includes(s.id))
    : [];

  function pick(id: string) {
    setSelectedId(id);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: "1.5rem" }}>
      {/* Left: search + list */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${cities.length} cities…`}
          aria-label="Search cities"
          style={{
            width: "100%",
            padding: "0.7rem 0.9rem",
            border: "1px solid var(--line)",
            borderRadius: 10,
            fontSize: "0.95rem",
            outlineColor: "var(--accent)",
            marginBottom: "0.75rem",
          }}
        />
        <div
          style={{
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            paddingRight: 4,
            maxHeight: 440,
          }}
        >
          {filtered.length === 0 && (
            <p className="muted" style={{ fontSize: "0.9rem", padding: "0.5rem" }}>
              No cities match “{query}”.
            </p>
          )}
          {filtered.map((c) => {
            const active = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => pick(c.id)}
                style={{
                  textAlign: "left",
                  border: "1px solid",
                  borderColor: active ? "var(--accent)" : "var(--line)",
                  background: active ? "var(--accent-soft)" : "var(--bg)",
                  borderRadius: 10,
                  padding: "0.6rem 0.8rem",
                  cursor: "pointer",
                  font: "inherit",
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>
                  {c.country}
                  {c.storyIds.length > 0 && (
                    <span style={{ color: "var(--accent)" }}>
                      {" · "}
                      {c.storyIds.length} {c.storyIds.length === 1 ? "story" : "stories"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: map + detail */}
      <div style={{ display: "grid", gridTemplateRows: "320px auto", gap: "1.25rem" }}>
        <div style={{ height: 320 }}>
          <CityMap cities={cities} selectedId={selectedId} onSelect={pick} />
        </div>

        {selected && (
          <div>
            <h3 style={{ fontSize: "1.4rem" }}>
              {selected.name}, {selected.country}
            </h3>
            <p className="muted" style={{ marginTop: "0.4rem" }}>
              {selected.summary}
            </p>

            {selected.highlights.length > 0 && (
              <ul style={{ margin: "0.9rem 0 0", paddingLeft: "1.1rem", color: "var(--ink)" }}>
                {selected.highlights.map((h) => (
                  <li key={h} style={{ marginBottom: 3 }}>
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {selectedStories.length > 0 && (
              <div style={{ marginTop: "1.25rem", display: "grid", gap: "0.75rem" }}>
                {selectedStories.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      padding: "0.9rem 1rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <CategoryDot category={s.category} />
                      <span style={{ fontSize: "0.74rem", color: "var(--ink-faint)" }}>{s.year}</span>
                    </div>
                    <div style={{ fontWeight: 650, margin: "0.35rem 0 0.2rem" }}>{s.title}</div>
                    <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: 0 }}>
                      {s.outcome}
                    </p>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8rem", display: "inline-block", marginTop: "0.5rem" }}
                    >
                      Source: {s.sourceName} ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
