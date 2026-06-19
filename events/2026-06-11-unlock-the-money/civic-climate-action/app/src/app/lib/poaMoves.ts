// The anti-slop core: for each worry a Porto Alegre resident might have, and each
// level of appetite, ONE concrete next move tied to a REAL, working local channel.
// Channels/URLs are drawn from the curated portoAlegreEngagementRecommendations
// (data/localEngagement.ts) — we only add the imperative framing, the "what happens
// next", and a seed for the AI-written message. Nothing here is generated; the AI
// only fills the message words.

export type Appetite = "quick" | "deeper";
export type WorryKey = "flooding" | "landslides" | "heat" | "energy" | "mobility";

export type Move = {
  recId: string; // commitment actionId — ties the tally to this concern
  intent: "report" | "comment" | "propose" | "join";
  headline: string; // a direct imperative, not a category
  channelName: string;
  channelUrl: string;
  channelType: "official" | "community";
  time: string;
  whatNext: string; // closes the loop: what the channel does with it
  messageSeed: string; // what the ready-to-send message should ask for
};

export type Worry = {
  key: WorryKey;
  label: string;
  icon: string;
  blurb: string;
  level?: string; // CCRA signal, shown as a badge when "Very High"
  moves: Record<Appetite, Move>;
};

export const poaWorries: Worry[] = [
  {
    key: "flooding",
    label: "Flooding",
    icon: "🌊",
    level: "Very High",
    blurb: "Drainage and flood risk to homes and streets.",
    moves: {
      quick: {
        recId: "poa-flood-resilience",
        intent: "report",
        headline: "Report a flooding or drainage problem on your street to Defesa Civil.",
        channelName: "Defesa Civil de Porto Alegre",
        channelUrl: "https://prefeitura.poa.br/defesa-civil",
        channelType: "official",
        time: "~10 min",
        whatNext:
          "Defesa Civil logs the location and routes it to the city's drainage and risk teams — concrete, located reports are what push a street up the investment list.",
        messageSeed:
          "report a specific flood-prone or blocked-drainage point and ask that it be assessed and prioritised for drainage works",
      },
      deeper: {
        recId: "poa-flood-resilience",
        intent: "propose",
        headline: "Take flood-drainage priorities to your region's participatory-budget assembly.",
        channelName: "Orçamento Participativo",
        channelUrl: "https://prefeitura.poa.br/smgov/orcamento-participativo",
        channelType: "official",
        time: "1–2 hrs",
        whatNext:
          "Porto Alegre invented participatory budgeting — proposals voted up in your regional assembly become real funded works. Sewerage here grew from 46% to ~86% of the city this way.",
        messageSeed:
          "propose that drainage and flood-protection works in your neighbourhood be put forward and voted on at the regional participatory-budget assembly",
      },
    },
  },
  {
    key: "landslides",
    label: "Landslides",
    icon: "⛰️",
    level: "Very High",
    blurb: "Slope and hillside risk to people and infrastructure.",
    moves: {
      quick: {
        recId: "poa-landslide-prevention",
        intent: "report",
        headline: "Report slope instability or a blocked drain in a risk area to Defesa Civil.",
        channelName: "Defesa Civil de Porto Alegre",
        channelUrl: "https://prefeitura.poa.br/defesa-civil",
        channelType: "official",
        time: "~10 min",
        whatNext:
          "Your observation feeds the civil-defense risk map that decides where stabilization work and early-warning go first.",
        messageSeed:
          "report signs of slope instability, cracking, or drainage blockage in a hillside area and ask for a risk assessment",
      },
      deeper: {
        recId: "poa-landslide-prevention",
        intent: "comment",
        headline:
          "Ask the urban-environment council (CMDUA) how landslide-prevention investment is prioritised.",
        channelName: "Conselho Municipal de Desenvolvimento Urbano Ambiental (CMDUA)",
        channelUrl: "https://prefeitura.poa.br/smamus/planejamento-urbano/cmdua",
        channelType: "official",
        time: "30–60 min",
        whatNext:
          "CMDUA reviews land-use and planning decisions in public — a resident question on the record forces prevention onto the agenda.",
        messageSeed:
          "ask, on the public record, how landslide-prevention maps and investments are prioritised and how residents in exposed areas can be included",
      },
    },
  },
  {
    key: "heat",
    label: "Heat & no shade",
    icon: "🌳",
    blurb: "Heatwaves and streets that need trees and cooling.",
    moves: {
      quick: {
        recId: "poa-heat-green-infrastructure",
        intent: "report",
        headline: "Nominate a hot street, bus stop, school, or plaza that needs shade and trees.",
        channelName: "Planejamento e cuidado com árvores (Prefeitura)",
        channelUrl: "https://prefeitura.poa.br/smamus/planejamento-e-cuidado-com-arvores",
        channelType: "official",
        time: "~15 min",
        whatNext:
          "The tree-care service maps requests; clustered nominations are how planting and cooling get scheduled where heat hits hardest.",
        messageSeed:
          "nominate a specific hot, treeless spot (a bus stop, school, or plaza) for shade trees and explain who is exposed there",
      },
      deeper: {
        recId: "poa-heat-green-infrastructure",
        intent: "join",
        headline: "Join AGAPAN to push for equitable tree care and shade with others.",
        channelName: "AGAPAN",
        channelUrl: "https://www.agapan.org.br/",
        channelType: "community",
        time: "Ongoing",
        whatNext:
          "AGAPAN has defended green space in Rio Grande do Sul for decades — joining adds your voice to an organised campaign the environment council already listens to.",
        messageSeed:
          "introduce yourself as a resident who wants to help protect and expand trees and shade, and ask how to get involved",
      },
    },
  },
  {
    key: "energy",
    label: "Energy bills & comfort",
    icon: "🏠",
    blurb: "Hot homes and high bills — efficiency and comfort.",
    moves: {
      quick: {
        recId: "poa-residential-energy",
        intent: "comment",
        headline:
          "Ask for home-efficiency help for heat-exposed, low-income homes — citing the city's Climate Action Plan.",
        channelName: "Plano de Ação Climática de Porto Alegre",
        channelUrl: "https://prefeitura.poa.br/smamus/plano-de-acao-climatica",
        channelType: "official",
        time: "~15 min",
        whatNext:
          "Citing the city's own plan turns a personal ask into a policy-aligned one officials can act on.",
        messageSeed:
          "ask for residential energy-efficiency and retrofit support that prioritises low-income, heat-exposed households, referencing the city's Climate Action Plan",
      },
      deeper: {
        recId: "poa-residential-energy",
        intent: "propose",
        headline: "Propose a building-efficiency program for low-income homes at participatory budgeting.",
        channelName: "Orçamento Participativo",
        channelUrl: "https://prefeitura.poa.br/smgov/orcamento-participativo",
        channelType: "official",
        time: "1–2 hrs",
        whatNext:
          "Efficiency upgrades voted through participatory budgeting reach the households that feel heat and bills hardest.",
        messageSeed:
          "propose a neighbourhood building-efficiency / retrofit program for low-income homes to the regional participatory-budget assembly",
      },
    },
  },
  {
    key: "mobility",
    label: "Getting around safely",
    icon: "🚲",
    blurb: "Safer walking, cycling, and public-space access.",
    moves: {
      quick: {
        recId: "poa-active-mobility",
        intent: "comment",
        headline: "Comment on a street redesign, bike lane, or pedestrian-safety plan to the mobility council.",
        channelName: "Conselho Municipal de Mobilidade Urbana (COMMU)",
        channelUrl: "https://prefeitura.poa.br/catalogo-conselhos/commu",
        channelType: "official",
        time: "15–30 min",
        whatNext:
          "COMMU is the consultative body for mobility policy — public comments shape what actually gets built.",
        messageSeed:
          "comment on a specific street, crossing, or bike-lane that needs to be safer, and ask that active mobility be prioritised there",
      },
      deeper: {
        recId: "poa-active-mobility",
        intent: "join",
        headline: "Join Bike Anjo to push for safe streets together.",
        channelName: "Bike Anjo",
        channelUrl: "https://bikeanjo.org/",
        channelType: "community",
        time: "Ongoing",
        whatNext:
          "Bike Anjo's volunteers help new riders and campaign for safer streets — organised numbers are what move mobility decisions.",
        messageSeed:
          "introduce yourself as a resident who wants safer cycling and walking, and ask how to join the local volunteer network",
      },
    },
  },
];

