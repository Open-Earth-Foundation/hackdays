"use client";

import type { Lang } from "../data/climateActions";
import type { RankedAction } from "../lib/prioritize";

const typeMeta = {
  adaptation: { label: { en: "Adaptation", es: "Adaptación", pt: "Adaptação" }, color: "var(--accent)" },
  mitigation: { label: { en: "Mitigation", es: "Mitigación", pt: "Mitigação" }, color: "#d97706" },
} as const;

export default function ActionRow({
  ranked,
  lang,
  selected,
  onSelect,
}: {
  ranked: RankedAction;
  lang: Lang;
  selected: boolean;
  onSelect: () => void;
}) {
  const { action, sourceSignals } = ranked;
  const meta = typeMeta[action.actionType];
  const why = sourceSignals[0]?.cityValue;

  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: "left",
        width: "100%",
        border: "1px solid",
        borderColor: selected ? "var(--accent)" : "var(--line)",
        background: selected ? "var(--accent-soft)" : "var(--bg)",
        borderRadius: 10,
        padding: "0.7rem 0.85rem",
        cursor: "pointer",
        font: "inherit",
        display: "block",
      }}
    >
      <span style={{ fontSize: "0.66rem", fontWeight: 700, color: meta.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {meta.label[lang]}
      </span>
      <span style={{ display: "block", fontWeight: 600, fontSize: "0.92rem", margin: "0.15rem 0", lineHeight: 1.25 }}>
        {action.name[lang]}
      </span>
      {why && (
        <span style={{ fontSize: "0.76rem", color: "var(--ink-faint)" }}>{why}</span>
      )}
    </button>
  );
}
