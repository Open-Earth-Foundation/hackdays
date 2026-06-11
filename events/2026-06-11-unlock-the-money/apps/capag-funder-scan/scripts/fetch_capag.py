#!/usr/bin/env python3
"""Fetch the latest CAPAG municipios XLSX from Tesouro Transparente and emit clean JSON.

Output: data/capag.json — one record per municipality, keyed by IBGE code.
Usage: python3 scripts/fetch_capag.py [--xlsx /path/to/local.xlsx]
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path

import pandas as pd

CKAN_PACKAGE = "https://www.tesourotransparente.gov.br/ckan/api/3/action/package_show?id=capag-municipios"
SHEET = "Prévia da CAPAG"
COLUMNS = [
    "cod_ibge", "municipio", "uf", "capag",
    "ind1_endividamento", "nota1", "ind2_poupanca", "nota2", "ind3_liquidez", "nota3",
    "icf", "observacao", "origem_nota", "possui_dca_2024", "ind3_antigo", "possui_dca_2023",
    "capag_rebaixada", "deducao_negativa", "dcb_zerada_negativa", "of_negativa",
    "publicou_rgf", "publicou_rreo",
]

ROOT = Path(__file__).resolve().parent.parent


def latest_xlsx_url() -> str:
    with urllib.request.urlopen(CKAN_PACKAGE, timeout=30) as r:
        pkg = json.load(r)
    xlsx = [res for res in pkg["result"]["resources"] if res["format"].upper() == "XLSX"]
    # resource names embed dates; the list is append-ordered — take the last one
    latest = xlsx[-1]
    print(f"latest resource: {latest['name']}", file=sys.stderr)
    return latest["url"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", help="use a local XLSX instead of downloading")
    args = ap.parse_args()

    if args.xlsx:
        path = Path(args.xlsx)
    else:
        path = ROOT / "data" / "capag-latest.xlsx"
        path.parent.mkdir(exist_ok=True)
        url = latest_xlsx_url()
        print(f"downloading {url}", file=sys.stderr)
        urllib.request.urlretrieve(url, path)

    df = pd.read_excel(path, sheet_name=SHEET, header=None, skiprows=2)
    df = df.iloc[:, : len(COLUMNS)]
    df.columns = COLUMNS
    df = df[pd.to_numeric(df["cod_ibge"], errors="coerce").notna()].copy()
    df["cod_ibge"] = df["cod_ibge"].astype(int).astype(str)

    records = json.loads(df.to_json(orient="records", force_ascii=False))
    out = ROOT / "data" / "capag.json"
    out.write_text(json.dumps(
        {"source": "Tesouro Transparente — capag-municipios (ODbL)",
         "sheet": SHEET, "count": len(records), "records": records},
        ensure_ascii=False))
    print(f"wrote {out} ({len(records)} municipalities)", file=sys.stderr)

    dist = df["capag"].value_counts(dropna=False)
    print("\nCAPAG distribution:", file=sys.stderr)
    print(dist.to_string(), file=sys.stderr)


if __name__ == "__main__":
    main()
