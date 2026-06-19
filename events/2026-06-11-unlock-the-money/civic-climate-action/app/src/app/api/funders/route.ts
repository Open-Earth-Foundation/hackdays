// Funder readout: engagement aggregated by theme + neighborhood for a city.
// No personal data (no emails, no names) — only counts.

import { NextResponse } from "next/server";
import { getFunderReadout } from "../../lib/pledgeStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get("city") || "porto-alegre").slice(0, 64);
  return NextResponse.json({ city, readout: getFunderReadout(city) });
}
