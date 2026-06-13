"use client";

import { useState } from "react";
import type { Lang } from "../data/climateActions";
import type { RankedAction } from "../lib/prioritize";
import { useLocalize } from "../lib/useLocalize";

const typeMeta = {
  adaptation: { label: { en: "Adaptation", es: "Adaptación", pt: "Adaptação" }, color: "var(--accent)" },
  mitigation: { label: { en: "Mitigation", es: "Mitigación", pt: "Mitigação" }, color: "#d97706" },
} as const;

const coBenefitLabel: Record<string, Record<Lang, string>> = {
  air_quality: { en: "Air quality", es: "Calidad del aire", pt: "Qualidade do ar" },
  water_quality: { en: "Water", es: "Agua", pt: "Água" },
  habitat: { en: "Habitat", es: "Hábitat", pt: "Habitat" },
  cost_of_living: { en: "Lower costs", es: "Menor costo", pt: "Menor custo" },
  housing: { en: "Housing", es: "Vivienda", pt: "Moradia" },
  mobility: { en: "Mobility", es: "Movilidad", pt: "Mobilidade" },
  stakeholder_engagement: { en: "Civic engagement", es: "Participación", pt: "Participação" },
};

const t = {
  why: { en: "Why this matters for", es: "Por qué importa en", pt: "Por que importa em" },
  make: { en: "Make this concrete for my city", es: "Hazlo concreto para mi ciudad", pt: "Torne isto concreto para minha cidade" },
  working: { en: "Generating…", es: "Generando…", pt: "Gerando…" },
  steps: { en: "Your localized next steps", es: "Tus próximos pasos locales", pt: "Seus próximos passos locais" },
  estimated: { en: "estimated", es: "estimado", pt: "estimado" },
};

export default function ActionCard({
  ranked,
  cityName,
  cityContext,
  lang,
}: {
  ranked: RankedAction;
  cityName: string;
  cityContext: { country: string; topHazards: string[]; topSectors: string[] };
  lang: Lang;
}) {
  const { action, sourceSignals } = ranked;
  const meta = typeMeta[action.actionType];
  const { run, loading, result } = useLocalize();

  // Deduplicate the "why" signals by what they matched on.
  const seen = new Set<string>();
  const signals = sourceSignals.filter((s) => {
    if (seen.has(s.matchedOn)) return false;
    seen.add(s.matchedOn);
    return true;
  });

  const benefits = Object.entries(action.coBenefits)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([k]) => coBenefitLabel[k]?.[lang] ?? k);

  const [open, setOpen] = useState(false);

  function localize() {
    setOpen(true);
    run({
      action: { name: action.name[lang], description: action.description[lang], type: action.actionType },
      cityContext: { name: cityName, ...cityContext },
      language: lang,
    });
  }

  return (
    <article
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "1.3rem 1.4rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: "0.55rem" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: meta.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {meta.label[lang]}
        </span>
        <span style={{ display: "flex", gap: 6 }}>
          {action.cost && <Pill>{action.cost} cost</Pill>}
          {action.timeline && <Pill>{action.timeline}</Pill>}
        </span>
      </div>

      <h4 style={{ fontSize: "1.05rem", margin: "0 0 0.4rem", lineHeight: 1.25 }}>{action.name[lang]}</h4>
      <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: "0 0 0.9rem" }}>
        {action.description[lang].length > 220
          ? action.description[lang].slice(0, 217).trimEnd() + "…"
          : action.description[lang]}
      </p>

      {signals.length > 0 && (
        <div style={{ background: "var(--accent-soft)", borderRadius: 10, padding: "0.6rem 0.8rem", marginBottom: "0.8rem" }}>
          <div className="eyebrow" style={{ marginBottom: "0.3rem" }}>
            {t.why[lang]} {cityName}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {signals.map((s) => (
              <span key={s.matchedOn} style={{ fontSize: "0.8rem", color: "var(--ink)" }}>
                • {s.cityValue}
              </span>
            ))}
          </div>
        </div>
      )}

      {benefits.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: "0.9rem" }}>
          {benefits.map((b) => (
            <span
              key={b}
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--accent)",
                border: "1px solid var(--accent-soft)",
                background: "var(--bg)",
                padding: "0.12rem 0.5rem",
                borderRadius: 999,
              }}
            >
              + {b}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: "0.85rem", borderTop: "1px solid var(--line)" }}>
        {!open ? (
          <button onClick={localize} style={ctaStyle}>
            ✦ {t.make[lang]}
          </button>
        ) : (
          <div>
            <div className="eyebrow" style={{ marginBottom: "0.4rem" }}>
              {loading ? t.working[lang] : t.steps[lang]}
            </div>
            {loading && <div style={{ fontSize: "0.85rem", color: "var(--ink-faint)" }}>…</div>}
            {result && (
              <>
                <ol style={{ margin: "0 0 0.5rem", paddingLeft: "1.1rem", fontSize: "0.9rem", color: "var(--ink)" }}>
                  {result.localizedSteps.map((step, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {step}
                    </li>
                  ))}
                </ol>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-faint)" }}>
                  ~{result.gCO2e.toFixed(2)} g CO₂e · {result.model}
                  {result.mock ? ` · ${t.estimated[lang]}` : ""}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "0.68rem",
        fontWeight: 600,
        color: "var(--ink-faint)",
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: "0.1rem 0.5rem",
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const ctaStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: "0.85rem",
  fontWeight: 650,
  cursor: "pointer",
  color: "var(--accent)",
  background: "var(--accent-soft)",
  border: "none",
  borderRadius: 8,
  padding: "0.5rem 0.85rem",
  width: "100%",
};
