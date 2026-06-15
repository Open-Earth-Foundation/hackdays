"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavBack, ToolNav } from "@/components/tool/ToolNav";
import { useTool } from "@/lib/tool/tool-context";

const ORG_TYPES = [
  { title: "Multilateral Development Bank", sub: "World Bank, IDB, ADB, EBRD, AfDB" },
  { title: "Global Climate Fund", sub: "GCF, GEF, Adaptation Fund" },
  { title: "Bilateral Agency", sub: "USAID, JICA, GIZ, AFD, FCDO" },
  { title: "Philanthropy", sub: "Bloomberg, Bezos Earth Fund, foundations" },
  { title: "Project Prep. Facility", sub: "C40, CCFLA, ICLEI, AECOM" },
  { title: "Commercial Finance", sub: "Banks, PE, infrastructure funds" },
  { title: "Impact Finance", sub: "Green bonds, blended finance" },
];

const SECTOR_PILLS = [
  "Transport & mobility", "Energy transition", "Waste management", "Water & sanitation",
  "Urban resilience", "Nature-based solutions", "Buildings & housing", "Air quality",
];

const REGION_PILLS = [
  "Latin America", "Sub-Saharan Africa", "South & Southeast Asia", "MENA", "Eastern Europe", "Global",
];

export function FunderProfile() {
  const router = useRouter();
  const { funderStep, setFunderStep } = useTool();
  const [orgType, setOrgType] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const toggle = (list: string[], item: string, set: (v: string[]) => void) => {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  return (
    <>
      <ToolNav right={<NavBack href="/tool/role" />} />
      <div className="container-sm" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Set up your funder profile</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>This helps us match you with cities that fit your mandate.</p>

        <div className="steps" style={{ marginBottom: 32 }}>
          <div className={`step${funderStep >= 1 ? " active" : ""}`}>
            <div className="step-num">1</div>
            <div className="step-label">Organization type</div>
          </div>
          <div className="step-line" />
          <div className={`step${funderStep >= 2 ? " active" : ""}`}>
            <div className="step-num">2</div>
            <div className="step-label">Investment criteria</div>
          </div>
          <div className="step-line" />
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-label">Done</div>
          </div>
        </div>

        {funderStep === 1 && (
          <>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title">
                <i className="ti ti-building-bank" /> What type of organization are you?
              </div>
              <div className="profile-types">
                {ORG_TYPES.map((o) => (
                  <button
                    key={o.title}
                    type="button"
                    className={`profile-type-btn${orgType === o.title ? " selected" : ""}`}
                    onClick={() => setOrgType(o.title)}
                  >
                    <span>{o.title}</span>
                    <small>{o.sub}</small>
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label>Organization name</label>
                <input type="text" placeholder="e.g. European Investment Bank" />
              </div>
              <div className="form-group">
                <label>Your name &amp; title</label>
                <input type="text" placeholder="e.g. María García, Investment Officer" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Work email</label>
                <input type="email" placeholder="you@organization.org" />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setFunderStep(2)}>
                Continue <i className="ti ti-arrow-right" />
              </button>
            </div>
          </>
        )}

        {funderStep === 2 && (
          <>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title">
                <i className="ti ti-filter" /> Investment criteria
              </div>
              <div className="form-group">
                <label>Sectors of interest</label>
                <div className="pill-select">
                  {SECTOR_PILLS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`pill-opt${sectors.includes(s) ? " selected" : ""}`}
                      onClick={() => toggle(sectors, s, setSectors)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Preferred regions</label>
                <div className="pill-select">
                  {REGION_PILLS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`pill-opt${regions.includes(r) ? " selected" : ""}`}
                      onClick={() => toggle(regions, r, setRegions)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Ticket size (min USD)</label>
                  <input type="text" placeholder="e.g. $1,000,000" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Ticket size (max USD)</label>
                  <input type="text" placeholder="e.g. $50,000,000" />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 20, marginBottom: 0 }}>
                <label>Risk appetite</label>
                <select defaultValue="medium-high">
                  <option>Low — sovereign-backed only</option>
                  <option>Medium — sub-sovereign with guarantees</option>
                  <option>Medium-high — blended finance welcome</option>
                  <option>High — first-loss accepted</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setFunderStep(1)}>
                <i className="ti ti-arrow-left" /> Back
              </button>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push("/tool/funder/search")}>
                Find cities <i className="ti ti-search" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
