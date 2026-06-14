"use client";

import type { Lang } from "../data/climateActions";
import type { LocalSource } from "../data/localEngagement";
import type { RankedAction } from "../lib/prioritize";
import { useLocalize } from "../lib/useLocalize";

const typeColor = { adaptation: "var(--accent)", mitigation: "#d97706" } as const;

const t = {
  develop: { en: "Develop this with AI", es: "Desarrollar con IA", pt: "Desenvolver com IA" },
  regenerate: { en: "Regenerate", es: "Regenerar", pt: "Regenerar" },
  working: { en: "Developing a local plan…", es: "Generando un plan local…", pt: "Gerando um plano local…" },
  plan: { en: "Your local plan", es: "Tu plan local", pt: "Seu plano local" },
  empty: {
    en: "Pick an action on the left, then develop a concrete plan grounded in",
    es: "Elige una acción a la izquierda y desarrolla un plan concreto basado en",
    pt: "Escolha uma ação à esquerda e desenvolva um plano concreto baseado em",
  },
  where: { en: "Where to engage locally", es: "Dónde participar localmente", pt: "Onde participar localmente" },
  estimated: { en: "estimated", es: "estimado", pt: "estimado" },
};

export default function AiDevelopPanel({
  ranked,
  cityName,
  cityContext,
  localSources,
  lang,
}: {
  ranked: RankedAction;
  cityName: string;
  cityContext: { country: string; topHazards: string[]; topSectors: string[]; localSources: string[] };
  localSources: LocalSource[];
  lang: Lang;
}) {
  const { action } = ranked;
  const { run, loading, result } = useLocalize();

  function develop() {
    run({
      action: { name: action.name[lang], description: action.description[lang], type: action.actionType },
      cityContext: { name: cityName, ...cityContext },
      language: lang,
    });
  }

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "1.3rem 1.4rem",
        background: "var(--bg-soft)",
        display: "flex",
        flexDirection: "column",
        minHeight: 260,
      }}
    >
      <span
        style={{
          fontSize: "0.66rem",
          fontWeight: 700,
          color: typeColor[action.actionType],
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {action.actionType}
      </span>
      <h4 style={{ fontSize: "1.15rem", margin: "0.2rem 0 0.5rem", lineHeight: 1.25 }}>{action.name[lang]}</h4>
      <p style={{ fontSize: "0.88rem", color: "var(--ink-soft)", margin: "0 0 1rem" }}>
        {action.description[lang].length > 240
          ? action.description[lang].slice(0, 237).trimEnd() + "…"
          : action.description[lang]}
      </p>

      {!result && !loading && (
        <>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-faint)", margin: "0 0 0.9rem" }}>
            {t.empty[lang]} {cityName}.
          </p>
          <button onClick={develop} style={ctaStyle}>
            ✦ {t.develop[lang]}
          </button>
        </>
      )}

      {loading && <div style={{ fontSize: "0.9rem", color: "var(--ink-faint)" }}>{t.working[lang]}</div>}

      {result && (
        <div>
          <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
            {t.plan[lang]}
          </div>
          <ol style={{ margin: "0 0 0.8rem", paddingLeft: "1.2rem", fontSize: "0.95rem", color: "var(--ink)", lineHeight: 1.5 }}>
            {result.localizedSteps.map((step, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {step}
              </li>
            ))}
          </ol>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
            <button onClick={develop} style={{ ...ctaStyle, width: "auto", padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}>
              ↻ {t.regenerate[lang]}
            </button>
            <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>
              ~{result.gCO2e.toFixed(3)} g CO₂e ({t.estimated[lang]}) · {result.model}
            </span>
          </div>
        </div>
      )}

      {localSources.length > 0 && (
        <div style={{ marginTop: "auto", paddingTop: "0.9rem", borderTop: "1px solid var(--line)" }}>
          <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
            {t.where[lang]}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {localSources.slice(0, 8).map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.note}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 999,
                  padding: "0.2rem 0.55rem",
                  fontSize: "0.74rem",
                  color: s.type === "official" ? "var(--accent)" : "var(--ink-soft)",
                  background: s.type === "official" ? "var(--accent-soft)" : "var(--bg)",
                }}
              >
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ctaStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: "0.9rem",
  fontWeight: 650,
  cursor: "pointer",
  color: "#fff",
  background: "var(--accent)",
  border: "none",
  borderRadius: 8,
  padding: "0.6rem 1rem",
  width: "100%",
};
