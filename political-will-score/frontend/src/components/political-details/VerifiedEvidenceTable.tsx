import type { PoliticalWillEvidence } from "@/types/political-will";

type VerifiedEvidenceTableProps = {
  evidence: PoliticalWillEvidence[];
};

const typeIcons: Record<string, string> = {
  started_contract: "📄",
  news_article: "📰",
  department_owner: "🏛️",
};

export function VerifiedEvidenceTable({ evidence }: VerifiedEvidenceTableProps) {
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
            </tr>
          </thead>
          <tbody>
            {verified.map((item) => (
              <tr key={item.id} style={{ cursor: "default" }}>
                <td>
                  <span style={{ marginRight: 6 }}>{typeIcons[item.type] ?? "📎"}</span>
                  {item.type.replace(/_/g, " ")}
                </td>
                <td>
                  {item.sourceUrl ? (
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                      {item.sourceName}
                    </a>
                  ) : (
                    item.sourceName
                  )}
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
              </tr>
            ))}
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
