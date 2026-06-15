// Per-city pledge counts for the live engagement tally + readiness score.

import { NextResponse } from "next/server";
import { getCounts } from "../../lib/pledgeStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ counts: getCounts() });
}
