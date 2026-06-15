// Capture a resident's "I'll act on this" pledge. Aggregated server-side so the
// engagement metric reflects real commitment across visitors.

import { NextResponse } from "next/server";
import { increment, getCount } from "../../lib/pledgeStore";

export const runtime = "nodejs";

// Light per-process rate guard so the live tally can't be trivially inflated on
// stage (a real deployment would rate-limit per IP / require a token).
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

export async function POST(req: Request) {
  let body: { cityId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const cityId = typeof body.cityId === "string" ? body.cityId.slice(0, 64) : "";
  if (!cityId) return NextResponse.json({ error: "cityId required" }, { status: 400 });

  if (rateLimited()) {
    return NextResponse.json({ cityId, count: getCount(cityId), throttled: true });
  }
  return NextResponse.json({ cityId, count: increment(cityId) });
}
