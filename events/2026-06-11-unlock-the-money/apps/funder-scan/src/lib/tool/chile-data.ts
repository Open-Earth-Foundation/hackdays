import type { ChileComuna, ChileFund, ValdiviaInstrument } from "./types";

let comunasCache: ChileComuna[] | null = null;
let fundsCache: ChileFund[] | null = null;
let valdiviaCache: ValdiviaInstrument[] | null = null;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json() as Promise<T>;
}

export async function loadChileComunas(): Promise<ChileComuna[]> {
  if (!comunasCache) comunasCache = await fetchJson<ChileComuna[]>("/data/chile-comunas.json");
  return comunasCache;
}

export async function loadChileFunds(): Promise<ChileFund[]> {
  if (!fundsCache) fundsCache = await fetchJson<ChileFund[]>("/data/chile-funds.json");
  return fundsCache;
}

export async function loadValdiviaInstruments(): Promise<ValdiviaInstrument[]> {
  if (!valdiviaCache) valdiviaCache = await fetchJson<ValdiviaInstrument[]>("/data/valdivia-instruments.json");
  return valdiviaCache;
}

export async function loadMatcherData() {
  const [comunas, funds, valdivia] = await Promise.all([
    loadChileComunas(),
    loadChileFunds(),
    loadValdiviaInstruments(),
  ]);
  return { comunas, funds, valdivia };
}

export function findComuna(comunas: ChileComuna[], locode: string): ChileComuna | undefined {
  return comunas.find((c) => c.locode === locode);
}
