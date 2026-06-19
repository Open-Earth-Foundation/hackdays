import StoriesGallery from "../components/StoriesGallery";
import { stories } from "../data/stories";

export const metadata = {
  title: "Real stories — Civic Climate Action",
};

export default function StoriesPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow">Inspiration</div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", margin: "0.8rem 0 0.6rem", maxWidth: 720 }}>
          Residents have changed their cities before
        </h1>
        <p className="muted" style={{ maxWidth: 660, marginBottom: "2.5rem" }}>
          Real, independently sourced stories — from cooling streets with trees to citizens setting
          the city budget. Every card links to its source. Filter by what you care about.
        </p>
        <StoriesGallery stories={stories} />
      </div>
    </section>
  );
}
