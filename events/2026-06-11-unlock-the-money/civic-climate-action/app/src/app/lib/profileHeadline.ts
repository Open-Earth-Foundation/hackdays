// A one-line, plain-language "at a glance" headline for a city, derived purely
// from its emissions + risk data (no LLM). Localized EN/ES/PT.

import type { City, RiskLevel } from "../data/types";
import type { HazardKey, Lang } from "../data/climateActions";
import { normalizeHazard, normalizeSector } from "./hazardNormalize";

const LEVEL_ORDER: Record<RiskLevel, number> = { "Very High": 4, High: 3, Medium: 2, Low: 1 };

const LEVEL_WORD: Record<RiskLevel, Record<Lang, string>> = {
  "Very High": { en: "Very high", es: "muy alto", pt: "muito alto" },
  High: { en: "High", es: "alto", pt: "alto" },
  Medium: { en: "Medium", es: "medio", pt: "médio" },
  Low: { en: "Low", es: "bajo", pt: "bajo" },
};

const HAZARD_WORD: Record<HazardKey, Record<Lang, string>> = {
  heatwaves: { en: "heatwaves", es: "olas de calor", pt: "ondas de calor" },
  landslides: { en: "landslides", es: "deslizamientos", pt: "deslizamentos" },
  floods: { en: "flooding", es: "inundaciones", pt: "inundações" },
  droughts: { en: "drought", es: "sequía", pt: "seca" },
  diseases: { en: "disease", es: "enfermedades", pt: "doenças" },
  "sea-level-rise": { en: "sea-level rise", es: "aumento del nivel del mar", pt: "elevação do nível do mar" },
  storms: { en: "storms", es: "tormentas", pt: "tempestades" },
  wildfires: { en: "wildfire", es: "incendios", pt: "incêndios" },
};

const SECTOR_WORD: Record<string, Record<Lang, string>> = {
  transportation: { en: "transport", es: "el transporte", pt: "o transporte" },
  stationary_energy: { en: "energy use", es: "la energía", pt: "a energia" },
  waste: { en: "waste", es: "los residuos", pt: "os resíduos" },
  ippu: { en: "industry", es: "la industria", pt: "a indústria" },
  afolu: { en: "land use", es: "el uso del suelo", pt: "o uso do solo" },
};

const JOIN: Record<Lang, string> = { en: " & ", es: " y ", pt: " e " };

function topHazardWords(city: City, lang: Lang): { word: string; level: RiskLevel } | null {
  const hazards = city.risk?.topHazards ?? [];
  if (hazards.length === 0) return null;
  const keys: HazardKey[] = [];
  let level: RiskLevel = "Low";
  for (const h of hazards) {
    if (LEVEL_ORDER[h.level] > LEVEL_ORDER[level]) level = h.level;
    for (const k of normalizeHazard(h.hazard)) if (!keys.includes(k)) keys.push(k);
  }
  if (keys.length === 0) return null;
  const word = keys.slice(0, 2).map((k) => HAZARD_WORD[k][lang]).join(JOIN[lang]);
  return { word, level };
}

function sectorClause(city: City, lang: Lang): string | null {
  const e = city.emissions;
  if (!e) return null;
  if (e.sectors?.length) {
    const top = [...e.sectors].sort((a, b) => b.sharePct - a.sharePct)[0];
    const key = normalizeSector(top.sector);
    const word = key ? SECTOR_WORD[key][lang] : top.sector;
    const pct = Math.round(top.sharePct);
    if (lang === "es") return `${word} genera el ${pct}% de las emisiones`;
    if (lang === "pt") return `${word} gera ${pct}% das emissões`;
    return `${word} drives ${pct}% of emissions`;
  }
  if (e.topSector) {
    const key = normalizeSector(e.topSector);
    const word = key ? SECTOR_WORD[key][lang] : e.topSector.toLowerCase();
    if (lang === "es") return `${word} es la mayor fuente de emisiones`;
    if (lang === "pt") return `${word} é a maior fonte de emissões`;
    return `${word} is the largest emissions source`;
  }
  return null;
}

export function profileHeadline(city: City, lang: Lang = "en"): string | null {
  const hz = topHazardWords(city, lang);
  const sec = sectorClause(city, lang);
  const riskPart = hz
    ? lang === "es"
      ? `Riesgo ${LEVEL_WORD[hz.level].es} por ${hz.word}`
      : lang === "pt"
        ? `Risco ${LEVEL_WORD[hz.level].pt} de ${hz.word}`
        : `${LEVEL_WORD[hz.level].en} risk from ${hz.word}`
    : null;

  if (riskPart && sec) return `${riskPart}; ${sec}.`;
  if (riskPart) return `${riskPart}.`;
  if (sec) return `${sec[0].toUpperCase()}${sec.slice(1)}.`;
  return null;
}
