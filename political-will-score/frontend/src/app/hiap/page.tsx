import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { cityIds, getAllCityHiapData, getCityHiapData } from "@/data/political-will";
import { fetchCityHiapData } from "@/lib/political-will/api";
import type { CityHiapData } from "@/types/political-will";

async function loadCities(): Promise<CityHiapData[]> {
  const cities = await Promise.all(
    cityIds.map(async (cityId) => {
      return (await fetchCityHiapData(cityId).catch(() => undefined)) ?? getCityHiapData(cityId);
    })
  );

  return cities.filter((city): city is CityHiapData => Boolean(city));
}

export default async function HiapOverviewPage() {
  const cities = await loadCities();
  const fallbackCities = getAllCityHiapData();
  const displayCities = cities.length > 0 ? cities : fallbackCities;
  const actions = displayCities.flatMap((city) =>
    city.actions.map((action) => ({
      cityId: city.cityId,
      cityName: city.cityName,
      action,
    }))
  );
  const actionConfidence = actions.length
    ? Math.round(actions.reduce((total, item) => total + item.action.score, 0) / actions.length)
    : 0;
  const sourceBackedActions = displayCities.reduce((total, city) => total + city.sourceBackedActions, 0);
  const evidenceGaps = displayCities.reduce((total, city) => total + city.evidenceGaps, 0);
  const pendingReview = displayCities.reduce((total, city) => total + city.pendingReview, 0);

  return (
    <main className="page-content">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <span>HIAP</span>
        </nav>
        <h1 className="page-title">All HIAP actions</h1>
        <p className="page-subtitle">
          Source-backed actions across Warsaw, Krakow, and Gdansk with political will checks
        </p>
      </header>

      <div className="summary-grid">
        <div className="card summary-card">
          <p className="summary-label">Action confidence</p>
          <p className="summary-value">{actionConfidence}/100</p>
          <ScoreBar score={actionConfidence} />
        </div>
        <div className="card summary-card">
          <p className="summary-label">Source-backed actions</p>
          <p className="summary-value">{sourceBackedActions}</p>
          <span className="badge badge-success">Verified sources</span>
        </div>
        <div className="card summary-card">
          <p className="summary-label">Evidence gaps</p>
          <p className="summary-value danger">{evidenceGaps}</p>
          <span className="badge badge-danger">Needs attention</span>
        </div>
        <div className="card summary-card">
          <p className="summary-label">Pending review</p>
          <p className="summary-value primary">{pendingReview} pending</p>
          <span className="badge badge-neutral">In review queue</span>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">All selected action plans</h2>
            <p style={{ margin: "4px 0 0", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
              {actions.length} actions across {displayCities.length} cities
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {displayCities.map((city) => (
              <Link key={city.cityId} href={`/cities/${city.cityId}/hiap`} className="btn btn-secondary btn-sm">
                {city.cityName}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Rank</th>
                <th>Action</th>
                <th>Sector</th>
                <th>Source</th>
                <th>Political will</th>
                <th>Evidence</th>
                <th>Pending</th>
                <th>Data gap</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {actions.map(({ cityId, cityName, action }) => (
                <tr key={`${cityId}-${action.id}`}>
                  <td>
                    <Link href={`/cities/${cityId}/hiap`} style={{ fontWeight: 600 }}>
                      {cityName}
                    </Link>
                  </td>
                  <td>{action.rank}</td>
                  <td style={{ minWidth: 260, fontWeight: 500, lineHeight: 1.4 }}>{action.title}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span>{action.sectorIcon}</span>
                      {action.sector}
                    </span>
                  </td>
                  <td>
                    <a href={action.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem" }}>
                      {action.sourceName} ↗
                    </a>
                  </td>
                  <td style={{ minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <strong>{action.score}/100</strong>
                      <ConfidenceBadge level={action.confidence} />
                    </div>
                    <ScoreBar score={action.score} height={6} />
                  </td>
                  <td>
                    {action.evidenceComplete}/{action.evidenceExpected}
                  </td>
                  <td>{action.pendingReview > 0 ? action.pendingReview : "-"}</td>
                  <td style={{ color: action.topDataGap ? "var(--color-danger)" : "var(--color-text-subtle)" }}>
                    {action.topDataGap ?? "-"}
                  </td>
                  <td>
                    <Link
                      href={`/cities/${cityId}/hiap/actions/${action.id}/political-details`}
                      className="link-muted"
                    >
                      Open ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
