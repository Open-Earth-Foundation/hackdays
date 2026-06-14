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
      <div style={{ display: "flex", flexDirection: "column" }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--color-border)",
              display: "grid",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              <span>{formatTime(event.createdAt)}</span>
              <span>{event.actorName}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
              {event.eventType.replace(/_/g, " ")}
            </div>
            <div style={{ fontSize: "0.8125rem", lineHeight: 1.4 }}>{event.message}</div>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ padding: 20, color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No audit events yet.
          </div>
        )}
      </div>
      <div
        style={{
          padding: "12px 20px",
          display: "grid",
          gap: 8,
        }}
      >
        <a href="#" className="link-muted">
          View full log
        </a>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          Score updates only after evidence is approved
        </span>
      </div>
    </div>
  );
}
