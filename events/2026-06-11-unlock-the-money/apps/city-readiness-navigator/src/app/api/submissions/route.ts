import { NextResponse } from "next/server";
import { submissions, type Submission } from "@/lib/store";

export async function GET() {
  return NextResponse.json(submissions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const rec: Submission = {
    ...body,
    id: `SUB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
  };
  submissions.unshift(rec);
  return NextResponse.json(rec);
}
