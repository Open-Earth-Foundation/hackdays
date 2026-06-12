import type { ConfidenceLevel } from "@/types/political-will";

type ConfidenceBadgeProps = {
  level: ConfidenceLevel;
};

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const className =
    level === "high" ? "badge badge-success" : level === "medium" ? "badge badge-warning" : "badge badge-danger";
  return <span className={className}>{label}</span>;
}