// Resident-facing "why your one action counts" — the awareness / aggregate-demand
// framing. This belongs in the UI (so residents understand the leverage), NOT in
// the message sent to the channel.
export const whyByIntent: Record<Move["intent"], string> = {
  report:
    "On its own, one report flags a single spot. But located reports are data — the city, and the funders behind its budget, decide where money goes by where problems are documented. Reporting is how your street gets counted.",
  comment:
    "A lone comment is easy to overlook; a visible pattern of residents asking for the same thing is not. Public, on-the-record input is what shifts what councils prioritize — and what funders see as real demand.",
  propose:
    "Proposals carried by residents, and backed by others, are what budgets respond to. You're not just asking — you're building the documented demand that unlocks funding.",
  join:
    "Organized numbers move decisions one person can't. Joining adds your voice to a group that stakeholders, and the funders who work through them, already take seriously.",
};

export const appetiteMeta: Record<Appetite, { label: string; desc: string; icon: string }> = {
  quick: { label: "Quick & online", desc: "About 15 minutes, from where you are.", icon: "⚡" },
  deeper: { label: "Deeper, with others", desc: "An hour or two — show up or join people.", icon: "🤝" },
};

export function getMove(worry: WorryKey, appetite: Appetite): Move {
  const w = poaWorries.find((x) => x.key === worry)!;
  return w.moves[appetite];
}

// Each worry's two moves share one recId (the underlying action) — so recId ↔ worry
// is 1:1. Used to label the "most-backed actions" ranking.
export function worryByRecId(recId: string): Worry | undefined {
  return poaWorries.find((w) => w.moves.quick.recId === recId || w.moves.deeper.recId === recId);
}
