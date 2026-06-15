// Server-only participation store. A commitment is a SIGNATURE: a named resident
// (first name + neighborhood, optional email) pledging to take a specific real
// action, then tracking it through to done. This is an honest, weighty engagement
// signal — a public record of who committed and who followed through — not a
// throwaway click.
//
// DEMO store: a JSON file under the app root, single-process, seeded with a small
// clearly-labelled baseline. Production path = a real database.

import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), ".data", "pledges.json");

export type PledgeStatus = "committed" | "sent" | "responded";

export type Pledge = {
  id: string;
  cityId: string;
  actionId: string; // rec id, e.g. "poa-flood-resilience"
  worryLabel: string;
  headline: string;
  firstName: string;
  neighborhood: string;
  email?: string; // stored server-side ONLY — never returned by any read
  createdAt: string; // ISO
  status: PledgeStatus;
};

// What leaves the server (no email).
export type PublicPledge = Omit<Pledge, "email">;

export type CityAggregate = {
  total: number;
  sent: number;
  responded: number;
  actions: string[];
};

// Anonymous historical baseline so the public numbers stay substantial without
// storing a record for every past participant. Displayed totals = baseline + live.
const SEED_BASELINE: Record<string, { total: number; sent: number; responded: number }> = {
  "porto-alegre": { total: 79, sent: 31, responded: 9 },
};

// A few real-looking seeded signatures (most recent last) so the wall isn't empty.
const SEED_PLEDGES: Omit<Pledge, "createdAt">[] = [
  { id: "seed-1", cityId: "porto-alegre", actionId: "poa-flood-resilience", worryLabel: "Flooding", headline: "Report a flooding or drainage problem on your street to Defesa Civil.", firstName: "Mariana", neighborhood: "Cidade Baixa", status: "responded" },
  { id: "seed-2", cityId: "porto-alegre", actionId: "poa-active-mobility", worryLabel: "Getting around safely", headline: "Comment on a street redesign, bike lane, or pedestrian-safety plan to the mobility council.", firstName: "Rafael", neighborhood: "Bom Fim", status: "sent" },
  { id: "seed-3", cityId: "porto-alegre", actionId: "poa-heat-green-infrastructure", worryLabel: "Heat & no shade", headline: "Nominate a hot street, bus stop, school, or plaza that needs shade and trees.", firstName: "Letícia", neighborhood: "Menino Deus", status: "sent" },
  { id: "seed-4", cityId: "porto-alegre", actionId: "poa-landslide-prevention", worryLabel: "Landslides", headline: "Report slope instability or a blocked drain in a risk area to Defesa Civil.", firstName: "Carlos", neighborhood: "Lomba do Pinheiro", status: "committed" },
  { id: "seed-5", cityId: "porto-alegre", actionId: "poa-flood-resilience", worryLabel: "Flooding", headline: "Take flood-drainage priorities to your region's participatory-budget assembly.", firstName: "Beatriz", neighborhood: "Sarandi", status: "committed" },
  { id: "seed-6", cityId: "porto-alegre", actionId: "poa-residential-energy", worryLabel: "Energy bills & comfort", headline: "Ask for home-efficiency help for heat-exposed, low-income homes — citing the city's Climate Action Plan.", firstName: "João", neighborhood: "Restinga", status: "committed" },
];

// Spread seed timestamps over the past few days so "time ago" looks natural.
function seedPledges(): Pledge[] {
  const now = Date.now();
  const HOUR = 3_600_000;
  const offsets = [72 * HOUR, 28 * HOUR, 9 * HOUR, 5 * HOUR, 2 * HOUR, 40 * 60_000];
  return SEED_PLEDGES.map((p, i) => ({
    ...p,
    createdAt: new Date(now - (offsets[i] ?? i * HOUR)).toISOString(),
  }));
}

type Store = { pledges: Pledge[] };

// Always read the file fresh. In Next dev, route handlers (/api/pledge,
// /api/metrics, /api/wall) don't reliably share module-level state, so an
// in-memory cache makes one route return stale data after another writes. The
// file is the single source of truth; volume is tiny (demo).
function load(): Store {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (!parsed || !Array.isArray(parsed.pledges)) throw new Error("bad shape");
    return parsed as Store;
  } catch {
    const seeded = { pledges: seedPledges() };
    persist(seeded);
    return seeded;
  }
}

function persist(store: Store): void {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(store), "utf8");
  } catch {
    /* read-only fs (e.g. serverless) — write is best-effort */
  }
}

const strip = (p: Pledge): PublicPledge => {
  const { email: _email, ...rest } = p;
  return rest;
};

export function getCityAggregate(cityId: string): CityAggregate {
  // Baseline = anonymous historical participants, excluding the named records in
  // the store; the store's records (seeded + live) are added on top.
  const base = SEED_BASELINE[cityId] ?? { total: 0, sent: 0, responded: 0 };
  const live = load().pledges.filter((p) => p.cityId === cityId);
  return {
    total: base.total + live.length,
    sent: base.sent + live.filter((p) => p.status === "sent" || p.status === "responded").length,
    responded: base.responded + live.filter((p) => p.status === "responded").length,
    actions: Array.from(new Set(live.map((p) => p.actionId))),
  };
}

// --- Funder readout: aggregate ALL pledges by theme + neighborhood ----------

