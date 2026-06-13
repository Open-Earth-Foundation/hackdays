"use client";

import { useMemo, useState } from "react";
import type { City } from "../data/types";
import type { Lang } from "../data/climateActions";
import { climateActions } from "../data/climateActions";
import { prioritizeActions } from "../lib/prioritize";
import { engagementByCity } from "../data/engagement";
import ActionCard from "./ActionCard";

const LANGS: { key: Lang; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "es", label: "ES" },
  { key: "pt", label: "PT" },
];

const defaultLang = (country: string): Lang => {
  if (country === "Brazil") return "pt";
  if (["Colombia", "Mexico", "Argentina", "Chile", "Peru"].includes(country)) return "es";
  return "en";
};

const copy = {
  heading: { en: "Prioritized actions for", es: "Acciones prioritarias para", pt: "Ações prioritárias para" },
  intro: {
    en: "Drawn from CityCatalyst's HIAP library and ranked for this city's top risks and emissions.",
    es: "Tomadas de la biblioteca HIAP de CityCatalyst y priorizadas según los riesgos y emisiones de la ciudad.",
    pt: "Extraídas da biblioteca HIAP do CityCatalyst e priorizadas pelos riscos e emissões da cidade.",
  },
  engage: { en: "Where to engage", es: "Dónde participar", pt: "Onde participar" },
  unverified: { en: "needs local validation", es: "requiere validación local", pt: "requer validação local" },
};

export default function CityActions({ city }: { city: City }) {
  const [lang, setLang] = useState<Lang>(defaultLang(city.country));

  const ranked = useMemo(() => prioritizeActions(city, climateActions, { topN: 6 }), [city]);
  if (ranked.length === 0) return null;

  const cityContext = {
    country: city.country,
    topHazards: (city.risk?.topHazards ?? []).map((h) => h.hazard),
    topSectors: city.emissions?.sectors?.map((s) => s.sector) ??
      (city.emissions?.topSector ? [city.emissions.topSector] : []),
  };

  const engagement = engagementByCity[city.id] ?? [];

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">{copy.heading[lang]} {city.name}</div>
          <p className="muted" style={{ fontSize: "0.88rem", margin: "0.3rem 0 0", maxWidth: 520 }}>
            {copy.intro[lang]}
          </p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {LANGS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              style={{
                font: "inherit",
                fontSize: "0.74rem",
                fontWeight: 700,
                cursor: "pointer",
                padding: "0.25rem 0.55rem",
                borderRadius: 8,
                border: "1px solid",
                borderColor: lang === l.key ? "var(--accent)" : "var(--line)",
                background: lang === l.key ? "var(--accent)" : "var(--bg)",
                color: lang === l.key ? "#fff" : "var(--ink-soft)",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {ranked.map((r) => (
          <ActionCard
            key={r.action.actionId}
            ranked={r}
            cityName={city.name}
            cityContext={cityContext}
            lang={lang}
          />
        ))}
      </div>

      {engagement.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>
            {copy.engage[lang]}
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {engagement.map((o) => (
              <div key={o.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "0.9rem 1.1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <strong style={{ fontSize: "0.95rem" }}>{o.title[lang]}</strong>
                  {o.needs_local_validation && (
                    <span style={{ fontSize: "0.66rem", color: "var(--ink-faint)", border: "1px solid var(--line)", borderRadius: 999, padding: "0.05rem 0.45rem", whiteSpace: "nowrap" }}>
                      {copy.unverified[lang]}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.86rem", color: "var(--ink-soft)", margin: "0.3rem 0 0.6rem" }}>
                  {o.description[lang]}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {o.citizenActions.map((a, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--accent)",
                        background: "var(--accent-soft)",
                        borderRadius: 999,
                        padding: "0.2rem 0.6rem",
                      }}
                    >
                      {a.label[lang]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
