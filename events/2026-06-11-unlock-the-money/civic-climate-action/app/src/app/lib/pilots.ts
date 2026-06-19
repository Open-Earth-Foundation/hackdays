// Pilot cities get the full per-city experience: prioritized HIAP actions + the
// AI "develop this action" panel. Other cities show only the profile + stories.
export const PILOT_CITY_IDS = new Set<string>(["sao-paulo", "porto-alegre"]);

export function isPilot(cityId: string): boolean {
  return PILOT_CITY_IDS.has(cityId);
}
