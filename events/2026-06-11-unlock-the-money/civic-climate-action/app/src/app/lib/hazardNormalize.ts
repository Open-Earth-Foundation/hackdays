// Map a city's hazard / sector strings onto CityCatalyst's canonical keys.
//
// Hazard names are bimodal: the 4 CityCatalyst (Brazilian) hero cities use
// canonical names ("Heatwaves", "Landslides", "Floods", "Diseases") that hit the
// keyword rules cleanly; the 11 external cities use prose ("Storm surge &
// sea-level rise", "Water shortage & drought") that may map to several keys.

import type { HazardKey, GhgSectorKey } from "../data/climateActions";

// Ordered keyword → hazard rules. A single input may match several.
const HAZARD_RULES: [RegExp, HazardKey][] = [
  [/drought|water shortage|water scarcity|water stress/, "droughts"],
  [/heat|overheat/, "heatwaves"],
  [/sea[-\s]?level|coastal|storm surge|tidal/, "sea-level-rise"],
  [/flood|cloudburst|rain|stormwater|deluge|inundation/, "floods"],
  [/landslide|mudslide|mudflow/, "landslides"],
  [/storm|cyclone|hurricane|wind/, "storms"],
  [/wildfire|forest fire|bushfire|dieback|fire/, "wildfires"],
  [/disease|vector|epidemic|dengue|malaria/, "diseases"],
];

export function normalizeHazard(input: string): HazardKey[] {
  const s = input.toLowerCase();
  const out = new Set<HazardKey>();
  for (const [re, key] of HAZARD_RULES) {
    if (re.test(s)) out.add(key);
  }
  return [...out];
}

const SECTOR_RULES: [RegExp, GhgSectorKey][] = [
  [/transport|mobility|road|vehicle/, "transportation"],
  [/stationary|energy|building|electric|power|heat\b/, "stationary_energy"],
  [/waste|landfill|wastewater|sanitation/, "waste"],
  [/ippu|industrial process|industry|cement|manufactur/, "ippu"],
  [/afolu|land use|land-use|forest|agricultur|livestock/, "afolu"],
];

export function normalizeSector(input: string): GhgSectorKey | null {
  const s = input.toLowerCase();
  for (const [re, key] of SECTOR_RULES) {
    if (re.test(s)) return key;
  }
  return null;
}
