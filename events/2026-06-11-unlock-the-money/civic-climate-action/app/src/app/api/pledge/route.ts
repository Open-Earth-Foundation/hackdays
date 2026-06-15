// Capture a resident's signed commitment to act (POST) and track it through to
// done (PATCH). Aggregated server-side so the live "N residents committed · M
// reported sent" signal reflects real, named, followed-through participation.

import { NextResponse } from "next/server";
import { createPledge, setStatus, getCityAggregate, type PledgeStatus } from "../../lib/pledgeStore";

export const runtime = "nodejs";

// Light per-process rate guard so the tally can't be trivially inflated on stage
// (a real deployment would rate-limit per IP / require a token).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
let hits: number[] = [];

function rateLimited(): boolean {
  const now = Date.now();
  hits = hits.filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return true;
  hits.push(now);
  return false;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max).trim() : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const cityId = str(body.cityId, 64);
  const actionId = str(body.actionId, 64);
  const firstName = str(body.firstName, 60);
  const neighborhood = str(body.neighborhood, 80);
  if (!cityId || !actionId || !firstName) {
    return NextResponse.json({ error: "cityId, actionId, firstName required" }, { status: 400 });
  }
  if (rateLimited()) {
    return NextResponse.json({ aggregate: getCityAggregate(cityId), throttled: true }, { status: 429 });
  }

  const pledge = createPledge({
    cityId,
    actionId,
    worryLabel: str(body.worryLabel, 80),
    headline: str(body.headline, 240),
    firstName,
    neighborhood,
    email: str(body.email, 160) || undefined,
  });
  return NextResponse.json({ pledge, aggregate: getCityAggregate(cityId) });
}

const VALID: PledgeStatus[] = ["committed", "sent", "responded"];

export async function PATCH(req: Request) {
  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const id = str(body.id, 64);
  const status = body.status as PledgeStatus;
  if (!id || !VALID.includes(status)) {
    return NextResponse.json({ error: "id and valid status required" }, { status: 400 });
  }
  const pledge = setStatus(id, status);
  if (!pledge) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ pledge, aggregate: getCityAggregate(pledge.cityId) });
}
