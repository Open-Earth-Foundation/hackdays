// CityCatalyst HIAP action library — type + re-export of the baked data.
// The data is fetched once and committed (see scripts/fetch-climate-actions.mjs);
// per-city prioritization happens in src/app/lib/prioritize.ts.

export type Lang = "en" | "es" | "pt";
export type LangString = Record<Lang, string>;

export type HazardKey =
  | "droughts"
  | "heatwaves"
  | "floods"
  | "sea-level-rise"
  | "landslides"
  | "storms"
  | "wildfires"
  | "diseases";

export type GhgSectorKey =
  | "stationary_energy"
  | "transportation"
  | "waste"
  | "ippu"
  | "afolu";

export type Effectiveness = "low" | "medium" | "high";

export type CoBenefits = Partial<{
  air_quality: number;
  water_quality: number;
  habitat: number;
  cost_of_living: number;
  housing: number;
  mobility: number;
  stakeholder_engagement: number; // the "fundable" civic-participation co-benefit
}>;

export type ClimateAction = {
  actionId: string;
  name: LangString;
  description: LangString;
  actionType: "mitigation" | "adaptation";
  hazards: HazardKey[];
  sectors: string[]; // GHG sectors + adaptation sectors (e.g. water_resources)
  coBenefits: CoBenefits;
  // Per-sector % reduction range as a string, e.g. "20-39", or null.
  ghgReductionPotential: Partial<Record<GhgSectorKey, string | null>>;
  adaptationEffectiveness: Effectiveness | null;
  adaptationPerHazard: Partial<Record<HazardKey, Effectiveness | null>>;
  cost: string | null; // "low" | "medium" | "high"
  timeline: string | null; // e.g. "<5 years"
  biome: string | null;
  category: string | null;
  keyImpacts: string | null;
};

export { climateActions } from "./climateActions.generated";
