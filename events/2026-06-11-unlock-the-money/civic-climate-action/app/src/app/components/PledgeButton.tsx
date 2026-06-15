"use client";

import { useState } from "react";
import type { Lang } from "../data/climateActions";
import { usePledges } from "../lib/pledgeContext";

const t = {
  cta: { en: "I'll act on this", es: "Me comprometo", pt: "Vou agir nisto" },
  done: { en: "Counted — thank you", es: "Registrado — gracias", pt: "Registrado — obrigado" },
  tally: { en: "resident commitments here", es: "compromisos de residentes aquí", pt: "compromissos de moradores aqui" },
};

export default function PledgeButton({ cityId, lang }: { cityId: string; lang: Lang }) {
  const { pledge, count } = usePledges();
  const [pledged, setPledged] = useState(false);

  function onClick() {
    if (pledged) return;
    setPledged(true);
    pledge(cityId);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button
        onClick={onClick}
        disabled={pledged}
        style={{
          font: "inherit",
          fontSize: "0.82rem",
          fontWeight: 650,
          cursor: pledged ? "default" : "pointer",
          color: pledged ? "var(--accent)" : "#fff",
          background: pledged ? "var(--accent-soft)" : "var(--accent)",
          border: "none",
          borderRadius: 999,
          padding: "0.4rem 0.9rem",
        }}
      >
        {pledged ? `✓ ${t.done[lang]}` : `✋ ${t.cta[lang]}`}
      </button>
      <span style={{ fontSize: "0.76rem", color: "var(--ink-soft)" }}>
        <strong style={{ color: "var(--ink)" }}>{count(cityId).toLocaleString()}</strong> {t.tally[lang]}
      </span>
    </div>
  );
}