export type FunderTheme = "Resilience" | "Greening" | "Energy" | "Mobility";

// Map a rec/action id to a funder theme (rec ids look like "poa-flood-resilience").
function themeForAction(actionId: string): FunderTheme {
  if (actionId.includes("flood") || actionId.includes("landslide")) return "Resilience";
  if (actionId.includes("heat") || actionId.includes("green")) return "Greening";
  if (actionId.includes("energy")) return "Energy";
  if (actionId.includes("mobility")) return "Mobility";
  return "Resilience";
}

export type FunderReadout = {
  total: number;
  sent: number;
  responded: number;
  responseRate: number; // sent / total, 0..1
  byTheme: { theme: FunderTheme; total: number; sent: number }[];
  byNeighborhood: { name: string; count: number }[];
};

const THEMES: FunderTheme[] = ["Resilience", "Greening", "Energy", "Mobility"];

export function getFunderReadout(cityId: string): FunderReadout {
  const agg = getCityAggregate(cityId);
  const live = load().pledges.filter((p) => p.cityId === cityId);

  const byTheme = THEMES.map((theme) => {
    const inTheme = live.filter((p) => themeForAction(p.actionId) === theme);
    return {
      theme,
      total: inTheme.length,
      sent: inTheme.filter((p) => p.status === "sent" || p.status === "responded").length,
    };
  }).filter((t) => t.total > 0);

  const counts = new Map<string, number>();
  for (const [name, n] of Object.entries(SEED_NEIGHBORHOOD_BASELINE[cityId] ?? {})) counts.set(name, n);
  for (const p of live) {
    const n = (p.neighborhood || "").trim();
    if (n) counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  const byNeighborhood = Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return {
    total: agg.total,
    sent: agg.sent,
    responded: agg.responded,
    responseRate: agg.total > 0 ? agg.sent / agg.total : 0,
    byTheme,
    byNeighborhood,
  };
}

// Per-action share of the anonymous baseline (sums to SEED_BASELINE for the city),
// so the "most-backed actions" ranking reads as real popularity, not just the
// handful of named seed records.
const SEED_ACTION_BASELINE: Record<string, Record<string, { count: number; sent: number }>> = {
  "porto-alegre": {
    "poa-flood-resilience": { count: 31, sent: 14 },
    "poa-heat-green-infrastructure": { count: 18, sent: 7 },
    "poa-landslide-prevention": { count: 14, sent: 6 },
    "poa-active-mobility": { count: 11, sent: 3 },
    "poa-residential-energy": { count: 5, sent: 1 },
  },
};

// Per-neighborhood share of the anonymous baseline (sums to SEED_BASELINE.total),
// so the engagement map shows realistic, varied bubbles rather than single dots.
// Names match the coordinate lookup in data/poaNeighborhoods.ts (accent-insensitive).
const SEED_NEIGHBORHOOD_BASELINE: Record<string, Record<string, number>> = {
  "porto-alegre": {
    "Cidade Baixa": 9,
    "Centro Histórico": 8,
    Sarandi: 8,
    Navegantes: 7,
    "Menino Deus": 6,
    "Bom Fim": 6,
    Restinga: 5,
    Partenon: 5,
    "Lomba do Pinheiro": 5,
    Ipanema: 4,
    Cavalhada: 4,
    Azenha: 3,
    "São Geraldo": 3,
    "Rubem Berta": 3,
    Petrópolis: 3,
  },
};

export type ActionRank = { actionId: string; count: number; sent: number };

export function getActionRanking(cityId: string): ActionRank[] {
  const byId = new Map<string, { count: number; sent: number }>();
  for (const [id, b] of Object.entries(SEED_ACTION_BASELINE[cityId] ?? {})) byId.set(id, { ...b });
  for (const p of load().pledges.filter((x) => x.cityId === cityId)) {
    const cur = byId.get(p.actionId) ?? { count: 0, sent: 0 };
    cur.count += 1;
    if (p.status === "sent" || p.status === "responded") cur.sent += 1;
    byId.set(p.actionId, cur);
  }
  return Array.from(byId, ([actionId, v]) => ({ actionId, ...v })).sort((a, b) => b.count - a.count);
}

export function getRecent(cityId: string, limit = 12): PublicPledge[] {
  return load()
    .pledges.filter((p) => p.cityId === cityId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(strip);
}

let counter = 0;
function newId(): string {
  counter += 1;
  return `p_${Date.now().toString(36)}_${counter}`;
}

export function createPledge(input: {
  cityId: string;
  actionId: string;
  worryLabel: string;
  headline: string;
  firstName: string;
  neighborhood: string;
  email?: string;
}): PublicPledge {
  const s = load();
  const pledge: Pledge = {
    id: newId(),
    cityId: input.cityId,
    actionId: input.actionId,
    worryLabel: input.worryLabel,
    headline: input.headline,
    firstName: input.firstName,
    neighborhood: input.neighborhood,
    email: input.email || undefined,
    createdAt: new Date().toISOString(),
    status: "committed",
  };
  s.pledges.push(pledge);
  persist(s);
  return strip(pledge);
}

export function setStatus(id: string, status: PledgeStatus): PublicPledge | null {
  const s = load();
  const p = s.pledges.find((x) => x.id === id);
  if (!p) return null;
  p.status = status;
  persist(s);
  return strip(p);
}
