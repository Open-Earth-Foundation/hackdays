"use client";

import { useMemo, useState } from "react";
import type { City } from "../data/types";
import type { Lang } from "../data/climateActions";
import { climateActions } from "../data/climateActions";
import { prioritizeActions } from "../lib/prioritize";
import { localSourcesByCity, localSourceNamesByCity } from "../data/localSources";
import ActionRow from "./ActionRow";
import AiDevelopPanel from "./AiDevelopPanel";

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
  heading: { en: "Develop an action for", es: "Desarrolla una acción para", pt: "Desenvolva uma ação para" },
  intro: {
    en: "Priorities from CityCatalyst's HIAP library, ranked for this city. Pick one and build a concrete, local plan.",
    es: "Prioridades de la biblioteca HIAP de CityCatalyst, ordenadas para esta ciudad. Elige una y crea un plan local concreto.",
    pt: "Prioridades da biblioteca HIAP do CityCatalyst, ordenadas para esta cidade. Escolha uma e crie um plano local concreto.",
  },
};

export default function CityActions({ city }: { city: City }) {
  const [lang, setLang] = useState<Lang>(defaultLang(city.country));
  const ranked = useMemo(() => prioritizeActions(city, climateActions, { topN: 4 }), [city]);
  const [selectedActionId, setSelectedActionId] = useState(ranked[0]?.action.actionId ?? null);

  if (ranked.length === 0) return null;
  const selected = ranked.find((r) => r.action.actionId === selectedActionId) ?? ranked[0];

  const cityContext = {
    country: city.country,
    topHazards: (city.risk?.topHazards ?? []).map((h) => h.hazard),
    topSectors:
      city.emissions?.sectors?.map((s) => s.sector) ??
      (city.emissions?.topSector ? [city.emissions.topSector] : []),
    localSources: localSourceNamesByCity[city.id] ?? [],
  };
  const localSources = localSourcesByCity[city.id] ?? [];

  return (
    <div style={{ marginTop: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">
            {copy.heading[lang]} {city.name}
          </div>
          <p className="muted" style={{ fontSize: "0.88rem", margin: "0.3rem 0 0", maxWidth: 560 }}>
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

      <div className="lab-grid" style={{ marginTop: "1.1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ranked.map((r) => (
            <ActionRow
              key={r.action.actionId}
              ranked={r}
              lang={lang}
              selected={r.action.actionId === selected.action.actionId}
              onSelect={() => setSelectedActionId(r.action.actionId)}
            />
          ))}
        </div>

        <AiDevelopPanel
          key={selected.action.actionId}
          ranked={selected}
          cityName={city.name}
          cityContext={cityContext}
          localSources={localSources}
          lang={lang}
        />
      </div>
    </div>
  );
}
