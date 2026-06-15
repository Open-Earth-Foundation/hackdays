"use client";

import { Fragment, useState } from "react";
import type { AiSuggestion, ConfidenceLevel, SignalKey } from "@/types/political-will";
import type { EvidenceUpdatePayload } from "@/lib/political-will/api";

type AiReviewQueueProps = {
  suggestions: AiSuggestion[];
  onReview: (evidenceId: string, decision: "approve" | "reject" | "needs-review") => void;
  onEdit: (evidenceId: string, payload: EvidenceUpdatePayload) => Promise<void>;
  busyEvidenceId?: string | null;
};

type EditValues = {
  claim: string;
  signalKey: SignalKey;
  impact: string;
  confidence: ConfidenceLevel;
  contractStatus: string;
  sourceExcerpt: string;
};

const signalLabels: Record<SignalKey, string> = {
  budgetFollowThrough: "Budget follow-through",
  electionExposure: "Election exposure",
  institutionalContinuity: "Institutional continuity",
  publicCommitment: "Public commitment",
};

const signalOptions = Object.entries(signalLabels) as Array<[SignalKey, string]>;
const confidenceOptions: ConfidenceLevel[] = ["low", "medium", "high"];

function confidenceBadgeClass(confidence: ConfidenceLevel) {
  if (confidence === "high") return "badge-success";
  if (confidence === "medium") return "badge-warning";
  return "badge-danger";
}

function toEditValues(suggestion: AiSuggestion): EditValues {
  return {
    claim: suggestion.claim,
    signalKey: suggestion.signalKey,
    impact: String(suggestion.impact),
    confidence: suggestion.confidence,
    contractStatus: suggestion.contractStatus ?? "",
    sourceExcerpt: suggestion.sourceExcerpt ?? "",
  };
}

export function AiReviewQueue({
  suggestions,
  onReview,
  onEdit,
  busyEvidenceId,
}: AiReviewQueueProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit(suggestion: AiSuggestion) {
    setEditingId(suggestion.evidenceId);
    setEditValues(toEditValues(suggestion));
    setEditError(null);
  }

  async function saveEdit(evidenceId: string) {
    if (!editValues) return;
    const impact = Number(editValues.impact);
    if (!Number.isFinite(impact) || impact < -40 || impact > 40) {
      setEditError("Impact must be between -40 and 40.");
      return;
    }
    const claim = editValues.claim.trim();
    if (!claim) {
      setEditError("Claim is required.");
      return;
    }

    await onEdit(evidenceId, {
      claim,
      signalKey: editValues.signalKey,
      impact,
      confidence: editValues.confidence,
      contractStatus: editValues.contractStatus.trim() || null,
      sourceExcerpt: editValues.sourceExcerpt.trim(),
    });
    setEditingId(null);
    setEditValues(null);
    setEditError(null);
  }

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
              const isEditing = editingId === suggestion.evidenceId && editValues;

              return (
                <Fragment key={suggestion.id}>
                  <tr style={{ cursor: "default" }}>
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
                      <span className={`badge ${confidenceBadgeClass(suggestion.confidence)}`}>
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
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={disabled}
                          onClick={() => startEdit(suggestion)}
                        >
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
                  {isEditing && (
                    <tr style={{ cursor: "default", background: "#f8fafc" }}>
                      <td colSpan={6}>
                        <div className="form-grid" style={{ alignItems: "start" }}>
                          <div className="form-field full-width">
                            <label className="form-label" htmlFor={`claim-${suggestion.evidenceId}`}>
                              Claim
                            </label>
                            <textarea
                              id={`claim-${suggestion.evidenceId}`}
                              className="form-input"
                              value={editValues.claim}
                              rows={3}
                              onChange={(event) =>
                                setEditValues({ ...editValues, claim: event.target.value })
                              }
                            />
                          </div>
                          <div className="form-field">
                            <label className="form-label" htmlFor={`signal-${suggestion.evidenceId}`}>
                              Suggested signal
                            </label>
                            <select
                              id={`signal-${suggestion.evidenceId}`}
                              className="form-select"
                              value={editValues.signalKey}
                              onChange={(event) =>
                                setEditValues({
                                  ...editValues,
                                  signalKey: event.target.value as SignalKey,
                                })
                              }
                            >
                              {signalOptions.map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-field">
                            <label className="form-label" htmlFor={`impact-${suggestion.evidenceId}`}>
                              Impact
                            </label>
                            <input
                              id={`impact-${suggestion.evidenceId}`}
                              className="form-input"
                              type="number"
                              min={-40}
                              max={40}
                              value={editValues.impact}
                              onChange={(event) =>
                                setEditValues({ ...editValues, impact: event.target.value })
                              }
                            />
                          </div>
                          <div className="form-field">
                            <label className="form-label" htmlFor={`confidence-${suggestion.evidenceId}`}>
                              Confidence
                            </label>
                            <select
                              id={`confidence-${suggestion.evidenceId}`}
                              className="form-select"
                              value={editValues.confidence}
                              onChange={(event) =>
                                setEditValues({
                                  ...editValues,
                                  confidence: event.target.value as ConfidenceLevel,
                                })
                              }
                            >
                              {confidenceOptions.map((confidence) => (
                                <option key={confidence} value={confidence}>
                                  {confidence}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-field">
                            <label className="form-label" htmlFor={`contract-${suggestion.evidenceId}`}>
                              Contract status
                            </label>
                            <input
                              id={`contract-${suggestion.evidenceId}`}
                              className="form-input"
                              value={editValues.contractStatus}
                              placeholder="planned, started, current..."
                              onChange={(event) =>
                                setEditValues({ ...editValues, contractStatus: event.target.value })
                              }
                            />
                          </div>
                          <div className="form-field full-width">
                            <label className="form-label" htmlFor={`excerpt-${suggestion.evidenceId}`}>
                              Source excerpt
                            </label>
                            <textarea
                              id={`excerpt-${suggestion.evidenceId}`}
                              className="form-input"
                              value={editValues.sourceExcerpt}
                              rows={3}
                              onChange={(event) =>
                                setEditValues({ ...editValues, sourceExcerpt: event.target.value })
                              }
                            />
                          </div>
                          <div className="form-field full-width">
                            {editError && (
                              <p style={{ margin: "0 0 8px", color: "var(--color-danger)", fontSize: "0.8125rem" }}>
                                {editError}
                              </p>
                            )}
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={disabled}
                                onClick={() => saveEdit(suggestion.evidenceId)}
                              >
                                Save changes
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={disabled}
                                onClick={() => {
                                  setEditingId(null);
                                  setEditValues(null);
                                  setEditError(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
