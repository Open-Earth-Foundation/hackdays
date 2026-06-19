"use client";

import { useCarbon } from "../lib/carbonContext";

// Persistent per-session footprint of the LLM localizer — the "green AI" story.
export default function CarbonCounter() {
  const { totalGramsCO2e, callCount } = useCarbon();
  if (callCount === 0) return null;

  return (
    <div
      title="Estimated AI carbon this session — a token-based estimate (EcoLogits where the model is supported; otherwise a token model, since the Scaleway model isn't in EcoLogits' registry)."
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg-soft)",
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: "0.45rem 0.85rem",
        fontSize: "0.8rem",
        color: "var(--ink-soft)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--accent)" }} />
      <strong style={{ color: "var(--ink)" }}>~{totalGramsCO2e.toFixed(2)} g CO₂e</strong>
      <span style={{ color: "var(--ink-faint)" }}>(est.) · {callCount} AI {callCount === 1 ? "call" : "calls"}</span>
    </div>
  );
}
