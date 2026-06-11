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

export const SECTORS: Record<string, { name: string; icon: IconType; color: string }> = {
  I: { name: "Stationary Energy", icon: MdOutlineApartment, color: "sector.I" },
  II: { name: "Transportation", icon: MdOutlineDirectionsBus, color: "sector.II" },
  III: { name: "Waste", icon: MdOutlineDelete, color: "sector.III" },
  IV: { name: "IPPU", icon: MdOutlineFactory, color: "sector.IV" },
  V: { name: "AFOLU", icon: MdOutlineForest, color: "sector.V" },
};
