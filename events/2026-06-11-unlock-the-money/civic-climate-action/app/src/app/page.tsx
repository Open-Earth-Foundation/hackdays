import Link from "next/link";
import YourMove from "./components/YourMove";
import CommitmentWall from "./components/CommitmentWall";
import PoaEngagementMap from "./components/PoaEngagementMap";
import { cities } from "./data/cities";
import { stories } from "./data/stories";

const poa = cities.find((c) => c.id === "porto-alegre")!;

// Lead with Porto Alegre's own story, then two more proof points.
const teaserIds = ["portoalegre-participatory-budget", "rio-favela-reforestation", "medellin-green-corridors"];
const teaserStories = teaserIds
  .map((id) => stories.find((s) => s.id === id))
  .filter((s): s is (typeof stories)[number] => Boolean(s));

const hazards = poa.risk?.topHazards ?? [];
const topSector = poa.emissions?.sectors?.[0];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <header className="section" style={{ paddingBottom: "3rem" }}>
        <div className="wrap">
          <div className="eyebrow">Porto Alegre · pilot city</div>
          <h1 style={{ fontSize: "clamp(2.3rem, 5.5vw, 3.6rem)", margin: "1rem 0 0", maxWidth: 780 }}>
            Porto Alegre. Your move.
          </h1>
          <p style={{ fontSize: "1.2rem", color: "var(--ink-soft)", maxWidth: 600, marginTop: "1rem" }}>
            See what your city is up against on climate — then get <strong style={{ color: "var(--ink)" }}>one
            real thing you can actually do this week</strong>, with the exact place to do it and the
            words to say.
          </p>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--ink-faint)" }}>
            Built on CityCatalyst data. More cities coming.
          </p>
        </div>
      </header>

      {/* What's at stake */}
      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="wrap">
          <div className="eyebrow">What&rsquo;s at stake</div>
          <h2 style={{ fontSize: "1.8rem", margin: "0.7rem 0 0.6rem", maxWidth: 640 }}>
            What Porto Alegre is up against
          </h2>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "2rem" }}>
            From the city&rsquo;s own climate-risk assessment. These are the signals your move pushes on.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {hazards.map((h) => (
              <div key={h.hazard} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14, padding: "1.2rem 1.3rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#b91c1c" }}>
                  {h.level} risk
                </div>
                <div style={{ fontWeight: 650, fontSize: "1.25rem", margin: "0.35rem 0 0.2rem" }}>{h.hazard}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>Threatens {h.keyImpact} across the city.</div>
              </div>
            ))}
            {topSector && (
              <div style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14, padding: "1.2rem 1.3rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#d97706" }}>
                  Emissions
                </div>
                <div style={{ fontWeight: 650, fontSize: "1.25rem", margin: "0.35rem 0 0.2rem" }}>
                  {topSector.sector} {Math.round(topSector.sharePct)}%
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>The city&rsquo;s largest reported emissions source.</div>
              </div>
            )}
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--ink-faint)", marginTop: "1.2rem" }}>
            Source:{" "}
            {poa.risk?.sourceUrl ? (
              <a href={poa.risk.sourceUrl} target="_blank" rel="noopener noreferrer">{poa.risk.source} ↗</a>
            ) : (
              poa.risk?.source
            )}
            . Porto Alegre is the birthplace of participatory budgeting — residents here have shaped real city spending since 1989.
          </p>
        </div>
      </section>

      {/* Your one move */}
      <section className="section" id="act">
        <div className="wrap">
          <div className="eyebrow">Your move</div>
          <h2 style={{ fontSize: "1.8rem", margin: "0.7rem 0 0.6rem", maxWidth: 640 }}>
            One real step — not a to-do list
          </h2>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "2.5rem" }}>
            Answer two quick questions. We&rsquo;ll hand you a single concrete move, the real local
            channel to do it through, and a message ready to send.
          </p>
          <YourMove />
        </div>
      </section>

      {/* Public commitment wall */}
      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="wrap">
          <div className="eyebrow">On the record</div>
          <h2 style={{ fontSize: "1.8rem", margin: "0.7rem 0 0.6rem", maxWidth: 640 }}>
            What Porto Alegre is committing to
          </h2>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "2rem" }}>
            Every commitment here is a named resident pledging a real, specific action — and tracking
            whether they followed through. This is engagement you can actually count.
          </p>
          <div style={{ marginBottom: "2.5rem" }}>
            <PoaEngagementMap height={340} />
          </div>
          <CommitmentWall />
        </div>
      </section>

      {/* For funders callout */}
      <section className="section">
        <div className="wrap">
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              background: "var(--accent-soft)",
              padding: "1.6rem 1.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 560 }}>
              <div className="eyebrow">For funders</div>
              <p style={{ fontSize: "1.05rem", marginTop: "0.4rem", color: "var(--ink)" }}>
                These commitments are the community-engagement co-benefit MDBs and philanthropy
                already score — quantified by theme and neighborhood, with follow-through.{" "}
                <strong>See how civic engagement unlocks climate finance.</strong>
              </p>
            </div>
            <Link
              href="/funders"
              style={{
                fontWeight: 650,
                color: "#fff",
                background: "var(--accent)",
                borderRadius: 999,
                padding: "0.6rem 1.3rem",
                whiteSpace: "nowrap",
              }}
            >
              See the funder view →
            </Link>
          </div>
        </div>
      </section>

      {/* Proof teaser */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">It works</div>
          <h2 style={{ fontSize: "1.8rem", margin: "0.7rem 0 0.6rem", maxWidth: 640 }}>
            Residents have changed their cities before
          </h2>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "2.2rem" }}>
            Real, sourced stories of ordinary people who moved their city — starting exactly where you are now.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {teaserStories.map((s) => (
              <div key={s.id} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14, padding: "1.1rem 1.2rem" }}>
                <div style={{ fontSize: "0.74rem", color: "var(--ink-faint)" }}>{s.city}, {s.country} · {s.year}</div>
                <div style={{ fontWeight: 650, margin: "0.3rem 0 0.3rem" }}>{s.title}</div>
                <p style={{ fontSize: "0.88rem", color: "var(--ink-soft)", margin: 0 }}>{s.outcome}</p>
              </div>
            ))}
          </div>

          <Link href="/stories" style={{ display: "inline-block", marginTop: "1.6rem", fontWeight: 650 }}>
            Read more real stories →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="section">
        <div className="wrap" style={{ display: "grid", gap: "1.5rem" }}>
          <div>
            <div className="eyebrow">Why it pays</div>
            <p style={{ maxWidth: 720, marginTop: "0.6rem", color: "var(--ink-soft)" }}>
              Civic participation is a co-benefit funders (MDBs, the IDB, philanthropy) already score.
              This makes it real and countable: named residents{" "}
              <strong style={{ color: "var(--ink)" }}>sign specific commitments and report following
              through</strong> — not anonymous clicks. &ldquo;Is this city engaged?&rdquo; stops being a
              guess and becomes a public, sourced record of who committed to what, and who acted.
            </p>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--ink-faint)", maxWidth: 720, margin: 0 }}>
            Built for OEF Hackday 26Q2. This pilot is scoped to Porto Alegre, which pulls live
            emissions-inventory and climate-risk data from CityCatalyst. Local channels are real and
            linked; the ready-to-send message is AI-written on a small open-weight model — check the
            details before you send. Inspiration stories are independently sourced.
          </p>
        </div>
      </footer>
    </>
  );
}
