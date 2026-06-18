import { NextResponse } from "next/server";
import { parse as wktParse } from "wellknown";

const API = "https://api.citycatalyst.io";

// Merged best-available Brazilian inventory (sources verified against /api/v0/catalogue):
// - SEEG: energy, transport, IPPU, AFOLU backbone (scope 1), latest 2023
// - SINIR: solid waste III.1-III.3, 2022 only, coverage varies by city
// - SNIS: wastewater III.4, 2022 only, coverage varies by city
// - EPE: scope-2/3 energy sub-refs SEEG lacks (I.x.2 / I.x.3), additive under GPC BASIC
type SourceSpec = { source: string; years: number[]; refs: string[] };

const SOURCES: SourceSpec[] = [
  {
    source: "SEEGv2023",
    years: [2023, 2022],
    refs: [
      "I.1.1", "I.2.1", "I.3.1", "I.4.1", "I.5.1", "I.8.1",
      "II.1.1", "II.2.1", "II.3.3", "II.4.3",
      "IV.1",
      "V.1", "V.2", "V.3",
    ],
  },
  {
    source: "SINIR",
    years: [2022],
    refs: ["III.1.1", "III.1.2", "III.2.1", "III.2.2", "III.3.1", "III.3.2"],
  },
  { source: "SNIS", years: [2022], refs: ["III.4.1", "III.4.2"] },
  {
    source: "EPE",
    years: [2023],
    refs: ["I.1.2", "I.1.3", "I.2.2", "I.2.3", "I.3.2", "I.3.3", "I.5.2", "I.5.3"],
  },
];

const SECTOR_NAMES: Record<string, string> = {
  I: "Stationary Energy",
  II: "Transportation",
  III: "Waste",
  IV: "IPPU",
  V: "AFOLU",
};

const SOURCE_LABEL: Record<string, string> = {
  SEEGv2023: "SEEG",
  SINIR: "SINIR",
  SNIS: "SNIS",
  EPE: "EPE",
};

async function fetchRef(source: string, locode: string, year: number, ref: string) {
  const url = `${API}/api/v1/source/${encodeURIComponent(source)}/city/${encodeURIComponent(locode)}/${year}/${ref}`;
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

  const bySector: Record<string, { co2eq: number; sources: Set<string> }> = {};

  await Promise.all(
    SOURCES.map(async (spec) => {
      for (const year of spec.years) {
        const values = await Promise.all(
          spec.refs.map((ref) => fetchRef(spec.source, decoded, year, ref))
        );
        if (values.every((v) => v == null)) continue; // try fallback year
        values.forEach((v, i) => {
          if (v == null) return;
          const sectorCode = spec.refs[i].split(".")[0];
          bySector[sectorCode] ??= { co2eq: 0, sources: new Set() };
          bySector[sectorCode].co2eq += v;
          bySector[sectorCode].sources.add(`${SOURCE_LABEL[spec.source]} ${year}`);
        });
        break;
      }
    })
  );

  const total = Object.values(bySector).reduce((a, b) => a + b.co2eq, 0);
  const sectors = Object.entries(bySector)
    .map(([code, { co2eq, sources }]) => ({
      code,
      name: SECTOR_NAMES[code] ?? code,
      co2eq,
      share: total > 0 ? co2eq / total : 0,
      sources: Array.from(sources).sort(),
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

  // city boundary polygon (WKT MULTIPOLYGON -> GeoJSON) + contextual stats
  let boundary: unknown = null;
  let context: Record<string, unknown> | null = null;
  await Promise.all([
    (async () => {
      try {
        const r = await fetch(`${API}/api/v0/cityboundary/city/${encodeURIComponent(decoded)}`, {
          next: { revalidate: 86400 },
        });
        if (r.ok) {
          const j = await r.json();
          if (j?.city_geometry) boundary = wktParse(j.city_geometry);
        }
      } catch {
        // map renders without polygon
      }
    })(),
    (async () => {
      try {
        const r = await fetch(`${API}/api/v0/city_context/city/${encodeURIComponent(decoded)}`, {
          next: { revalidate: 86400 },
        });
        if (r.ok) context = await r.json();
      } catch {
        // panel renders without context
      }
    })(),
  ]);

  return NextResponse.json({ locode: decoded, total, sectors, hazards, boundary, context });
}
