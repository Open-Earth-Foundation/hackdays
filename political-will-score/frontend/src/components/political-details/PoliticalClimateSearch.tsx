"use client";

import { useState } from "react";
import { searchPoliticalClimate } from "@/lib/political-will/api";
import type { PoliticalWillDetail } from "@/types/political-will";

type PoliticalClimateSearchProps = {
  cityId: string;
  actionId: string;
  onDetailUpdated: (detail: PoliticalWillDetail) => void;
};

export function PoliticalClimateSearch({
  cityId,
  actionId,
  onDetailUpdated,
}: PoliticalClimateSearchProps) {
  const [recencyDays, setRecencyDays] = useState(30);
  const [queryTerms, setQueryTerms] = useState(
    "elections political support opposition current public statements bias budget procurement"
  );
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Political climate search</h2>
      </div>
      <form
        className="card-body form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSearching(true);
          setStatus("Searching recent political and election signals...");
          try {
            const detail = await searchPoliticalClimate(cityId, actionId, {
              recencyDays,
              queryTerms,
            });
            onDetailUpdated(detail);
            setStatus("Search findings added to the review queue.");
          } catch (error) {
            setStatus(error instanceof Error ? error.message : "Search failed");
          } finally {
            setIsSearching(false);
          }
        }}
      >
        <div className="form-field">
          <label className="form-label" htmlFor="recency-days">
            Recency
          </label>
          <select
            id="recency-days"
            className="form-select"
            value={recencyDays}
            onChange={(event) => setRecencyDays(Number(event.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="political-query">
            Search terms
          </label>
          <input
            id="political-query"
            className="form-input"
            value={queryTerms}
            onChange={(event) => setQueryTerms(event.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "end" }}>
          <button type="submit" className="btn btn-primary" disabled={isSearching}>
            Search articles
          </button>
        </div>
        {status && (
          <p
            className="full-width"
            style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.875rem" }}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
