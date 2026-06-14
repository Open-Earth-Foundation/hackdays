import type { AiSuggestion } from "@/types/political-will";

type AiReviewQueueProps = {
  suggestions: AiSuggestion[];
  onReview: (evidenceId: string, decision: "approve" | "reject" | "needs-review") => void;
  busyEvidenceId?: string | null;
};

export function AiReviewQueue({
  suggestions,
  onReview,
  busyEvidenceId,
}: AiReviewQueueProps) {
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
            {suggestions.map((suggestion) => {
              const disabled = busyEvidenceId === suggestion.evidenceId;
              return (
                <tr key={suggestion.id} style={{ cursor: "default" }}>
                  <td style={{ maxWidth: 260, lineHeight: 1.4 }}>
                    <div>{suggestion.claim}</div>
                    {suggestion.sourceName && (
                      <div
                        style={{
                          color: "var(--color-text-muted)",
                          fontSize: "0.75rem",
                          marginTop: 4,
                        }}
                      >
                        {suggestion.sourceUrl ? (
                          <a href={suggestion.sourceUrl} target="_blank" rel="noreferrer">
                            {suggestion.sourceName}
                          </a>
                        ) : (
                          suggestion.sourceName
                        )}
                      </div>
                    )}
                  </td>
                  <td>{suggestion.signalLabel}</td>
                  <td>{suggestion.contractStatus ?? "-"}</td>
                  <td
                    style={{
                      color:
                        suggestion.impact >= 0
                          ? "var(--color-success)"
                          : "var(--color-danger)",
                    }}
                  >
                    {suggestion.impact >= 0 ? "+" : ""}
                    {suggestion.impact}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${
                        suggestion.confidence === "high"
                          ? "success"
                          : suggestion.confidence === "medium"
                            ? "warning"
                            : "danger"
                      }`}
                    >
                      {suggestion.confidence}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-success-outline btn-sm"
                        disabled={disabled}
                        onClick={() => onReview(suggestion.evidenceId, "approve")}
                      >
                        Approve
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" disabled>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger-outline btn-sm"
                        disabled={disabled}
                        onClick={() => onReview(suggestion.evidenceId, "reject")}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-warning-outline btn-sm"
                        disabled={disabled}
                        onClick={() => onReview(suggestion.evidenceId, "needs-review")}
                      >
                        Needs review
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {suggestions.length === 0 && (
              <tr style={{ cursor: "default" }}>
                <td colSpan={6} style={{ color: "var(--color-text-muted)" }}>
                  No suggested evidence is waiting for review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
