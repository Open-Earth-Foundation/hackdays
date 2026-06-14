import { ScoreBar } from "@/components/ui/ScoreBar";
import { getSignalImpact } from "@/lib/political-will/scoring";
import type { PoliticalWillSignal } from "@/types/political-will";

type ScoreBreakdownProps = {
  signals: PoliticalWillSignal[];
};

export function ScoreBreakdown({ signals }: ScoreBreakdownProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Score breakdown</h2>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table compact-table">
          <thead>
            <tr>
              <th>Signal</th>
              <th>Weight</th>
              <th>Score</th>
              <th>Impact</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal) => {
              const impact = getSignalImpact(signal);
              return (
                <tr key={signal.key} style={{ cursor: "default" }}>
                  <td>{signal.label}</td>
                  <td>{Math.round(signal.weight * 100)}%</td>
                  <td>
                    <div style={{ marginBottom: 6 }}>{signal.score}/100</div>
                    <ScoreBar score={signal.score} height={6} />
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      color: impact >= 0 ? "var(--color-success)" : "var(--color-danger)",
                    }}
                  >
                    {impact >= 0 ? "+" : ""}
                    {impact}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
