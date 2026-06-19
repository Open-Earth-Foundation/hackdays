// Real Porto Alegre / Rio Grande do Sul non-profits and volunteer organizations a
// resident can plug into — beyond contacting an official channel. Each org offers
// concrete ways to act: volunteer, attend, back a campaign, or donate. Every URL
// was web-verified (the OEF knowledge base was unreachable when this was built;
// these should be cross-checked there later). Energy has no vetted resident-facing
// org yet — handled with an honest empty state in the UI rather than a fabrication.

import type { WorryKey } from "../lib/poaMoves";

export type OrgActionType = "volunteer" | "attend" | "campaign" | "donate";
export type OrgTheme = "Resilience" | "Greening" | "Mobility" | "Energy";

export type OrgAction = { type: OrgActionType; label: string; url: string };

export type PartnerOrg = {
  id: string;
  name: string;
  theme: OrgTheme;
  worries: WorryKey[];
  what: string; // one line — what they do
  url: string; // homepage
  actions: OrgAction[];
};

export const actionMeta: Record<OrgActionType, { label: string; icon: string }> = {
  volunteer: { label: "Volunteer", icon: "🙋" },
  attend: { label: "Attend", icon: "📅" },
  campaign: { label: "Back a campaign", icon: "📣" },
  donate: { label: "Donate", icon: "💛" },
};

export const partnerOrgs: PartnerOrg[] = [
  // ---- Resilience: flooding + landslides ----
  {
    id: "parceiros-voluntarios",
    name: "Parceiros Voluntários",
    theme: "Resilience",
    worries: ["flooding", "landslides"],
    what: "Connects residents to volunteer with civil-society groups; its “Construir Juntos” program rebuilds organizations and schools hit by the 2024 floods.",
    url: "https://www.parceirosvoluntarios.org.br/",
    actions: [
      { type: "volunteer", label: "Become a volunteer", url: "https://parceirosvoluntarios.org.br/voluntario/" },
      { type: "donate", label: "Support their work", url: "https://parceirosvoluntarios.org.br/sojuntos/" },
    ],
  },
  {
    id: "brazilfoundation-rs",
    name: "BrazilFoundation — Rio Grande do Sul",
    theme: "Resilience",
    worries: ["flooding", "landslides"],
    what: "Mobilizes funds for the recovery and resilience of Rio Grande do Sul after its largest-ever flood.",
    url: "https://brazilfoundation.org/en/help-rio-grande-do-sul/",
    actions: [{ type: "donate", label: "Donate to RS recovery", url: "https://brazilfoundation.org/en/donate-now" }],
  },

  // ---- Greening: heat & shade ----
  {
    id: "agapan",
    name: "AGAPAN",
    theme: "Greening",
    worries: ["heat"],
    what: "Rio Grande do Sul’s oldest environmental association (1971); runs advocacy and campaigns to protect and expand Porto Alegre’s trees and green space.",
    url: "https://www.agapan.org.br/",
    actions: [
      { type: "volunteer", label: "Become a member", url: "https://www.agapan.org.br/" },
      { type: "campaign", label: "Back their tree campaigns", url: "https://www.agapan.org.br/" },
      { type: "donate", label: "Donate", url: "https://www.agapan.org.br/" },
    ],
  },
  {
    id: "arboristas-urbanos",
    name: "Arboristas Urbanos",
    theme: "Greening",
    worries: ["heat"],
    what: "A Porto Alegre collective (since 2011) that plants and cares for urban trees through community plantings, a nursery, and education.",
    url: "https://www.atados.com.br/ong/penha-verde-1",
    actions: [
      { type: "volunteer", label: "Join a planting mutirão", url: "https://www.atados.com.br/ong/penha-verde-1" },
      { type: "attend", label: "Join their actions", url: "https://www.atados.com.br/ong/penha-verde-1" },
    ],
  },

  // ---- Mobility ----
  {
    id: "bike-anjo-poa",
    name: "Bike Anjo Porto Alegre",
    theme: "Mobility",
    worries: ["mobility"],
    what: "Volunteer urban cyclists who help new riders pedal safely and push for safer streets.",
    url: "https://bicianjo.wordpress.com/",
    actions: [
      { type: "volunteer", label: "Ride with a Bike Angel", url: "https://bicianjo.wordpress.com/chame-um-bici-anjo/" },
    ],
  },
  {
    id: "mobicidade",
    name: "Mobicidade",
    theme: "Mobility",
    worries: ["mobility"],
    what: "Porto Alegre’s bicycle-mobility association — volunteer-run advocacy and research for safer cycling and active transport.",
    url: "https://www.mobicidade.org/",
    actions: [
      { type: "campaign", label: "Back their advocacy", url: "https://www.mobicidade.org/" },
      { type: "attend", label: "Get involved", url: "https://www.mobicidade.org/" },
    ],
  },
];

export function orgsForWorry(worry: WorryKey): PartnerOrg[] {
  return partnerOrgs.filter((o) => o.worries.includes(worry));
}

export function orgsByTheme(theme: OrgTheme): PartnerOrg[] {
  return partnerOrgs.filter((o) => o.theme === theme);
}
