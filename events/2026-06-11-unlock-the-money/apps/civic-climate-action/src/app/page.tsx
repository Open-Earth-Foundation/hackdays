import FlowDiagram from "./components/FlowDiagram";
import CityExplorer from "./components/CityExplorer";
import StoriesGallery from "./components/StoriesGallery";
import { cities } from "./data/cities";
import { stories } from "./data/stories";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <header className="section" style={{ paddingBottom: "3.5rem" }}>
        <div className="wrap">
          <div className="eyebrow">Civic Climate Action · a CityCatalyst companion</div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", margin: "1rem 0 0", maxWidth: 760 }}>
            Your city, your move.
          </h1>
          <p style={{ fontSize: "1.2rem", color: "var(--ink-soft)", maxWidth: 620, marginTop: "1rem" }}>
            CityCatalyst tells city governments what to do about climate. This is the other
            direction — a plain-language way for residents to see what&rsquo;s happening in their
            city and find a real way to take part.
          </p>
          <p style={{ marginTop: "1.5rem", fontStyle: "italic", color: "var(--ink-faint)", maxWidth: 620 }}>
            &ldquo;I, as a citizen, want to know what&rsquo;s happening in my city and how I could
            take better action.&rdquo;
          </p>
        </div>
      </header>

      {/* How it works */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">How it works</div>
          <h2 style={{ fontSize: "1.8rem", margin: "0.75rem 0 0.75rem", maxWidth: 640 }}>
            From city data to things you can actually do
          </h2>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "2.5rem" }}>
            We take the same data cities use to plan — their emissions inventory, climate-risk
            assessment, and prioritized actions — and translate it into plain language and concrete
            next steps. No jargon, no dashboards to decode.
          </p>
          <FlowDiagram />
        </div>
      </section>

      {/* Explore cities */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Explore</div>
          <h2 style={{ fontSize: "1.8rem", margin: "0.75rem 0 0.75rem", maxWidth: 640 }}>
            What&rsquo;s happening, city by city
          </h2>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "2.5rem" }}>
            Search a city or pick one on the map to see how residents there are shaping local
            climate action — and what you could do in your own.
          </p>
          <CityExplorer cities={cities} stories={stories} />
        </div>
      </section>

      {/* Success stories */}
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Inspiration</div>
          <h2 style={{ fontSize: "1.8rem", margin: "0.75rem 0 0.75rem", maxWidth: 640 }}>
            Citizens have done this before
          </h2>
          <p className="muted" style={{ maxWidth: 640, marginBottom: "2.5rem" }}>
            Real, sourced stories of communities that changed their cities — from cooling streets
            with trees to rewriting climate law. Every card links to its source.
          </p>
          <StoriesGallery stories={stories} />
        </div>
      </section>

      {/* Footer */}
      <footer className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="wrap" style={{ display: "grid", gap: "1.5rem" }}>
          <div>
            <div className="eyebrow">Why it pays</div>
            <p style={{ maxWidth: 720, marginTop: "0.6rem", color: "var(--ink-soft)" }}>
              Civic participation is a co-benefit funders (MDBs, the IDB, philanthropy) already
              score. This module operationalizes it — turning &ldquo;is this city engaged?&rdquo;
              into something visible and measurable that de-risks city climate projects and helps
              capital flow.
            </p>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--ink-faint)", maxWidth: 720, margin: 0 }}>
            Built for OEF Hackday 26Q2. Cities are keyed by UN/LOCODE so they can connect to live
            CityCatalyst Global API data (GHGI · CCRA · HIAP). Success stories are independently
            sourced — see each card&rsquo;s link.
          </p>
        </div>
      </footer>
    </>
  );
}
