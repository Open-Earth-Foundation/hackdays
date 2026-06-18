#!/usr/bin/env python3
"""Extract real RCL + Dívida Consolidada per municipality from the CAPAG XLSX Datalake sheet.

These are the exact RGF anexo-02 absolutes CAPAG's debt indicator uses, so credit headroom
((1.2 x RCL) - DC under the LRF municipal ceiling) is a real, defensible R$ figure — not modeled.

Output: data/fiscal.json  { "<ibge7>": {"rcl": <BRL>, "dc": <BRL>, "year": 2024|2023} }
Usage: python3 scripts/fetch_fiscal.py [--xlsx /path/to/local.xlsx]
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path

import pandas as pd

CKAN_PACKAGE = "https://www.tesourotransparente.gov.br/ckan/api/3/action/package_show?id=capag-municipios"
ROOT = Path(__file__).resolve().parent.parent

RCL = {y: f"{y}RGF2ReceitaCorrenteLiquidaÚltimo PeríodoRECEITA CORRENTE LÍQUIDA - RCL (IV)" for y in (2024, 2023)}
DC = {y: f"{y}DividaConsolidadaÚltimo PeríodoDÍVIDA CONSOLIDADA - DC (I)" for y in (2024, 2023)}


def latest_xlsx_url() -> str:
    with urllib.request.urlopen(CKAN_PACKAGE, timeout=30) as r:
        pkg = json.load(r)
    xlsx = [res for res in pkg["result"]["resources"] if res["format"].upper() == "XLSX"]
    return xlsx[-1]["url"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", help="use a local XLSX instead of downloading")
    args = ap.parse_args()

    path = Path(args.xlsx) if args.xlsx else ROOT / "data" / "capag-latest.xlsx"
    if not path.exists():
        path.parent.mkdir(exist_ok=True)
        print("downloading latest CAPAG XLSX…", file=sys.stderr)
        urllib.request.urlretrieve(latest_xlsx_url(), path)

    df = pd.read_excel(path, sheet_name="Datalake")
    out = {}
    for _, r in df.iterrows():
        ente = r.get("ID_ENTE")
        if pd.isna(ente):
            continue
        ibge = str(int(ente))
        for y in (2024, 2023):
            rcl, dc = r.get(RCL[y]), r.get(DC[y])
            if pd.notna(rcl) and rcl and pd.notna(dc):
                out[ibge] = {"rcl": round(float(rcl)), "dc": round(float(dc)), "year": y}
                break

    (ROOT / "data" / "fiscal.json").write_text(
        json.dumps({"source": "Tesouro CAPAG Datalake — RGF anexo 02 (RCL, DC), BRL", "count": len(out), "cities": out},
                   ensure_ascii=False))
    print(f"wrote {len(out)} cities with RCL+DC", file=sys.stderr)


if __name__ == "__main__":
    main()
