import type { ConfidenceLevel, PoliticalWillSignal } from "@/types/political-will";

export function calculateActionScore(signals: PoliticalWillSignal[]): number {
  return Math.round(
    signals.reduce((total, signal) => total + signal.score * signal.weight, 0)
  );
}

export function getConfidenceLabel(
  verifiedCount: number,
  expectedCount: number
): ConfidenceLevel {
  if (expectedCount === 0) return "low";
  const ratio = verifiedCount / expectedCount;
  if (ratio >= 0.8) return "high";
  if (ratio >= 0.4) return "medium";
  return "low";
}

export function getConfidenceRange(level: ConfidenceLevel): string {
  switch (level) {
    case "high":
      return "80-100";
    case "medium":
      return "60-79";
    case "low":
      return "0-59";
  }
}

export function getSignalImpact(signal: PoliticalWillSignal): number {
  return Number((signal.score * signal.weight).toFixed(1));
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "var(--color-score-high)";
  if (score >= 55) return "var(--color-score-medium)";
  return "var(--color-score-low)";
}
