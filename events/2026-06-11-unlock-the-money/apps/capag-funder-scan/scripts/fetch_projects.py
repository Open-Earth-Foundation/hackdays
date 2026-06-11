#!/usr/bin/env python3
"""Funded LatAm climate projects → data/projects.json.

Source: OEF-curated Google Sheet (public CSV export). One record per project with the
categorical fields used for rule-based matching plus display fields.
Usage: python3 scripts/fetch_projects.py
"""
import csv
import json
import sys
import urllib.request
from pathlib import Path

SHEET_ID = "184Y2MD4meI62qzluCbGyFbmlU1N9e2lkAJB0CHmTsUU"
GID = "242723785"
URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"
ROOT = Path(__file__).resolve().parent.parent


def split(s):
    return [p.strip() for p in (s or "").split(";") if p.strip()]


def parse_coords(s):
    try:
        lat, lon = [float(x) for x in (s or "").split(",")]
        return [lat, lon]
    except Exception:
        return None


def main():
    with urllib.request.urlopen(URL, timeout=30) as r:
        rows = list(csv.DictReader(r.read().decode("utf-8").splitlines()))

    out = []
    for i, r in enumerate(rows):
        title = (r.get("Project Title") or "").strip()
        if not title:
            continue
        amount = (r.get("Amount USD (integer)") or "").strip()
        out.append({
            "id": i,
            "city": (r.get("City") or "").strip(),
            "state": (r.get("State") or "").strip(),
            "country": (r.get("Country") or "").strip(),
            "title": title,
            "typeOfAction": (r.get("Type of Action") or "").strip(),
            "sectors": split(r.get("Sector (Categorical)")),
            "instrument": (r.get("Instrument type (categorical)") or "").strip(),
            "amountUsd": int(amount) if amount.isdigit() else None,
            "funders": split(r.get("Funder (categorical)")),
            "status": (r.get("Status (categorical)") or "").strip(),
            "summary": (r.get("Summary") or "").strip(),
            "source": (r.get("Source Link") or "").strip(),
            "coords": parse_coords(r.get("Coordinates")),
        })

    (ROOT / "data" / "projects.json").write_text(
        json.dumps({"source": "OEF curated — funded LatAm climate projects",
                    "count": len(out), "projects": out}, ensure_ascii=False))
    print(f"wrote {len(out)} projects", file=sys.stderr)


if __name__ == "__main__":
    main()
