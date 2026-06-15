// CityCatalyst context provider — the AI-agent / shared-context SEAM.
// Today this returns simulated context (identity + inventory + CCRA + HIAP + plan)
// and a canned "agent assist". In production these calls go to CityCatalyst's MCP /
// agent layer so context is shared across modules. Keep this interface stable.

export interface CityContext {
  cityId: string;
  inventory: { topSectors: { sector: string; sharePct: number }[]; year: number; source: string };
  ccra: { hazards: { hazard: string; risk: "high" | "medium" | "low" }[]; source: string };
  hiap: { actionId: string; name: string; sector: string; type: "mitigation" | "adaptation"; rank: number }[];
  plan: { name: string; status: string; actionsCount: number };
  // the city's own project pipeline — for an INTRA-city portfolio
  projects: { title: string; sector: string; askUSDm: number }[];
  source: "simulated" | "citycatalyst-mcp";
}

const CONTEXT: Record<string, CityContext> = {
  // Valdivia (Chile)
  "SNG-CLZAL": {
    cityId: "SNG-CLZAL",
    inventory: { year: 2022, source: "CityCatalyst GHGI (simulated)", topSectors: [
      { sector: "Transportation", sharePct: 38 }, { sector: "Stationary energy", sharePct: 31 }, { sector: "Waste", sharePct: 19 },
    ] },
    ccra: { source: "CityCatalyst CCRA (simulated)", hazards: [
      { hazard: "River / coastal flooding", risk: "high" }, { hazard: "Wildfire", risk: "medium" }, { hazard: "Water scarcity", risk: "medium" },
    ] },
    hiap: [
      { actionId: "c40_0023", name: "Adopt zero-emission bus fleets", sector: "transportation", type: "mitigation", rank: 1 },
      { actionId: "ipcc_0001", name: "Transit-oriented development", sector: "transportation", type: "mitigation", rank: 2 },
      { actionId: "ipcc_0105", name: "Active mobility / road space reallocation", sector: "transportation", type: "mitigation", rank: 3 },
    ],
    plan: { name: "Valdivia Climate Action Plan", status: "Adopted 2023", actionsCount: 102 },
    projects: [
      { title: "Zero-emission transport (e-bus + BRT)", sector: "transport", askUSDm: 8 },
      { title: "Organic waste & biogas", sector: "waste", askUSDm: 6 },
      { title: "Riverfront flood resilience", sector: "water", askUSDm: 9 },
      { title: "Municipal building energy retrofit", sector: "energy", askUSDm: 5 },
    ],
    source: "simulated",
  },
  // Canoas (Brazil)
  "SNG-BR-4304606": {
    cityId: "SNG-BR-4304606",
    inventory: { year: 2022, source: "CityCatalyst GHGI (simulated)", topSectors: [
      { sector: "Stationary energy", sharePct: 41 }, { sector: "Transportation", sharePct: 27 }, { sector: "Waste", sharePct: 21 },
    ] },
    ccra: { source: "CityCatalyst CCRA (simulated)", hazards: [
      { hazard: "River flooding (Guaíba basin)", risk: "high" }, { hazard: "Extreme rainfall", risk: "high" }, { hazard: "Heat stress", risk: "medium" },
    ] },
    hiap: [
      { actionId: "ipcc_0210", name: "Urban drainage & flood defences", sector: "water", type: "adaptation", rank: 1 },
      { actionId: "ipcc_0233", name: "Nature-based riverine buffers", sector: "afolu", type: "adaptation", rank: 2 },
      { actionId: "c40_0061", name: "Early-warning & resilient infrastructure", sector: "water", type: "adaptation", rank: 3 },
    ],
    plan: { name: "Canoas Resilience & Adaptation Plan", status: "Draft 2025", actionsCount: 64 },
    projects: [
      { title: "Flood drainage & defences (post-2024)", sector: "water", askUSDm: 45 },
    ],
    source: "simulated",
  },
};

export function getCityContext(cityId: string): CityContext | null {
  return CONTEXT[cityId] || null;
}

export function agentAssist(opts: { cityName: string; tier: string; cleared: boolean; pathway: string }): {
  simulated: true;
  text: string;
} {
  const { cityName, tier, cleared, pathway } = opts;
  let text: string;
  if (tier === "Ready" && cleared) {
    text = `${cityName} clears the early creditworthiness assessment. A single project may be below the instrument's ticket size — you can either bundle ${cityName}'s own projects into an intra-city portfolio, or pool credit lines with neighbouring cities. Then assemble the dossier.`;
  } else if (pathway === "capacity-building") {
    text = `${cityName} isn't yet eligible. The gap is not debt — it's liquidity, savings and accounting quality. I'd recommend a capacity-building track (fix accounting to lift the ICF rating, build cash reserves) plus grant / blended finance for adaptation now, rather than a guaranteed-credit application.`;
  } else {
    text = `${cityName} is on the readiness path. Close the named gaps via targeted TC, then re-assess for the instrument.`;
  }
  return { simulated: true, text };
}
