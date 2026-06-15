import { NextResponse } from "next/server";
import { dossiers, type Dossier } from "@/lib/store";

export async function GET() {
  return NextResponse.json(dossiers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const rec: Dossier = {
    ...body,
    id: `DOS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
  };
  dossiers.unshift(rec);
  return NextResponse.json(rec);
}
