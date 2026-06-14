"use client";

import { useState } from "react";
import {
  analyzeSource,
  createSource,
  uploadSource,
} from "@/lib/political-will/api";
import type { PoliticalWillDetail } from "@/types/political-will";

const intakeTabs = [
  { id: "url", label: "Paste URL", icon: "🔗" },
  { id: "file", label: "Upload file", icon: "📄" },
  { id: "structured", label: "Structured data", icon: "📊" },
  { id: "note", label: "Manual note", icon: "✏️" },
] as const;

type IntakeTab = (typeof intakeTabs)[number]["id"];

type AddEvidencePanelProps = {
  cityId: string;
  actionId: string;
  onDetailUpdated: (detail: PoliticalWillDetail) => void;
};

export function AddEvidencePanel({
  cityId,
  actionId,
  onDetailUpdated,
}: AddEvidencePanelProps) {
  const [activeTab, setActiveTab] = useState<IntakeTab>("url");
  const [url, setUrl] = useState("https://bip.warszawa.pl/");
  const [sourceType, setSourceType] = useState("contract_register");
  const [contractStatus, setContractStatus] = useState("started");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [structuredFile, setStructuredFile] = useState<File | null>(null);
  const [manualNote, setManualNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function runWithStatus(label: string, task: () => Promise<void>) {
    setIsSubmitting(true);
    setStatus(label);
    try {
      await task();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function analyzeCreatedSource(sourceId: string) {
    const detail = await analyzeSource(cityId, actionId, sourceId);
    onDetailUpdated(detail);
    setStatus("Source analyzed. Suggestions are ready for review.");
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Add evidence source</h2>
      </div>
      <div className="card-body">
        <div className="tabs" style={{ marginBottom: 20 }}>
          {intakeTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "url" && (
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              runWithStatus("Saving and analyzing URL source...", async () => {
                const response = await createSource(cityId, actionId, {
                  sourceKind: "url",
                  sourceType,
                  url,
                  contractStatus,
                });
                onDetailUpdated(response.detail);
                await analyzeCreatedSource(response.source.id);
              });
            }}
          >
            <div className="form-field full-width">
              <label className="form-label" htmlFor="evidence-url">
                Source URL
              </label>
              <input
                id="evidence-url"
                className="form-input"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="evidence-source-type">
                Source type
              </label>
              <select
                id="evidence-source-type"
                className="form-select"
                value={sourceType}
                onChange={(event) => setSourceType(event.target.value)}
              >
                <option value="contract_register">city contract register</option>
                <option value="bip_page">BIP page</option>
                <option value="budget">budget page</option>
                <option value="news">news article</option>
                <option value="election">election source</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="contract-status">
                Contract status
              </label>
              <select
                id="contract-status"
                className="form-select"
                value={contractStatus}
                onChange={(event) => setContractStatus(event.target.value)}
              >
                <option value="planned">planned</option>
                <option value="tendered">tendered</option>
                <option value="awarded">awarded</option>
                <option value="current">current</option>
                <option value="started">started</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                + Analyze source
              </button>
            </div>
          </form>
        )}

        {activeTab === "file" && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!documentFile) {
                setStatus("Choose a PDF or text document first.");
                return;
              }
              runWithStatus("Uploading and analyzing document...", async () => {
                const response = await uploadSource(cityId, actionId, {
                  file: documentFile,
                  sourceType,
                  contractStatus,
                });
                onDetailUpdated(response.detail);
                await analyzeCreatedSource(response.source.id);
              });
            }}
          >
            <div
              style={{
                border: "2px dashed var(--color-border-strong)",
                borderRadius: 10,
                padding: 32,
                textAlign: "center",
                color: "var(--color-text-muted)",
              }}
            >
              <p style={{ margin: "0 0 12px" }}>Upload PDF or text evidence</p>
              <input
                type="file"
                className="form-input"
                accept=".pdf,.txt"
                onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
              />
              <div style={{ marginTop: 16 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  Analyze document
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === "structured" && (
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              if (!structuredFile) {
                setStatus("Choose a CSV or JSON file first.");
                return;
              }
              runWithStatus("Uploading and analyzing structured data...", async () => {
                const response = await uploadSource(cityId, actionId, {
                  file: structuredFile,
                  sourceType: "contract_register",
                  contractStatus,
                });
                onDetailUpdated(response.detail);
                await analyzeCreatedSource(response.source.id);
              });
            }}
          >
            <div className="form-field full-width">
              <label className="form-label">Upload contract register export</label>
              <input
                type="file"
                className="form-input"
                accept=".csv,.json"
                onChange={(event) => setStructuredFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                Analyze structured data
              </button>
            </div>
          </form>
        )}

        {activeTab === "note" && (
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              runWithStatus("Saving manual note...", async () => {
                const response = await createSource(cityId, actionId, {
                  sourceKind: "manual_note",
                  sourceType: "manual_note",
                  rawText: manualNote,
                });
                onDetailUpdated(response.detail);
                setStatus("Manual note saved as an unreviewed source.");
              });
            }}
          >
            <div className="form-field full-width">
              <label className="form-label" htmlFor="manual-note">
                Analyst note
              </label>
              <textarea
                id="manual-note"
                className="form-input"
                rows={4}
                placeholder="Meeting notes, phone call summary..."
                value={manualNote}
                onChange={(event) => setManualNote(event.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-secondary" disabled={isSubmitting}>
                Save as needs review
              </button>
            </div>
          </form>
        )}

        {status && (
          <p style={{ margin: "16px 0 0", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
