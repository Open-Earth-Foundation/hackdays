import type { Category } from "./types";

// Universal ways a resident can plug into local climate action — the "Act"
// step. Each pathway is tagged with the causes (story categories) it serves,
// so people can filter to what they care about.

export type ActionPathway = {
  id: string;
  title: string;
  what: string;
  firstStep: string;
  effort: "Low" | "Medium";
  categories: Category[];
};

export const actionPathways: ActionPathway[] = [
  {
    id: "join-group",
    title: "Join a local group",
    what: "Find people already working on this and add your hands — almost every win below started with a handful of neighbors.",
    firstStep:
      "Search for a neighborhood association, climate collective, or co-op near you and show up to one meeting.",
    effort: "Low",
    categories: ["Greening", "Mobility", "Energy", "Resilience", "Waste", "Participation"],
  },
  {
    id: "show-up",
    title: "Show up to a public meeting",
    what: "City councils and planning sessions are open to the public — who is in the room shapes what gets prioritized.",
    firstStep:
      "Find the next council or planning agenda and attend (or watch) the one item you care about most.",
    effort: "Low",
    categories: ["Participation", "Mobility", "Resilience"],
  },
  {
    id: "speak-up",
    title: "Speak up in a public comment",
    what: "Most plans have a comment window. A few sentences on the record genuinely count toward the decision.",
    firstStep:
      "Look up an open consultation — transport, budget, zoning — and submit one short comment.",
    effort: "Low",
    categories: ["Mobility", "Participation", "AirQuality"],
  },
  {
    id: "vote-budget",
    title: "Vote on the budget",
    what: "Participatory budgeting lets residents decide how real public money is spent — and fund climate projects directly.",
    firstStep:
      "Check whether your city runs participatory budgeting, then propose or back a green project.",
    effort: "Medium",
    categories: ["Participation", "Greening"],
  },
  {
    id: "start-something",
    title: "Start something small",
    what: "A community garden, a tree-planting crew, a solar co-op — small, visible projects grow into movements.",
    firstStep: "Pick one block-level project and invite three neighbors to join you this week.",
    effort: "Medium",
    categories: ["Greening", "Energy", "Waste"],
  },
  {
    id: "measure",
    title: "Measure your block",
    what: "Citizen science turns an invisible problem — heat, air pollution — into data nobody can ignore.",
    firstStep:
      "Host a low-cost air-quality or heat sensor and share the readings with your community and council.",
    effort: "Medium",
    categories: ["AirQuality", "Resilience"],
  },
  {
    id: "citizens-assembly",
    title: "Call for a citizens' assembly",
    what: "Randomly selected residents, given time and expert input, can shape climate policy directly — as in Paris.",
    firstStep:
      "Ask your council to convene a citizens' assembly on climate — or join one if it already exists.",
    effort: "Medium",
    categories: ["Participation"],
  },
];
