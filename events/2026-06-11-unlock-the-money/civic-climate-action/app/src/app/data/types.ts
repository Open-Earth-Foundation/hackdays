export type Category =
  | "Greening"
  | "Mobility"
  | "Energy"
  | "Resilience"
  | "Waste"
  | "Participation"
  | "AirQuality";

export type StoryImage = {
  url: string;
  credit: string;
  license: string;
  sourcePageUrl: string;
};

export type Story = {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  title: string;
  category: Category;
  whatCitizensDid: string;
  outcome: string;
  year: string;
  sourceName: string;
  sourceUrl: string;
  image?: StoryImage;
};

export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export type Hazard = {
  hazard: string;
  keyImpact?: string;
  level: RiskLevel;
  score?: number; // 0..1 normalised, when from CCRA
};

export type EmissionSector = {
  sector: string;
  sharePct: number;
};

export type Emissions = {
  totalTonnesCo2e: number;
  // Full sector breakdown (CityCatalyst cities). When absent, `topSector` is shown instead.
  sectors?: EmissionSector[];
  // Largest-emitting sector, when only that is known (external inventories).
  topSector?: string;
  inventoryYear: string;
  perCapitaTonnes?: number | null;
  // Short, plain-language caveat (e.g. partial coverage) shown under the figure.
  note?: string;
  source: string;
  sourceUrl: string;
};

export type Risk = {
  topHazards: Hazard[];
  summary?: string;
  year?: number;
  source: string;
  sourceUrl: string;
};

export type City = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  // Plain-language summary of civic climate action happening here.
  summary: string;
  // A few concrete things residents are doing / can do.
  highlights: string[];
  // UN/LOCODE, when the city is in CityCatalyst (enables live data later).
  locode?: string;
  // IDs of success stories anchored in this city.
  storyIds: string[];
  // Where the emissions/risk data below comes from.
  dataProvenance?: "CityCatalyst" | "external";
  emissions?: Emissions | null;
  risk?: Risk | null;
};

export const categoryMeta: Record<Category, { label: string; color: string }> = {
  Greening: { label: "Greening", color: "#15803d" },
  Mobility: { label: "Mobility", color: "#2563eb" },
  Energy: { label: "Energy", color: "#d97706" },
  Resilience: { label: "Resilience", color: "#0f766e" },
  Waste: { label: "Waste", color: "#7c3aed" },
  Participation: { label: "Participation", color: "#be185d" },
  AirQuality: { label: "Air quality", color: "#0891b2" },
};
