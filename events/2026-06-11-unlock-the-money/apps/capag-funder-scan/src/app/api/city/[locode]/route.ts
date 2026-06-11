import { NextResponse } from "next/server";

const API = "https://api.citycatalyst.io";

// SEEG sub-sector coverage (from /api/v0/catalogue). GPC sector III (waste) is not in SEEG.
const REFS = [
  "I.1.1", "I.2.1", "I.3.1", "I.4.1", "I.5.1", "I.8.1",
  "II.1.1", "II.2.1", "II.3.3", "II.4.3",
  "IV.1",
  "V.1", "V.2", "V.3",
];

const SECTOR_NAMES: Record<string, string> = {
  I: "Stationary Energy",
  II: "Transportation",
  IV: "IPPU",
  V: "AFOLU",
};

async function fetchRef(locode: string, year: number, ref: string) {
  const url = `${API}/api/v1/source/SEEGv2023/city/${encodeURIComponent(locode)}/${year}/${ref}`;
  try {
    const r = await fetch(url, { next: { revalidate: 86400 } });
    if (!r.ok) return null;
    const j = await r.json();
    const v = j?.totals?.emissions?.co2eq_100yr;
    return v != null ? Number(v) : null;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locode: string }> }
) {
  const { locode } = await params;
  const decoded = decodeURIComponent(locode);

  let year = 2023;
  let values = await Promise.all(REFS.map((ref) => fetchRef(decoded, year, ref)));
  if (values.every((v) => v == null)) {
    year = 2022;
    values = await Promise.all(REFS.map((ref) => fetchRef(decoded, year, ref)));
  }

  const bySector: Record<string, number> = {};
  REFS.forEach((ref, i) => {
    const v = values[i];
    if (v == null) return;
    const sector = ref.split(".")[0];
    bySector[sector] = (bySector[sector] ?? 0) + v;
  });
  const total = Object.values(bySector).reduce((a, b) => a + b, 0);
  const sectors = Object.entries(bySector)
    .map(([code, co2eq]) => ({
      code,
      name: SECTOR_NAMES[code] ?? code,
      co2eq,
      share: total > 0 ? co2eq / total : 0,
    }))
    .sort((a, b) => b.co2eq - a.co2eq);

  let hazards: { hazard: string; score: number }[] = [];
  try {
    const r = await fetch(
      `${API}/api/v0/ccra/risk_assessment/city/${encodeURIComponent(decoded)}/current`,
      { next: { revalidate: 86400 } }
    );
    if (r.ok) {
      const rows: { hazard?: string; normalised_risk_score?: number }[] = await r.json();
      const max: Record<string, number> = {};
      for (const row of rows) {
        if (row.hazard && row.normalised_risk_score != null) {
          max[row.hazard] = Math.max(max[row.hazard] ?? 0, row.normalised_risk_score);
        }
      }
      hazards = Object.entries(max)
        .map(([hazard, score]) => ({ hazard, score }))
        .sort((a, b) => b.score - a.score);
    }
  } catch {
    // panel renders without risks
  }

  return NextResponse.json({ locode: decoded, year, total, sectors, hazards });
}
