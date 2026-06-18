#!/usr/bin/env python3
"""Snapshot CCRA risk scores for every crosswalked municipality.

For each city: GET /api/v0/ccra/risk_assessment/city/{locode}/current and keep,
per hazard, the max normalised_risk_score across key impacts.

Incremental: appends to data/risks.jsonl (resumable), then compacts to data/risks.json.
Usage: python3 scripts/fetch_risks.py [--workers 8]
"""
import argparse
import json
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

API = "https://api.citycatalyst.io"
ROOT = Path(__file__).resolve().parent.parent
JSONL = ROOT / "data" / "risks.jsonl"
OUT = ROOT / "data" / "risks.json"


def fetch_city(locode: str):
    url = f"{API}/api/v0/ccra/risk_assessment/city/{urllib.parse.quote(locode)}/current"
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                rows = json.load(r)
            hazards = {}
            if isinstance(rows, list):
                for row in rows:
                    h = row.get("hazard")
                    s = row.get("normalised_risk_score")
                    if h and s is not None and s > hazards.get(h, -1):
                        hazards[h] = round(s, 4)
            return {"locode": locode, "hazards": hazards}
        except Exception as e:
            if attempt == 2:
                return {"locode": locode, "hazards": None, "error": str(e)[:120]}
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    xwalk = json.loads((ROOT / "data" / "crosswalk.json").read_text())
    locodes = [r["locode"] for r in xwalk["records"]]

    done = set()
    if JSONL.exists():
        for line in JSONL.read_text().splitlines():
            try:
                done.add(json.loads(line)["locode"])
            except Exception:
                pass
    todo = [l for l in locodes if l not in done]
    print(f"{len(done)} cached, {len(todo)} to fetch", file=sys.stderr)

    with JSONL.open("a") as f, ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = [ex.submit(fetch_city, l) for l in todo]
        for i, fut in enumerate(as_completed(futures), 1):
            res = fut.result()
            if res:
                f.write(json.dumps(res, ensure_ascii=False) + "\n")
                f.flush()
            if i % 200 == 0:
                print(f"{i}/{len(todo)}", file=sys.stderr)

    # compact: locode -> hazards map (skip errors)
    cities = {}
    errors = 0
    for line in JSONL.read_text().splitlines():
        try:
            rec = json.loads(line)
        except Exception:
            continue
        if rec.get("hazards") is None:
            errors += 1
            continue
        cities[rec["locode"]] = rec["hazards"]
    OUT.write_text(json.dumps(
        {"source": "CityCatalyst CCRA, scenario=current", "count": len(cities),
         "errors": errors, "cities": cities}, ensure_ascii=False))
    print(f"wrote {OUT}: {len(cities)} cities, {errors} errors", file=sys.stderr)


if __name__ == "__main__":
    main()
