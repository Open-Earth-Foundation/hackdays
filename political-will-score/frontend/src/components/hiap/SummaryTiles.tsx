import { ScoreBar } from "@/components/ui/ScoreBar";
import type { CityHiapData } from "@/types/political-will";

type SummaryTilesProps = {
  data: CityHiapData;
};

export function SummaryTiles({ data }: SummaryTilesProps) {
  return (
    <div className="summary-grid">
      <div className="card summary-card">
        <p className="summary-label">Action confidence</p>
        <p className="summary-value">{data.actionConfidence}/100</p>
        <ScoreBar score={data.actionConfidence} />
      </div>
      <div className="card summary-card">
        <p className="summary-label">Source-backed actions</p>
        <p className="summary-value">{data.sourceBackedActions}</p>
        <span className="badge badge-success">✓ Verified sources</span>
      </div>
      <div className="card summary-card">
        <p className="summary-label">Evidence gaps</p>
        <p className="summary-value danger">{data.evidenceGaps}</p>
        <span className="badge badge-danger">⚠ Needs attention</span>
      </div>
      <div className="card summary-card">
        <p className="summary-label">Pending review</p>
        <p className="summary-value primary">{data.pendingReview} pending</p>
        <span className="badge badge-neutral">ℹ In review queue</span>
      </div>
    </div>
  );
}
