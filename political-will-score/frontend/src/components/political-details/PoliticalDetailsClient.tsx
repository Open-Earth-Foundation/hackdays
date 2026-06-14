"use client";

import Link from "next/link";
import { useState } from "react";
import { AddEvidencePanel } from "@/components/political-details/AddEvidencePanel";
import { AiReviewQueue } from "@/components/political-details/AiReviewQueue";
import { AuditLog } from "@/components/political-details/AuditLog";
import { PoliticalClimateSearch } from "@/components/political-details/PoliticalClimateSearch";
import { ScoreBreakdown } from "@/components/political-details/ScoreBreakdown";
import { VerifiedEvidenceTable } from "@/components/political-details/VerifiedEvidenceTable";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { getConfidenceRange } from "@/lib/political-will/scoring";
import { reviewEvidence } from "@/lib/political-will/api";
import type { PoliticalWillDetail } from "@/types/political-will";

type PoliticalDetailsClientProps = {
  cityId: string;
  initialDetail: PoliticalWillDetail;
};

export function PoliticalDetailsClient({
  cityId,
  initialDetail,
}: PoliticalDetailsClientProps) {
  const [detail, setDetail] = useState(initialDetail);
  const [busyEvidenceId, setBusyEvidenceId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const action = detail.action;
  const verifiedCount = action.evidence.filter((item) => item.status === "verified").length;
  const dataGaps = action.signals.filter((signal) => signal.status === "missing").length;

  async function handleReview(
    evidenceId: string,
    decision: "approve" | "reject" | "needs-review"
  ) {
    setBusyEvidenceId(evidenceId);
    setStatus("Saving reviewer decision...");
    try {
      const updated = await reviewEvidence(cityId, action.id, evidenceId, decision);
      setDetail(updated);
      setStatus("Reviewer decision saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Reviewer decision failed");
    } finally {
      setBusyEvidenceId(null);
    }
  }

  return (
    <main className="page-content">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href={`/cities/${cityId}/hiap`}>HIAP</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/cities/${cityId}/hiap`}>Top actions</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Political details</span>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h1 className="page-title" style={{ margin: 0 }}>
            Political details
          </h1>
          <span className="badge badge-primary">ACTION CONFIDENCE</span>
        </div>
        {status && (
          <p style={{ margin: "8px 0 0", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            {status}
          </p>
        )}
      </header>

      <div
        className="card"
        style={{
          marginBottom: 24,
          padding: 20,
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "2rem" }}>{action.sectorIcon}</span>
        <div>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 600 }}>
            {action.title}
          </h2>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
            }}
          >
            <span>Source-backed action</span>
            <span>
              Source:{" "}
              <a href={action.sourceUrl} target="_blank" rel="noreferrer">
                {action.sourceName}
              </a>
            </span>
            <span>Date checked: {action.sourceCheckedDate}</span>
          </div>
        </div>
      </div>

      <div className="summary-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div className="card summary-card">
          <p className="summary-label">Political will</p>
          <p className="summary-value">{action.score} / 100</p>
          <ScoreBar score={action.score} />
        </div>
        <div className="card summary-card">
          <p className="summary-label">Confidence</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <ConfidenceBadge level={action.confidence} />
          </div>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            {getConfidenceRange(action.confidence)}
          </p>
        </div>
        <div className="card summary-card">
          <p className="summary-label">Evidence</p>
          <p className="summary-value">
            {action.evidenceComplete} / {action.evidenceExpected}
          </p>
          <span className="badge badge-success">Verified: {verifiedCount}</span>
        </div>
        <div className="card summary-card">
          <p className="summary-label">Data gaps</p>
          <p className="summary-value danger">{dataGaps}</p>
          <a href="#score-breakdown" className="link-muted">
            See details
          </a>
        </div>
        <div className="card summary-card">
          <p className="summary-label">Pending review</p>
          <p className="summary-value primary">{action.pendingReview}</p>
          <a href="#ai-review" className="link-muted">
            See queue
          </a>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 380px)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <AddEvidencePanel
            cityId={cityId}
            actionId={action.id}
            onDetailUpdated={setDetail}
          />
          <PoliticalClimateSearch
            cityId={cityId}
            actionId={action.id}
            onDetailUpdated={setDetail}
          />
          <div id="ai-review">
            <AiReviewQueue
              suggestions={detail.suggestions}
              onReview={handleReview}
              busyEvidenceId={busyEvidenceId}
            />
          </div>
          <VerifiedEvidenceTable evidence={action.evidence} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <div id="score-breakdown">
            <ScoreBreakdown signals={action.signals} />
          </div>
          <AuditLog events={action.auditLog} />
        </div>
      </div>
    </main>
  );
}
