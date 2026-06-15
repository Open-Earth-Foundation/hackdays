// Per-city commitment aggregates (total signed · reported sent · responded) for
// the live engagement signal.

import { NextResponse } from "next/server";
import { getCityAggregate } from "../../lib/pledgeStore";

export const runtime = "nodejs";

const CITIES = ["porto-alegre"];

export async function GET() {
  const cities = Object.fromEntries(CITIES.map((id) => [id, getCityAggregate(id)]));
  return NextResponse.json({ cities });
}
