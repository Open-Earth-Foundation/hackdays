"use client";

import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import type { PoliticalWillAction } from "@/types/political-will";

type PoliticalActionInspectorProps = {
  cityId: string;
  action: PoliticalWillAction | null;
  onClose: () => void;
};

function SignalStatusIcon({ status }: { status: string }) {
  if (status === "verified") return <span style={{ color: "var(--color-success)" }}>✓</span>;
  if (status === "needs_review") return <span style={{ color: "var(--color-warning)" }}>!</span>;
  return <span style={{ color: "var(--color-danger)" }}>✕</span>;
}

export function PoliticalActionInspector({
  cityId,
  action,
  onClose,
}: PoliticalActionInspectorProps) {
  if (!action) {
    return (
      <aside
        className="card"
        style={{
          width: 360,
          flexShrink: 0,
          padding: 24,
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        Select an action to view political details.
      </aside>
    );
  }

  return (
    <aside
      className="card"
      style={{
        width: 360,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 120px)",
        position: "sticky",
        top: 80,
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: "1.25rem" }}>{action.sectorIcon}</span>
            <div>
              <p style={{ margin: "0 0 8px", fontWeight: 600, lineHeight: 1.4, fontSize: "0.9rem" }}>
                {action.title}
              </p>
              <button type="button" className="btn btn-secondary btn-sm">
                + Add evidence
              </button>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
          <button type="button" className="tab" style={{ flex: "none", padding: "8px 12px" }}>
            Action details
          </button>
          <button type="button" className="tab active" style={{ flex: "none", padding: "8px 12px" }}>
            Political details
          </button>
        </div>
      </div>

      <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
        <p style={{ margin: "0 0 6px", color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
          Political Will Score
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {action.score}/100
          </span>
          <ConfidenceBadge level={action.confidence} />
        </div>
        <ScoreBar score={action.score} />

        <div style={{ marginTop: 24 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: "0.875rem" }}>Evidence checklist</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {action.signals.map((signal) => (
              <li
                key={signal.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <SignalStatusIcon status={signal.status} />
                  {signal.label}
                </span>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                  {signal.status === "verified"
                    ? "Verified"
                    : signal.status === "needs_review"
                      ? "Needs review"
                      : "Missing"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 8,
            background: "var(--color-success-bg)",
            border: "1px solid #bbf7d0",
            fontSize: "0.8125rem",
            color: "#166534",
            display: "flex",
            gap: 10,
          }}
        >
          <span>🛡️</span>
          <div>
            <strong>Source-backed action.</strong> Official source required before scoring.
          </div>
        </div>
      </div>

      <div style={{ padding: 16, borderTop: "1px solid var(--color-border)" }}>
        <Link
          href={`/cities/${cityId}/hiap/actions/${action.id}/political-details`}
          className="btn btn-secondary"
          style={{ width: "100%", textDecoration: "none" }}
        >
          Open full political details ↗
        </Link>
      </div>
    </aside>
  );
}
