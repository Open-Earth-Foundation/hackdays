// Plain factual lines derived from a city's real data, in the user's language.
// These are passed to the LLM as the ONLY numbers it may use, so the generated
// content stays grounded and honest.

import type { City, RiskLevel } from "../data/types";
import type { HazardKey, Lang } from "../data/climateActions";
import { normalizeHazard, normalizeSector } from "./hazardNormalize";

const LEVEL_ORDER: Record<RiskLevel, number> = { "Very High": 4, High: 3, Medium: 2, Low: 1 };

const LEVEL_WORD: Record<RiskLevel, Record<Lang, string>> = {
  "Very High": { en: "Very High", es: "Muy alto", pt: "Muito alto" },
  High: { en: "High", es: "Alto", pt: "Alto" },
  Medium: { en: "Medium", es: "Medio", pt: "Médio" },
  Low: { en: "Low", es: "Bajo", pt: "Baixo" },
};

const HAZARD_WORD: Record<HazardKey, Record<Lang, string>> = {
  heatwaves: { en: "Heatwaves", es: "Las olas de calor", pt: "As ondas de calor" },
  landslides: { en: "Landslides", es: "Los deslizamientos", pt: "Os deslizamentos" },
  floods: { en: "Flooding", es: "Las inundaciones", pt: "As inundações" },
  droughts: { en: "Drought", es: "La sequía", pt: "A seca" },
  diseases: { en: "Climate-related disease", es: "Las enfermedades", pt: "As doenças" },
  "sea-level-rise": { en: "Sea-level rise", es: "El aumento del nivel del mar", pt: "A elevação do nível do mar" },
  storms: { en: "Storms", es: "Las tormentas", pt: "As tempestades" },
  wildfires: { en: "Wildfire", es: "Los incendios", pt: "Os incêndios" },
};

const SECTOR_WORD: Record<string, Record<Lang, string>> = {
  transportation: { en: "Transportation", es: "El transporte", pt: "O transporte" },
  stationary_energy: { en: "Energy use in buildings", es: "La energía en edificios", pt: "A energia em edifícios" },
  waste: { en: "Waste", es: "Los residuos", pt: "Os resíduos" },
  ippu: { en: "Industry", es: "La industria", pt: "A indústria" },
  afolu: { en: "Land use", es: "El uso del suelo", pt: "O uso do solo" },
};

function formatCo2e(t: number, lang: Lang): string {
  const unit = (n: number, u: string) =>
    `${n.toLocaleString(lang === "en" ? "en-US" : lang === "es" ? "es" : "pt-BR")} ${u}`;
  if (t >= 1_000_000) return unit(Number((t / 1_000_000).toFixed(1)), "Mt");
  if (t >= 1_000) return unit(Math.round(t / 1_000), "kt");
  return unit(Math.round(t), "t");
}

export function cityFacts(city: City, lang: Lang): string[] {
  const facts: string[] = [];

  // Top distinct hazards (highest severity), up to 2.
  const byKey = new Map<HazardKey, RiskLevel>();
  for (const h of city.risk?.topHazards ?? []) {
    for (const k of normalizeHazard(h.hazard)) {
      const prev = byKey.get(k);
      if (!prev || LEVEL_ORDER[h.level] > LEVEL_ORDER[prev]) byKey.set(k, h.level);
    }
  }
  for (const [key, level] of [...byKey.entries()].slice(0, 2)) {
    const hz = HAZARD_WORD[key][lang];
    const lv = LEVEL_WORD[level][lang];
    if (lang === "es") facts.push(`${hz} tienen un riesgo climático ${lv} en ${city.name}.`);
    else if (lang === "pt") facts.push(`${hz} têm risco climático ${lv} em ${city.name}.`);
    else facts.push(`${hz} are rated ${lv} climate risk in ${city.name}.`);
  }

  // Dominant emitting sector. When the inventory is partial (emissions.note set),
  // the share is known to be overstated, so we DON'T present it as a precise fact —
  // we frame it qualitatively and attach the caveat, so the LLM can't cite a bare %.
  const e = city.emissions;
  if (e?.sectors?.length) {
    const top = [...e.sectors].sort((a, b) => b.sharePct - a.sharePct)[0];
    const key = normalizeSector(top.sector);
    const word = key ? SECTOR_WORD[key][lang] : top.sector;
    const pct = Math.round(top.sharePct);
    if (e.note) {
      // Partial inventory → qualitative only, no precise share.
      if (lang === "es") facts.push(`${word} es la mayor fuente de emisiones medidas de ${city.name} (inventario parcial; la proporción está probablemente sobrestimada).`);
      else if (lang === "pt") facts.push(`${word} é a maior fonte de emissões medidas de ${city.name} (inventário parcial; a proporção está provavelmente superestimada).`);
      else facts.push(`${word} is the largest measured emissions source in ${city.name} (partial inventory; this share is likely overstated).`);
    } else {
      if (lang === "es") facts.push(`${word} es cerca del ${pct}% de las emisiones medidas de ${city.name}.`);
      else if (lang === "pt") facts.push(`${word} é cerca de ${pct}% das emissões medidas de ${city.name}.`);
      else facts.push(`${word} is about ${pct}% of ${city.name}'s measured emissions.`);
    }
  } else if (e?.topSector) {
    const key = normalizeSector(e.topSector);
    const word = key ? SECTOR_WORD[key][lang] : e.topSector;
    if (lang === "es") facts.push(`${word} es la mayor fuente de emisiones de ${city.name}.`);
    else if (lang === "pt") facts.push(`${word} é a maior fonte de emissões de ${city.name}.`);
    else facts.push(`${word} is the largest emissions source in ${city.name}.`);
  }

  // City total emissions.
  if (e?.totalTonnesCo2e) {
    const v = formatCo2e(e.totalTonnesCo2e, lang);
    if (lang === "es") facts.push(`Las emisiones medidas de ${city.name} son de unas ${v} CO₂e al año.`);
    else if (lang === "pt") facts.push(`As emissões medidas de ${city.name} são cerca de ${v} CO₂e por ano.`);
    else facts.push(`${city.name}'s measured emissions are about ${v} CO₂e per year.`);
  }

  return facts;
}
