import type { CityRecord } from "./types";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { citiesRaw } from "./mock-cities.raw";

export const cities = citiesRaw as unknown as CityRecord[];

export function getCity(id: number): CityRecord | undefined {
  return cities.find((c) => c.id === id);
}
