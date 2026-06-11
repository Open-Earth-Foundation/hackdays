// Sample data for the Civic Climate Action Engagement Module.
//
// In production these shapes come from CityCatalyst's Global API:
//   - GHG Inventory (emissions by sector)
//   - CCRA (Climate Risk Assessment)
//   - HIAP (High Impact Action Prioritizer)
// The "engagement layer" below is the new transformation this module adds:
// it turns top-down city data into bottom-up, citizen-friendly action pathways.

export type EmissionSector = {
  sector: string;
  share: number; // % of total city emissions
  plainLanguage: string;
};

export type ClimateRisk = {
  hazard: string;
  level: "Low" | "Medium" | "High";
  neighborhoodNote: string;
};

export type ActionPathway = {
  title: string;
  // Which CityCatalyst signal this pathway responds to.
  source: "HIAP" | "GHGI" | "CCRA";
  priority: "High" | "Medium";
  whyItMatters: string;
  citizenSteps: string[];
  engagement: {
    label: string;
    kind: "Community" | "Policy" | "Lawmaking" | "Volunteer";
  }[];
};

export type CityProfile = {
  name: string;
  country: string;
  population: string;
  inventoryYear: number;
  emissions: EmissionSector[];
  risks: ClimateRisk[];
  pathways: ActionPathway[];
};

export const city: CityProfile = {
  name: "Rio Branco",
  country: "Brazil",
  population: "419,000",
  inventoryYear: 2023,
  emissions: [
    {
      sector: "Transportation",
      share: 38,
      plainLanguage: "Cars, buses, and trucks moving people and goods around the city.",
    },
    {
      sector: "Stationary Energy",
      share: 31,
      plainLanguage: "Electricity and fuel used in homes, shops, and offices.",
    },
    {
      sector: "Waste",
      share: 19,
      plainLanguage: "Landfills and wastewater releasing methane as things break down.",
    },
    {
      sector: "Land Use (AFOLU)",
      share: 12,
      plainLanguage: "Deforestation and land conversion around the city's edges.",
    },
  ],
  risks: [
    {
      hazard: "River Flooding",
      level: "High",
      neighborhoodNote: "Low-lying riverside neighborhoods flood during the wet season.",
    },
    {
      hazard: "Extreme Heat",
      level: "Medium",
      neighborhoodNote: "Dense areas with little tree cover trap heat on the worst days.",
    },
    {
      hazard: "Wildfire Smoke",
      level: "Medium",
      neighborhoodNote: "Regional burning season degrades air quality for weeks at a time.",
    },
  ],
  pathways: [
    {
      title: "Expand the urban tree canopy",
      source: "HIAP",
      priority: "High",
      whyItMatters:
        "Ranked high-impact: cools heat-trapping neighborhoods and absorbs carbon. Directly addresses the city's Medium extreme-heat risk.",
      citizenSteps: [
        "Join a neighborhood tree-planting mutirão this season.",
        "Request street trees for your block through the city greening program.",
        "Back the urban forest line item at the next participatory budget vote.",
      ],
      engagement: [
        { label: "Local tree-planting groups", kind: "Community" },
        { label: "Participatory budgeting", kind: "Policy" },
      ],
    },
    {
      title: "Shift trips to buses, bikes, and walking",
      source: "GHGI",
      priority: "High",
      whyItMatters:
        "Transportation is the city's largest emissions source (38%). Better transit and bike lanes cut emissions and air pollution at once.",
      citizenSteps: [
        "Submit a public comment in the bus network redesign consultation.",
        "Map an unsafe cycling route with a local mobility collective.",
        "Attend the transport committee session at city council.",
      ],
      engagement: [
        { label: "Mobility advocacy collectives", kind: "Community" },
        { label: "Bus redesign public comment", kind: "Policy" },
        { label: "City council transport committee", kind: "Lawmaking" },
      ],
    },
    {
      title: "Stand up a riverside resilience plan",
      source: "CCRA",
      priority: "High",
      whyItMatters:
        "River flooding is the city's High climate risk. Community-led early warning and drainage planning protect the most exposed neighborhoods.",
      citizenSteps: [
        "Join your local watershed / resilience council.",
        "Attend the flood preparedness planning session before wet season.",
        "Help register vulnerable households for the early-warning alert system.",
      ],
      engagement: [
        { label: "Watershed council", kind: "Community" },
        { label: "Resilience planning session", kind: "Policy" },
        { label: "Early-warning volunteer corps", kind: "Volunteer" },
      ],
    },
    {
      title: "Capture methane from waste",
      source: "GHGI",
      priority: "Medium",
      whyItMatters:
        "Waste is 19% of emissions and mostly methane — a fast-acting greenhouse gas. Source separation and landfill capture deliver quick wins.",
      citizenSteps: [
        "Start or join a neighborhood composting hub.",
        "Support the organics-collection ordinance under review.",
        "Volunteer for a recycling cooperative drive.",
      ],
      engagement: [
        { label: "Composting & recycling co-ops", kind: "Volunteer" },
        { label: "Organics-collection ordinance", kind: "Lawmaking" },
      ],
    },
  ],
};
