// Shared display metadata — hazard + sector icons/colors, mirroring CityCatalyst's
// ccra-constants hazard set and SectorColors palette (icons via react-icons, a CC dependency).
import type { IconType } from "react-icons";
import {
  MdOutlineApartment,
  MdOutlineCoronavirus,
  MdOutlineDelete,
  MdOutlineDirectionsBus,
  MdOutlineFactory,
  MdOutlineForest,
  MdOutlineLandslide,
  MdOutlineThermostat,
  MdOutlineWbSunny,
  MdOutlineWaves,
  MdOutlineWaterDrop,
} from "react-icons/md";

export const HAZARDS: { key: string; label: string; icon: IconType }[] = [
  { key: "heatwaves", label: "Heatwaves", icon: MdOutlineThermostat },
  { key: "floods", label: "Floods", icon: MdOutlineWaterDrop },
  { key: "droughts", label: "Droughts", icon: MdOutlineWbSunny },
  { key: "landslides", label: "Landslides", icon: MdOutlineLandslide },
  { key: "diseases", label: "Diseases", icon: MdOutlineCoronavirus },
  { key: "sea-level-rise", label: "Sea level rise", icon: MdOutlineWaves },
];

export const HAZARD_BY_KEY = Object.fromEntries(HAZARDS.map((h) => [h.key, h]));

// Raw hex per CAPAG tier (Leaflet can't resolve Chakra tokens) — keep in sync with theme.ts rating.*
export const TIER_HEX: Record<string, string> = {
  "A+": "#0E5221",
  A: "#2DD05B",
  "B+": "#739F19",
  B: "#C6C61D",
  C: "#F28C37",
  D: "#DF2222",
  "n.d.": "#7A7B9A",
  "n.e.": "#C5CBF5",
};

export const SECTORS: Record<string, { name: string; icon: IconType; color: string }> = {
  I: { name: "Stationary Energy", icon: MdOutlineApartment, color: "sector.I" },
  II: { name: "Transportation", icon: MdOutlineDirectionsBus, color: "sector.II" },
  III: { name: "Waste", icon: MdOutlineDelete, color: "sector.III" },
  IV: { name: "IPPU", icon: MdOutlineFactory, color: "sector.IV" },
  V: { name: "AFOLU", icon: MdOutlineForest, color: "sector.V" },
};
