// Unified "where to engage locally" sources per pilot city — reused as grounding
// for the AI develop panel (chips + names passed to the LLM). Reconciles the two
// earlier engagement representations into one shape:
//   - Porto Alegre: derived from the teammate's localEngagement.ts (do not edit it).
//   - São Paulo: a small curated set (real municipal + community channels).

import type { LocalSource } from "./localEngagement";
import { portoAlegreEngagementRecommendations } from "./localEngagement";

// Flatten + dedupe POA sources by id.
const poaSources: LocalSource[] = Array.from(
  new Map(
    portoAlegreEngagementRecommendations.flatMap((r) => r.sources).map((s) => [s.id, s])
  ).values()
);

const saoPauloSources: LocalSource[] = [
  {
    id: "sp-participemais",
    name: "Participe+ São Paulo",
    type: "official",
    url: "https://participemais.prefeitura.sp.gov.br/",
    note: "City participation platform — open consultations, proposals and participatory processes.",
  },
  {
    id: "sp-cades",
    name: "CADES — Conselho Municipal do Meio Ambiente",
    type: "official",
    url: "https://www.prefeitura.sp.gov.br/cidade/secretarias/meio_ambiente/conselho_municipal_do_meio_ambiente/",
    note: "Municipal environment & sustainable-development council with public sessions.",
  },
  {
    id: "sp-defesacivil",
    name: "Defesa Civil de São Paulo",
    type: "official",
    url: "https://www.prefeitura.sp.gov.br/cidade/secretarias/subprefeituras/defesa_civil/",
    note: "Official disaster-risk and emergency-response channel (heat, flooding).",
  },
  {
    id: "sp-ciclocidade",
    name: "Ciclocidade",
    type: "community",
    url: "https://www.ciclocidade.org.br/",
    note: "Cycling-advocacy association — active mobility campaigns. Community source; verify locally.",
  },
];

export const localSourcesByCity: Record<string, LocalSource[]> = {
  "porto-alegre": poaSources,
  "sao-paulo": saoPauloSources,
};

export const localSourceNamesByCity: Record<string, string[]> = {
  "porto-alegre": poaSources.map((s) => s.name),
  "sao-paulo": saoPauloSources.map((s) => s.name),
};
