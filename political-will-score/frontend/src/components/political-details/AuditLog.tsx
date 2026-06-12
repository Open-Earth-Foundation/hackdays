import type { PoliticalWillAuditEvent } from "@/types/political-will";

type AuditLogProps = {
  events: PoliticalWillAuditEvent[];
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditLog({ events }: AuditLogProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Audit log</h2>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Event</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} style={{ cursor: "default" }}>
                <td style={{ whiteSpace: "nowrap" }}>{formatTime(event.createdAt)}</td>
                <td>{event.actorName}</td>
                <td>{event.eventType.replace(/_/g, " ")}</td>
                <td>{event.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <a href="#" className="link-muted">
          View full log
        </a>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          🔒 Score updates only after evidence is approved
        </span>
      </div>
    </div>
  );
}
