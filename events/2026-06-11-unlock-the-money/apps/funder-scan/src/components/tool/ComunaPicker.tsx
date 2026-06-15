"use client";

import { useEffect, useMemo, useState } from "react";
import { loadChileComunas } from "@/lib/tool/chile-data";
import type { ChileComuna } from "@/lib/tool/types";

interface ComunaPickerProps {
  locode: string;
  comuna: string;
  onSelect: (c: ChileComuna) => void;
}

export function ComunaPicker({ locode, comuna, onSelect }: ComunaPickerProps) {
  const [all, setAll] = useState<ChileComuna[]>([]);
  const [query, setQuery] = useState(comuna || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadChileComunas().then(setAll).catch(() => {});
  }, []);

  useEffect(() => {
    setQuery(comuna || "");
  }, [comuna]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 12);
    return all
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.locode.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [all, query]);

  const selected = all.find((c) => c.locode === locode);

  return (
    <div className="comuna-picker">
      <label className="wizard-field-label">Chile comuna</label>
      <div className="comuna-picker-input-wrap">
        <i className="ti ti-search comuna-picker-icon" />
        <input
          type="text"
          className="comuna-picker-input"
          placeholder="Search 314 comunas…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </div>
      {selected && (
        <p className="comuna-picker-meta">
          {selected.region}
          {selected.population != null ? ` · ${selected.population.toLocaleString()} residents` : ""}
          {selected.poolStatus ? ` · ${selected.poolStatus}` : ""}
        </p>
      )}
      {open && filtered.length > 0 && (
        <ul className="comuna-picker-list" role="listbox">
          {filtered.map((c) => (
            <li key={c.locode}>
              <button
                type="button"
                className={`comuna-picker-opt${c.locode === locode ? " sel" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(c);
                  setQuery(c.name);
                  setOpen(false);
                }}
              >
                <span className="comuna-picker-name">{c.name}</span>
                <span className="comuna-picker-region">{c.region}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
