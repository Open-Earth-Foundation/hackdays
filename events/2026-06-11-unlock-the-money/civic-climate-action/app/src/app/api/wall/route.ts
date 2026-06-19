// Public commitment wall: recent signed commitments for a city. Returns
// first-name + neighborhood + worry + status only — never emails.

import { NextResponse } from "next/server";
import { getRecent, getCityAggregate, getActionRanking } from "../../lib/pledgeStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get("city") || "porto-alegre").slice(0, 64);
  return NextResponse.json({
    recent: getRecent(city, 12),
    aggregate: getCityAggregate(city),
    ranking: getActionRanking(city),
  });
}
