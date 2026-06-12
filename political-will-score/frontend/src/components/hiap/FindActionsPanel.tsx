"use client";

export function FindActionsPanel() {
  return (
    <div className="card" style={{ marginBottom: 20, padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 600 }}>Selected action plan</h2>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Source-backed actions with political will checks
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-secondary btn-sm">
            🔍 Find actions
          </button>
          <button type="button" className="btn btn-secondary btn-sm">
            Import actions ▾
          </button>
          <button type="button" className="btn btn-primary btn-sm">
            + Add action
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr auto",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div className="form-field">
          <label className="form-label" htmlFor="city">
            City
          </label>
          <select id="city" className="form-select" defaultValue="warsaw">
            <option value="warsaw">Warsaw</option>
            <option value="krakow">Krakow</option>
            <option value="gdansk">Gdansk</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="source-type">
            Source type
          </label>
          <select id="source-type" className="form-select" defaultValue="bip">
            <option value="bip">City / BIP / procurement</option>
            <option value="contract">Contract register</option>
            <option value="budget">Budget page</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="source-url">
            Source URL
          </label>
          <input
            id="source-url"
            className="form-input"
            defaultValue="https://bip.warszawa.pl/"
            placeholder="Paste official source URL"
          />
        </div>
        <button type="button" className="btn btn-primary">
          Search source
        </button>
      </div>
    </div>
  );
}
