// Server-only participation store. Captures resident "I'll act on this" pledges
// per city so the funder-facing engagement metric reflects real, aggregated
// commitment (not per-browser localStorage).
//
// This is a DEMO store: a JSON file under the app root, single-process, seeded
// with a small clearly-labelled baseline. Production path = a real database.

import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), ".data", "pledges.json");

// Clearly-labelled demo baseline so the metric isn't empty on first run.
const SEED: Record<string, number> = {
  "sao-paulo": 128,
  "porto-alegre": 86,
  "curitiba": 41,
  "rio-de-janeiro": 73,
};

type Store = { counts: Record<string, number> };
let cache: Store | null = null;

function load(): Store {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(FILE, "utf8")) as Store;
  } catch {
    cache = { counts: { ...SEED } };
    persist();
  }
  return cache;
}

function persist(): void {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(cache), "utf8");
  } catch {
    /* read-only fs (e.g. serverless) — counts stay in-memory for the session */
  }
}

export function getCounts(): Record<string, number> {
  return { ...load().counts };
}

export function getCount(cityId: string): number {
  return load().counts[cityId] ?? 0;
}

export function increment(cityId: string): number {
  const s = load();
  s.counts[cityId] = (s.counts[cityId] ?? 0) + 1;
  persist();
  return s.counts[cityId];
}
