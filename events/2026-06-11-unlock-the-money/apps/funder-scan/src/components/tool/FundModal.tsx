"use client";

import Link from "next/link";
import { useState } from "react";
import type { CityRecord } from "@/lib/tool/types";

export function FundModal({
  city,
  open,
  onClose,
}: {
  city: CityRecord;
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
      <div className="modal" role="dialog" aria-labelledby="fund-modal-title">
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 8 }}>
          <h2 id="fund-modal-title">Fund {city.name}&apos;s Climate Action Plan</h2>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
            <i className="ti ti-x" />
          </button>
        </div>
        <p className="modal-subtitle">
          Fill in your details and we&apos;ll put you in touch with the city&apos;s climate finance team within 48 hours.
        </p>

        {!submitted ? (
          <form id="fund-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-firstname">First name</label>
                <input id="f-firstname" name="firstname" type="text" placeholder="María" />
              </div>
              <div className="form-group">
                <label htmlFor="f-lastname">Last name</label>
                <input id="f-lastname" name="lastname" type="text" placeholder="García" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="f-org">Organization</label>
              <input id="f-org" name="org" type="text" placeholder="European Investment Bank" />
            </div>
            <div className="form-group">
              <label htmlFor="f-role">Your role</label>
              <input id="f-role" name="role" type="text" placeholder="Investment Officer, Climate Finance" />
            </div>
            <div className="form-group">
              <label htmlFor="f-email">Work email</label>
              <input id="f-email" name="email" type="email" placeholder="m.garcia@eib.org" required />
            </div>
            <div className="form-group">
              <label htmlFor="f-type">Funding type</label>
              <select id="f-type" name="type" defaultValue="Grant">
                <option>Grant</option>
                <option>Concessional loan</option>
                <option>Equity / co-investment</option>
                <option>Technical assistance</option>
                <option>Guarantees</option>
                <option>Blended finance</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-amount">Indicative amount (USD)</label>
                <input id="f-amount" name="amount" type="text" placeholder="e.g. $5,000,000" />
              </div>
              <div className="form-group">
                <label htmlFor="f-timeline">Expected timeline</label>
                <select id="f-timeline" name="timeline" defaultValue="Within 3 months">
                  <option>Within 3 months</option>
                  <option>3–6 months</option>
                  <option>6–12 months</option>
                  <option>12+ months</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="f-message">Message to the city team (optional)</label>
              <textarea
                id="f-message"
                name="message"
                placeholder="Describe your mandate, any specific questions about the project, or conditions for funding..."
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
          <div id="fund-success">
            <div className="success-state">
              <div className="success-icon">
                <i className="ti ti-check" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Expression of interest sent!</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                The climate finance team in {city.name} will contact you within 48 hours. A confirmation has been sent to
                your email.
              </p>
              <Link
                href="/tool/funder/search"
                className="btn btn-primary"
                style={{ textDecoration: "none" }}
                onClick={handleClose}
              >
                <i className="ti ti-arrow-left" /> Explore more cities
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
