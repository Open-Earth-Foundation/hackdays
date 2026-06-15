// CityCatalyst context provider — the AI-agent / shared-context SEAM.
// Today this returns simulated context (inventory + HIAP) and a canned "agent
// assist". In production these calls go to CityCatalyst's MCP / agent layer
// (get_city_profile, get_inventory_emissions, HIAP get_prioritization) so context
// is shared across modules. Keep this interface stable; swap the body for live MCP.

export interface CityContext {
  cityId: string;
  inventory: { topSectors: { sector: string; sharePct: number }[]; year: number; source: string };
  hiap: { actionId: string; name: string; sector: string; type: "mitigation" | "adaptation"; rank: number }[];
  source: "simulated" | "citycatalyst-mcp";
}

const CONTEXT: Record<string, CityContext> = {
  // Valdivia (Chile)
  "SNG-CLZAL": {
    cityId: "SNG-CLZAL",
    inventory: { year: 2022, source: "CityCatalyst GHGI (simulated)", topSectors: [
      { sector: "Transportation", sharePct: 38 }, { sector: "Stationary energy", sharePct: 31 }, { sector: "Waste", sharePct: 19 },
    ] },
    hiap: [
      { actionId: "c40_0023", name: "Adopt zero-emission bus fleets", sector: "transportation", type: "mitigation", rank: 1 },
      { actionId: "ipcc_0001", name: "Transit-oriented development", sector: "transportation", type: "mitigation", rank: 2 },
      { actionId: "ipcc_0105", name: "Active mobility / road space reallocation", sector: "transportation", type: "mitigation", rank: 3 },
    ],
    source: "simulated",
  },
  // Canoas (Brazil)
  "SNG-BR-4304606": {
    cityId: "SNG-BR-4304606",
    inventory: { year: 2022, source: "CityCatalyst GHGI (simulated)", topSectors: [
      { sector: "Stationary energy", sharePct: 41 }, { sector: "Transportation", sharePct: 27 }, { sector: "Waste", sharePct: 21 },
    ] },
    hiap: [
      { actionId: "ipcc_0210", name: "Urban drainage & flood defences", sector: "water", type: "adaptation", rank: 1 },
      { actionId: "ipcc_0233", name: "Nature-based riverine buffers", sector: "afolu", type: "adaptation", rank: 2 },
      { actionId: "c40_0061", name: "Early-warning & resilient infrastructure", sector: "water", type: "adaptation", rank: 3 },
    ],
    source: "simulated",
  },
};

export function getCityContext(cityId: string): CityContext | null {
  return CONTEXT[cityId] || null;
}

// Simulated agent assist. In production this is a CityCatalyst agent call that can
// read the city's shared context across modules. Returns guidance + a flag.
export function agentAssist(opts: { cityName: string; tier: string; cleared: boolean; pathway: string }): {
  simulated: true;
  text: string;
} {
  const { cityName, tier, cleared, pathway } = opts;
  let text: string;
  if (tier === "Ready" && cleared) {
    text = `${cityName} clears the early creditworthiness assessment. Its plan is strong but a single project may be below the instrument's ticket size — I'd route it to the portfolio/pooling step to combine with neighbours, then assemble the dossier.`;
  } else if (pathway === "capacity-building") {
    text = `${cityName} isn't yet eligible. Looking at the signals, the gap is not debt — it's liquidity, savings and accounting quality. I'd recommend a capacity-building track (fix accounting to lift the ICF rating, build cash reserves) plus grant/blended finance for adaptation now, rather than a guaranteed-credit application.`;
  } else {
    text = `${cityName} is on the readiness path. Close the named gaps via targeted TC, then re-assess for the instrument.`;
  }
  return { simulated: true, text };
}
