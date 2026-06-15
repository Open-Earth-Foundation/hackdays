"use client";

import Link from "next/link";
import { useState } from "react";

export function ComunaFundModal({
  comunaName,
  open,
  onClose,
}: {
  comunaName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get("email")) {
      alert("Please enter your work email.");
      return;
    }
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="presentation"
    >
      <div className="modal" role="dialog" aria-labelledby="comuna-fund-modal-title">
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 8 }}>
          <h2 id="comuna-fund-modal-title">Express interest — {comunaName}</h2>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
            <i className="ti ti-x" />
          </button>
        </div>
        <p className="modal-subtitle">
          Prototype flow — we&apos;ll connect you with the municipal climate finance contact for this comuna.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cf-firstname">First name</label>
                <input id="cf-firstname" name="firstname" type="text" placeholder="María" />
              </div>
              <div className="form-group">
                <label htmlFor="cf-lastname">Last name</label>
                <input id="cf-lastname" name="lastname" type="text" placeholder="García" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cf-org">Organization</label>
              <input id="cf-org" name="org" type="text" placeholder="SUBDERE / GCF accredited entity" />
            </div>
            <div className="form-group">
              <label htmlFor="cf-email">Work email</label>
              <input id="cf-email" name="email" type="email" placeholder="you@organization.org" required />
            </div>
            <div className="form-group">
              <label htmlFor="cf-type">Funding type</label>
              <select id="cf-type" name="type" defaultValue="Grant">
                <option>Grant</option>
                <option>Concessional loan</option>
                <option>Technical assistance</option>
                <option>Blended finance</option>
                <option>Guarantees</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="cf-message">Message (optional)</label>
              <textarea
                id="cf-message"
                name="message"
                placeholder="Your mandate, ticket size, or questions about pool coordination…"
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="ti ti-send" /> Send expression of interest
              </button>
            </div>
          </form>
        ) : (
          <div className="success-state">
            <div className="success-icon">
              <i className="ti ti-check" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Expression of interest sent!</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              The team for {comunaName} will be notified. A confirmation has been sent to your email.
            </p>
            <Link
              href="/tool/funder/search"
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
              onClick={handleClose}
            >
              <i className="ti ti-arrow-left" /> Browse more comunas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
