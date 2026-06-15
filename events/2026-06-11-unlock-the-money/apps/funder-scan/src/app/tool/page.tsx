import Link from "next/link";
import { ToolNav } from "@/components/tool/ToolNav";

const STATS = [
  { icon: "ti-building-community", color: "var(--green)", stat: "314", label: "Chile comunas in the engine" },
  { icon: "ti-cash", color: "var(--green-mid)", stat: "78", label: "Funding instruments catalogued", statColor: "var(--green-dark)" },
  { icon: "ti-arrows-shuffle", color: "var(--amber)", stat: "2-sided", label: "City wizard & funder browse", statColor: "#633806" },
  { icon: "ti-stack-2", color: "var(--green)", stat: "Pools", label: "Gap comunas bundled into deals" },
] as const;

export default function ToolLandingPage() {
  return (
    <>
      <ToolNav />
      <div className="hero">
        <div className="container hero-inner">
          <p className="hero-eyebrow">OpenEarth · Unlock the Money · Chile prototype</p>
          <h1>
            Find the right instrument.
            <br />
            Or the right city.
          </h1>
          <p className="hero-lead">
            A two-sided matcher for municipal climate finance — walk through as a city seeking instruments,
            or a funder browsing credible projects. Built on the same engine that pools gaps into deals.
          </p>
          <div className="hero-actions">
            <Link href="/tool/role" className="btn btn-lg btn-hero-primary">
              Choose your role <i className="ti ti-arrow-right" />
            </Link>
            <Link href="/tool/city/wizard/1" className="btn btn-lg btn-hero-secondary">
              <i className="ti ti-building-skyscraper" /> City path
            </Link>
            <Link href="/tool/funder/search" className="btn btn-lg btn-hero-secondary">
              <i className="ti ti-search" /> Funder path
            </Link>
          </div>
        </div>
      </div>

      <div className="container tool-landing-body">
        <div className="tool-stats-grid">
          {STATS.map((c) => (
            <div key={c.label} className="card tool-stat-card">
              <i className={`ti ${c.icon}`} style={{ fontSize: 36, color: c.color }} />
              <div className="tool-stat-value" style={{ color: c.statColor ?? "var(--green-dark)" }}>
                {c.stat}
              </div>
              <div className="tool-stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="tool-path-cards">
          <Link href="/tool/city/wizard/1" className="tool-path-card">
            <div className="tool-path-icon city">
              <i className="ti ti-building-skyscraper" />
            </div>
            <h3>For cities</h3>
            <p>Three-step profile → matched instruments → readiness gaps.</p>
            <span className="tool-path-cta">
              Start city wizard <i className="ti ti-arrow-right" />
            </span>
          </Link>
          <Link href="/tool/funder/search" className="tool-path-card">
            <div className="tool-path-icon funder">
              <i className="ti ti-currency-dollar" />
            </div>
            <h3>For funders</h3>
            <p>Set your mandate, browse city profiles, and send an expression of interest.</p>
            <span className="tool-path-cta">
              Browse cities <i className="ti ti-arrow-right" />
            </span>
          </Link>
        </div>

        <p className="tool-back-link">
          <Link href="/">
            <i className="ti ti-arrow-left" /> Back to Chile engine demo
          </Link>
        </p>
      </div>
    </>
  );
}
