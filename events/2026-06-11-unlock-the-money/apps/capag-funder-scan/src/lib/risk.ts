// Overall climate-risk band from a city's CCRA hazard scores (max across hazards).
export type RiskBand = "low" | "moderate" | "high";

export const RISK_BANDS: RiskBand[] = ["low", "moderate", "high"];

export function maxHazard(risks: Record<string, number> | null): number | null {
  if (!risks) return null;
  const v = Object.values(risks);
  return v.length ? Math.max(...v) : null;
}

export function riskBand(risks: Record<string, number> | null): RiskBand | null {
  const m = maxHazard(risks);
  if (m == null) return null;
  return m >= 0.5 ? "high" : m >= 0.25 ? "moderate" : "low";
}
