import type { AiSuggestion } from "@/types/political-will";

type AiReviewQueueProps = {
  suggestions: AiSuggestion[];
};

export function AiReviewQueue({ suggestions }: AiReviewQueueProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">AI review queue</h2>
        <span className="badge badge-warning">{suggestions.length} suggested</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Claim</th>
              <th>Suggested signal</th>
              <th>Contract status</th>
              <th>Impact</th>
              <th>Confidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((suggestion) => (
              <tr key={suggestion.id} style={{ cursor: "default" }}>
                <td style={{ maxWidth: 260, lineHeight: 1.4 }}>{suggestion.claim}</td>
                <td>{suggestion.signalLabel}</td>
                <td>{suggestion.contractStatus ?? "—"}</td>
                <td style={{ color: suggestion.impact >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                  {suggestion.impact >= 0 ? "+" : ""}
                  {suggestion.impact}
                </td>
                <td>
                  <span className={`badge badge-${suggestion.confidence === "high" ? "success" : suggestion.confidence === "medium" ? "warning" : "danger"}`}>
                    {suggestion.confidence}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-success-outline btn-sm">
                      Approve
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm">
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger-outline btn-sm">
                      Reject
                    </button>
                    <button type="button" className="btn btn-warning-outline btn-sm">
                      Needs review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
