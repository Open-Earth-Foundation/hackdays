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

// label is an i18n key (hazard.<key>); components resolve it via t(). icon/color stay here.
export const HAZARDS: { key: string; icon: IconType }[] = [
  { key: "heatwaves", icon: MdOutlineThermostat },
  { key: "floods", icon: MdOutlineWaterDrop },
  { key: "droughts", icon: MdOutlineWbSunny },
  { key: "landslides", icon: MdOutlineLandslide },
  { key: "diseases", icon: MdOutlineCoronavirus },
  { key: "sea-level-rise", icon: MdOutlineWaves },
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

// name resolved via t(`sector.<code>`); icon/color stay here.
export const SECTORS: Record<string, { icon: IconType; color: string }> = {
  I: { icon: MdOutlineApartment, color: "sector.I" },
  II: { icon: MdOutlineDirectionsBus, color: "sector.II" },
  III: { icon: MdOutlineDelete, color: "sector.III" },
  IV: { icon: MdOutlineFactory, color: "sector.IV" },
  V: { icon: MdOutlineForest, color: "sector.V" },
};
