import Link from "next/link";
import FunderReadout from "../components/FunderReadout";
import PoaEngagementMap from "../components/PoaEngagementMap";
import { partnerOrgs, type OrgTheme } from "../data/partnerOrgs";

export const metadata = {
  title: "For funders — Civic Climate Action",
};

const thesis = [
  {
    h: "It raises the co-benefit score",
    p: "CityCatalyst's HIAP scores stakeholder engagement as a co-benefit (−2..+2). Demonstrated community demand lifts a project's score — the difference between fundable and shelved.",
  },
  {
    h: "It de-risks disbursement",
    p: "The top reason urban climate projects stall is local resistance or low uptake. Named residents demanding and acting on a specific intervention is the evidence a credit committee needs to release capital.",
  },
  {
    h: "It satisfies the readiness gate",
    p: "Many funds require documented stakeholder consultation before approval. This produces that record continuously — timestamped, sourced, by neighborhood — instead of a one-off survey.",
  },
];

const unlock: { theme: OrgTheme; line: string }[] = [
  { theme: "Resilience", line: "Standing demand + follow-through across neighborhoods is the engagement co-benefit and demand evidence for drainage & slope-stabilization capital (e.g. POA+Drena Resiliente, MDB project-prep)." },
  { theme: "Greening", line: "Documented demand for shade and trees supports nature-based-solution co-financing — and engaged residents are the maintenance base funders worry about." },
  { theme: "Mobility", line: "Active-mobility demand plus a volunteer base de-risks safe-streets and cycling-infrastructure investment." },
  { theme: "Energy", line: "Household-efficiency demand, especially from low-income, heat-exposed homes, supports retrofit-program funding and equity co-benefit scoring." },
];

const themeColor: Record<OrgTheme, string> = {
  Resilience: "var(--accent)",
  Greening: "#15803d",
  Mobility: "#2563eb",
  Energy: "#d97706",
};

export default function FundersPage() {
  const themes: OrgTheme[] = ["Resilience", "Greening", "Mobility", "Energy"];

  return (
    <>
      {/* Headline */}
      <header className="section" style={{ paddingBottom: "2.5rem" }}>
        <div className="wrap">
          <div className="eyebrow">For funders · MDBs · philanthropy</div>
          <h1 style={{ fontSize: "clamp(2.1rem, 4.5vw, 3.2rem)", margin: "1rem 0 0", maxWidth: 780 }}>
            Engagement you can take to a credit committee.
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--ink-soft)", maxWidth: 640, marginTop: "1rem" }}>
            Civic participation is a co-benefit funders already score. Porto Alegre residents are
            signing specific, sourced commitments to real climate priorities — here is what that is,
            and why it moves money.
          </p>
        </div>
      </header>

      {/* Why it unlocks money */}
      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="wrap">
          <div className="eyebrow">Why it unlocks money</div>
          <h2 style={{ fontSize: "1.7rem", margin: "0.7rem 0 2rem", maxWidth: 640 }}>
            Engagement isn&rsquo;t soft — it&rsquo;s a scored, gating input
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.2rem" }}>
            {thesis.map((t, i) => (
              <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14, padding: "1.3rem 1.4rem" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)" }}>{i + 1}</div>
                <h3 style={{ fontSize: "1.05rem", margin: "0.4rem 0 0.4rem" }}>{t.h}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>{t.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where it's happening (live) */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Live · Porto Alegre</div>
          <h2 style={{ fontSize: "1.7rem", margin: "0.7rem 0 1.8rem", maxWidth: 640 }}>
            Where engagement is happening, right now
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: "2rem", alignItems: "start" }} className="funder-where">
            <FunderReadout />
            <PoaEngagementMap height={420} />
          </div>
        </div>
      </section>

      {/* Who can deliver */}
      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="wrap">
          <div className="eyebrow">Who can deliver</div>
          <h2 style={{ fontSize: "1.7rem", margin: "0.7rem 0 0.6rem", maxWidth: 640 }}>
            Credible local implementers, already mobilizing
          </h2>
          <p className="muted" style={{ maxWidth: 660, marginBottom: "2rem" }}>
            Funders deploy through local organizations. These are real Porto Alegre / Rio Grande do
            Sul groups residents are being routed to — the absorptive capacity on the ground.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {partnerOrgs.map((o) => (
              <div key={o.id} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.1rem" }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: themeColor[o.theme] }}>{o.theme}</div>
                <a href={o.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 650, display: "inline-block", margin: "0.25rem 0 0.3rem" }}>{o.name} ↗</a>
                <p style={{ fontSize: "0.84rem", color: "var(--ink-soft)", margin: 0 }}>{o.what}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What this could unlock */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">What this could unlock</div>
          <h2 style={{ fontSize: "1.7rem", margin: "0.7rem 0 1.8rem", maxWidth: 640 }}>
            From demand signal to capital
          </h2>
          <div style={{ display: "grid", gap: "0.8rem", maxWidth: 820 }}>
            {unlock.map((u) => (
              <div key={u.theme} style={{ display: "flex", gap: 14, alignItems: "flex-start", borderLeft: `3px solid ${themeColor[u.theme]}`, paddingLeft: "1rem" }}>
                <span style={{ fontWeight: 650, minWidth: 96, color: themeColor[u.theme] }}>{u.theme}</span>
                <span style={{ fontSize: "0.92rem", color: "var(--ink-soft)" }}>{u.line}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caveats */}
      <footer className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="wrap">
          <div className="eyebrow">Honest about scope</div>
          <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", maxWidth: 720, marginTop: "0.6rem" }}>
            This is a hackday pilot scoped to Porto Alegre. Engagement figures include a clearly
            labelled demo baseline plus live signed commitments; theme and neighborhood breakdowns
            reflect the named records. Risk and emissions data are live from CityCatalyst; partner
            organizations are real and linked. The model here is the point: turn civic participation
            into a continuous, sourced, fundable signal.
          </p>
          <p style={{ marginTop: "1.2rem" }}>
            <Link href="/" style={{ fontWeight: 650 }}>← Back to the resident view</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
