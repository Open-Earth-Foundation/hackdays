#!/usr/bin/env python3
"""Municipality centroids (lat/lng by IBGE code) from kelvins/municipios-brasileiros.

Output: data/centroids.json  { "<ibge7>": [lat, lng], ... }
"""
import csv
import json
import sys
import urllib.request
from pathlib import Path

URL = "https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/csv/municipios.csv"
ROOT = Path(__file__).resolve().parent.parent

with urllib.request.urlopen(URL, timeout=30) as r:
    rows = list(csv.DictReader(r.read().decode("utf-8").splitlines()))

out = {row["codigo_ibge"]: [round(float(row["latitude"]), 4), round(float(row["longitude"]), 4)]
       for row in rows}
(ROOT / "data" / "centroids.json").write_text(json.dumps(out))
print(f"wrote {len(out)} centroids", file=sys.stderr)
