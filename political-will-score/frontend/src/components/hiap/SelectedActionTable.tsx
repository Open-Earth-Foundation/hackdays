"use client";

import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import type { PoliticalWillAction } from "@/types/political-will";

type SelectedActionTableProps = {
  actions: PoliticalWillAction[];
  selectedActionId: string | null;
  onSelectAction: (actionId: string) => void;
};

export function SelectedActionTable({
  actions,
  selectedActionId,
  onSelectAction,
}: SelectedActionTableProps) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Action</th>
            <th>Sector</th>
            <th>Source</th>
            <th>Political will</th>
            <th>Evidence</th>
            <th>Pending review</th>
            <th>Data gap</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <tr
              key={action.id}
              className={selectedActionId === action.id ? "selected" : undefined}
              onClick={() => onSelectAction(action.id)}
            >
              <td>{action.rank}</td>
              <td>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, maxWidth: 280 }}>
                  <input
                    type="checkbox"
                    checked={action.selected}
                    readOnly
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: 4 }}
                  />
                  <span style={{ fontWeight: 500, lineHeight: 1.4 }}>{action.title}</span>
                </div>
              </td>
              <td>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>{action.sectorIcon}</span>
                  {action.sector}
                </span>
              </td>
              <td>
                <a
                  href={action.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: "0.8125rem" }}
                >
                  {action.sourceName} ↗
                </a>
              </td>
              <td style={{ minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <strong>{action.score}/100</strong>
                  <ConfidenceBadge level={action.confidence} />
                </div>
                <ScoreBar score={action.score} height={6} />
              </td>
              <td>
                {action.evidenceComplete}/{action.evidenceExpected}
              </td>
              <td>{action.pendingReview > 0 ? action.pendingReview : "—"}</td>
              <td style={{ color: action.topDataGap ? "var(--color-danger)" : "var(--color-text-subtle)" }}>
                {action.topDataGap ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
