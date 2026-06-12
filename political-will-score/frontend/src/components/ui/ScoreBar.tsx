import { getScoreColor } from "@/lib/political-will/scoring";

type ScoreBarProps = {
  score: number;
  max?: number;
  height?: number;
};

export function ScoreBar({ score, max = 100, height = 8 }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  return (
    <div className="score-bar" style={{ height }}>
      <div
        className="score-bar-fill"
        style={{ width: `${pct}%`, background: getScoreColor(score) }}
      />
    </div>
  );
}
