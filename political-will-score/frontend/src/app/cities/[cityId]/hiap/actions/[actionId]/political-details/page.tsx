import Link from "next/link";
import { notFound } from "next/navigation";
import { AddEvidencePanel } from "@/components/political-details/AddEvidencePanel";
import { AiReviewQueue } from "@/components/political-details/AiReviewQueue";
import { AuditLog } from "@/components/political-details/AuditLog";
import { ScoreBreakdown } from "@/components/political-details/ScoreBreakdown";
import { VerifiedEvidenceTable } from "@/components/political-details/VerifiedEvidenceTable";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { aiSuggestions, getAction, getCityHiapData } from "@/data/political-will";
import { getConfidenceRange } from "@/lib/political-will/scoring";

type PageProps = {
  params: Promise<{ cityId: string; actionId: string }>;
};

export default async function PoliticalDetailsPage({ params }: PageProps) {
  const { cityId, actionId } = await params;
  const city = getCityHiapData(cityId);
  const action = getAction(cityId, actionId);

  if (!city || !action) {
    notFound();
  }

  const verifiedCount = action.evidence.filter((item) => item.status === "verified").length;
  const dataGaps = action.signals.filter((signal) => signal.status === "missing").length;

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
          <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 600 }}>{action.title}</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
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
          gridTemplateColumns: "1fr 380px",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AddEvidencePanel />
          <div id="ai-review">
            <AiReviewQueue suggestions={aiSuggestions} />
          </div>
          <VerifiedEvidenceTable evidence={action.evidence} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div id="score-breakdown">
            <ScoreBreakdown signals={action.signals} />
          </div>
          <AuditLog events={action.auditLog} />
        </div>
      </div>
    </main>
  );
}
