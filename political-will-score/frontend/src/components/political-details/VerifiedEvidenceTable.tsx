import type { PoliticalWillEvidence } from "@/types/political-will";

type VerifiedEvidenceTableProps = {
  evidence: PoliticalWillEvidence[];
  onReview?: (evidenceId: string, decision: "reject" | "needs-review") => void;
  busyEvidenceId?: string | null;
};

const typeLabels: Record<string, string> = {
  action_source: "Action source",
  started_contract: "Started contract",
  news_article: "News article",
  department_owner: "Department owner",
};

export function VerifiedEvidenceTable({
  evidence,
  onReview,
  busyEvidenceId,
}: VerifiedEvidenceTableProps) {
  const verified = evidence.filter((item) => item.status === "verified");

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Verified evidence</h2>
        <span className="badge badge-success">{verified.length} verified</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Source</th>
              <th>Date added</th>
              <th>Status</th>
              <th>Impact</th>
              <th>Added by</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {verified.map((item) => {
              const disabled = busyEvidenceId === item.id;

              return (
                <tr key={item.id} style={{ cursor: "default" }}>
                  <td>{typeLabels[item.type] ?? item.type.replace(/_/g, " ")}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 360 }}>
                      {item.sourceUrl ? (
                        <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                          {item.sourceName}
                        </a>
                      ) : (
                        <span>{item.sourceName}</span>
                      )}
                      {item.extractedClaim && (
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", lineHeight: 1.35 }}>
                          {item.extractedClaim}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{item.evidenceDate}</td>
                  <td>
                    <span className="badge badge-success">Verified</span>
                  </td>
                  <td
                    style={{
                      color:
                        (item.impactValue ?? 0) >= 0 ? "var(--color-success)" : "var(--color-danger)",
                      fontWeight: 600,
                    }}
                  >
                    {(item.impactValue ?? 0) >= 0 ? "+" : ""}
                    {item.impactValue}
                  </td>
                  <td>{item.addedBy}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-warning-outline btn-sm"
                        disabled={!onReview || disabled}
                        onClick={() => onReview?.(item.id, "needs-review")}
                      >
                        Pull back
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger-outline btn-sm"
                        disabled={!onReview || disabled}
                        onClick={() => onReview?.(item.id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {verified.length === 0 && (
              <tr style={{ cursor: "default" }}>
                <td colSpan={7} style={{ color: "var(--color-text-muted)" }}>
                  No verified evidence is currently attached to this action.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)" }}>
        <a href="#" className="link-muted">
          View all evidence history
        </a>
      </div>
    </div>
  );
}
