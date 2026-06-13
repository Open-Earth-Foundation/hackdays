// Curated, LATAM-first civic engagement opportunities per city (the "Engage"
// layer). LATAM lacks clean civic APIs (Open311/Legistar are US-centric), so
// these are hand-curated and honestly flagged `needs_local_validation` until a
// local partner confirms the current link/contact — adopting the data contract
// from the parallel team's branch.

import type { LangString } from "./climateActions";

export type CitizenActionKind = "attend_meeting" | "submit_feedback" | "join_group";
export type Difficulty = "easy" | "moderate" | "committed";

export type CitizenAction = {
  kind: CitizenActionKind;
  label: LangString;
  difficulty: Difficulty;
};

export type EngagementOpportunity = {
  id: string;
  title: LangString;
  description: LangString;
  citizenActions: CitizenAction[];
  url?: string;
  needs_local_validation: boolean;
};

const join = (en: string, es: string, pt: string, difficulty: Difficulty): CitizenAction => ({
  kind: "join_group",
  label: { en, es, pt },
  difficulty,
});
const attend = (en: string, es: string, pt: string, difficulty: Difficulty): CitizenAction => ({
  kind: "attend_meeting",
  label: { en, es, pt },
  difficulty,
});
const feedback = (en: string, es: string, pt: string, difficulty: Difficulty): CitizenAction => ({
  kind: "submit_feedback",
  label: { en, es, pt },
  difficulty,
});

export const engagementByCity: Record<string, EngagementOpportunity[]> = {
  "sao-paulo": [
    {
      id: "sp-cades",
      title: {
        en: "Municipal Council for the Environment (CADES)",
        es: "Consejo Municipal de Medio Ambiente (CADES)",
        pt: "Conselho Municipal do Meio Ambiente (CADES)",
      },
      description: {
        en: "São Paulo's environmental council holds public sessions where residents can follow and influence climate and green-area decisions.",
        es: "El consejo ambiental de São Paulo realiza sesiones públicas donde los vecinos pueden seguir e influir en decisiones climáticas.",
        pt: "O conselho ambiental de São Paulo realiza sessões públicas onde moradores podem acompanhar e influenciar decisões climáticas.",
      },
      citizenActions: [
        attend("Attend a public council session", "Asistir a una sesión pública", "Participar de uma sessão pública", "moderate"),
        feedback("Submit a comment on a green-area proposal", "Comentar una propuesta de área verde", "Comentar uma proposta de área verde", "easy"),
      ],
      needs_local_validation: true,
    },
  ],
  "rio-de-janeiro": [
    {
      id: "rio-reflorestamento",
      title: {
        en: "Community Reforestation crews (Mutirão de Reflorestamento)",
        es: "Brigadas comunitarias de reforestación",
        pt: "Mutirão Comunitário de Reflorestamento",
      },
      description: {
        en: "Rio contracts and trains residents to replant landslide-prone hillsides — a direct way to act on the city's flood and landslide risk.",
        es: "Río contrata y capacita a vecinos para reforestar laderas — una forma directa de actuar ante el riesgo de deslizamientos.",
        pt: "O Rio contrata e capacita moradores para reflorestar encostas — uma forma direta de agir sobre o risco de deslizamentos.",
      },
      citizenActions: [
        join("Join a hillside reforestation crew", "Unirse a una brigada de reforestación", "Entrar em um mutirão de reflorestamento", "committed"),
      ],
      needs_local_validation: true,
    },
  ],
  curitiba: [
    {
      id: "cwb-cambio-verde",
      title: {
        en: "Green Exchange (Câmbio Verde)",
        es: "Cambio Verde (Câmbio Verde)",
        pt: "Câmbio Verde",
      },
      description: {
        en: "Bring sorted recyclables to a neighborhood station and swap them for fresh produce — the backbone of Curitiba's citizen recycling.",
        es: "Lleva reciclables separados a una estación de barrio y cámbialos por alimentos frescos.",
        pt: "Leve recicláveis separados a uma estação do bairro e troque por alimentos frescos.",
      },
      citizenActions: [
        join("Take recyclables to a Green Exchange point", "Llevar reciclables a un punto de Cambio Verde", "Levar recicláveis a um ponto do Câmbio Verde", "easy"),
      ],
      needs_local_validation: true,
    },
  ],
  "porto-alegre": [
    {
      id: "poa-orcamento",
      title: {
        en: "Participatory Budgeting (Orçamento Participativo)",
        es: "Presupuesto Participativo (Orçamento Participativo)",
        pt: "Orçamento Participativo",
      },
      description: {
        en: "The city that invented participatory budgeting lets residents vote on real spending — propose or back a climate or drainage project.",
        es: "La ciudad que inventó el presupuesto participativo permite votar el gasto real — propone o apoya un proyecto climático.",
        pt: "A cidade que inventou o orçamento participativo deixa moradores votarem gastos reais — proponha ou apoie um projeto climático.",
      },
      citizenActions: [
        attend("Attend a neighborhood budget assembly", "Asistir a una asamblea de presupuesto", "Participar de uma assembleia do orçamento", "moderate"),
        feedback("Propose a climate or drainage project", "Proponer un proyecto climático o de drenaje", "Propor um projeto climático ou de drenagem", "moderate"),
      ],
      needs_local_validation: true,
    },
  ],
};
