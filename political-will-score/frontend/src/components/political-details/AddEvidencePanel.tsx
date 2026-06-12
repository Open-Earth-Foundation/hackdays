"use client";

import { useState } from "react";

const intakeTabs = [
  { id: "url", label: "Paste URL", icon: "🔗" },
  { id: "file", label: "Upload file", icon: "📄" },
  { id: "structured", label: "Structured data", icon: "📊" },
  { id: "note", label: "Manual note", icon: "✏️" },
] as const;

type IntakeTab = (typeof intakeTabs)[number]["id"];

export function AddEvidencePanel() {
  const [activeTab, setActiveTab] = useState<IntakeTab>("url");

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
          <div className="form-grid">
            <div className="form-field full-width">
              <label className="form-label" htmlFor="evidence-url">
                Source URL
              </label>
              <input
                id="evidence-url"
                className="form-input"
                defaultValue="https://bip.warszawa.pl/"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="evidence-source-type">
                Source type
              </label>
              <select id="evidence-source-type" className="form-select" defaultValue="contract_register">
                <option value="contract_register">city contract register</option>
                <option value="bip_page">BIP page</option>
                <option value="budget">budget page</option>
                <option value="news">news article</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="contract-status">
                Contract status
              </label>
              <select id="contract-status" className="form-select" defaultValue="started">
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
              <button type="button" className="btn btn-primary">
                + Analyze source
              </button>
            </div>
          </div>
        )}

        {activeTab === "file" && (
          <div
            style={{
              border: "2px dashed var(--color-border-strong)",
              borderRadius: 10,
              padding: 40,
              textAlign: "center",
              color: "var(--color-text-muted)",
            }}
          >
            <p style={{ margin: "0 0 12px" }}>Drop PDF, CSV, or document here</p>
            <button type="button" className="btn btn-secondary btn-sm">
              Choose file
            </button>
          </div>
        )}

        {activeTab === "structured" && (
          <div className="form-grid">
            <div className="form-field full-width">
              <label className="form-label">Upload contract register export</label>
              <input type="file" className="form-input" accept=".csv,.xlsx" />
            </div>
          </div>
        )}

        {activeTab === "note" && (
          <div className="form-grid">
            <div className="form-field full-width">
              <label className="form-label" htmlFor="manual-note">
                Analyst note
              </label>
              <textarea
                id="manual-note"
                className="form-input"
                rows={4}
                placeholder="Meeting notes, phone call summary..."
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary">
                Save as needs review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
