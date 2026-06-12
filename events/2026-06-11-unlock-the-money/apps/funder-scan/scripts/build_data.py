#!/usr/bin/env python3
"""Bake the derived CSVs + geojson into static JSON for the funder-scan app.

Run from apps/funder-scan/:  python3 scripts/build_data.py
Re-runnable; outputs land in public/data/.
"""
import csv, json, re
from pathlib import Path
from collections import Counter, defaultdict
from shapely.geometry import shape, mapping

APP = Path(__file__).resolve().parents[1]
DATA = APP.parents[1] / "city–funder-matching" / "data"
DERIVED = DATA / "derived"
GEOJSON = DATA / "input" / "raw_data_cl_ocha_ab.geojson"
OUT = APP / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

def read_csv(name):
    with open(DERIVED / name, encoding="utf-8") as f:
        return list(csv.DictReader(f))

units    = read_csv("coordination_units.csv")
caps     = read_csv("comuna_capacity_scores.csv")
funders  = read_csv("valdivia_funders_open.csv")
matches  = read_csv("valdivia_action_matches.csv")
tiers    = read_csv("action_coordination.csv")
bundles  = read_csv("unit_bundle_candidates.csv")

LOS_RIOS = "Región de Los Ríos"
fnum = lambda v: float(v) if v not in (None, "", "n/a") else None

# ---------- per-comuna pool status (drives the national choropleth) ----------
def pool_status(u):
    if u["is_anchor"] == "True":
        return "anchor"
    if u["unit_viable_anchor"] == "True":
        return "in viable pool"
    return "needs TA"

by_locode = {}
for u in units:
    if not u["locode"]:
        continue
    by_locode[u["locode"]] = {
        "locode": u["locode"], "comuna": u["comuna"], "region": u["region"],
        "unit_id": u["unit_id"], "unit_anchor": u["unit_anchor"],
        "unit_size": int(u["unit_size"]), "is_anchor": u["is_anchor"] == "True",
        "viable": u["unit_viable_anchor"] == "True",
        "cofinance_score": fnum(u["cofinance_score"]),
        "anchor_score": fnum(u["anchor_score"]),
        "pool_status": pool_status(u),
    }

# ---------- unit roll-up ----------
members = defaultdict(list)
for u in units:
    if u["region"]:
        members[u["unit_id"]].append(u)

feasible = [b for b in bundles if b["bundle_feasible"] == "True"]
units_with_feasible = {b["unit_id"] for b in feasible}
multi_units = {uid for uid, ms in members.items() if len(ms) > 1}

# bundle table by sector x tier
sectors = ["Stationary Energy", "Transportation", "Waste"]
tier_keys = ["highly_coordinated", "semi_coordinated"]
bundle_table = []
for s in sectors:
    row = {"sector": s}
    for t in tier_keys:
        row[t] = sum(1 for b in feasible if b["sector"] == s and b["coordination_tier"] == t)
    bundle_table.append(row)

n_units = len({u["unit_id"] for u in units})
n_viable = len({u["unit_id"] for u in units if u["unit_viable_anchor"] == "True"})
n_anchors = sum(1 for u in units if u["is_anchor"] == "True" and u["unit_viable_anchor"] == "True")
n_passenger = sum(1 for u in units if u["is_anchor"] != "True" and u["unit_viable_anchor"] == "True")
n_stranded = sum(1 for u in units if u["unit_viable_anchor"] != "True")

# largest energy-capex pools
energy_caps = sorted(
    [b for b in feasible if b["sector"] == "Stationary Energy" and b["coordination_tier"] == "highly_coordinated"],
    key=lambda b: int(b["unit_size"]), reverse=True,
)
flagship = [{"anchor": b["unit_anchor"], "region": b["region"], "size": int(b["unit_size"])}
            for b in energy_caps[:6]]

national = {
    "kpis": {
        "units": n_units, "viable_anchors": n_viable,
        "feasible_bundles": len(feasible),
        "units_with_feasible": len(units_with_feasible), "multi_units": len(multi_units),
        "anchors": n_anchors, "passengers": n_passenger, "stranded": n_stranded,
    },
    "bundle_table": bundle_table,
    "flagship": flagship,
    "comunas": list(by_locode.values()),
}
(OUT / "national.json").write_text(json.dumps(national, ensure_ascii=False))

# ---------- Valdivia (beats 3-5) ----------
role_order = ["applicant", "facilitator", "referrer"]
funders_by_role = {r: [{"program": f["program"], "funder": f["funder"], "actor": f["eligible_actor"]}
                       for f in funders if f["role"] == r] for r in role_order}

def ref_funder(v):
    hit = re.search(r"\(([^)]+)\)", v)
    return (hit.group(1) if hit else v).rstrip(")")

clean = [m for m in matches if m["verdict"] == "match"]
blocked = [m for m in matches if "referrer route" in m["verdict"]]
transport = [m for m in matches if m["sector"] == "transportation"]
transport.sort(key=lambda m: float(m["af"]), reverse=True)

# unit-11 pool table joined to capacity
cap_by_name = {c["city_name"]: c for c in caps}
u11 = [u for u in units if u["unit_id"] == "11"]
u11.sort(key=lambda u: (fnum(u["cofinance_score"]) or -1), reverse=True)
pool_rows = []
for u in u11:
    c = cap_by_name.get(u["comuna"], {})
    pool_rows.append({
        "comuna": u["comuna"],
        "population": int(float(c["population"])) if c.get("population") else None,
        "fcm_dependency_pct": fnum(c.get("fcm_dependency_pct")),
        "cofinance_score": fnum(u["cofinance_score"]),
        "is_anchor": u["is_anchor"] == "True",
    })

valdivia = {
    "profile": {
        "name": "Valdivia", "region": "Los Ríos",
        "population": int(float(cap_by_name["Valdivia"]["population"])),
        "fcm_dependency_pct": fnum(cap_by_name["Valdivia"]["fcm_dependency_pct"]),
        "unit_id": "11",
    },
    "funders_count": {r: len(funders_by_role[r]) for r in role_order},
    "funders_by_role": funders_by_role,
    "actions": {"total": len(matches), "match": len(clean), "referrer": len(blocked)},
    "blocked_by": dict(Counter(ref_funder(m["verdict"]) for m in blocked)),
    "transport": {
        "n_actions": len(transport),
        "best_af": float(transport[0]["af"]),
        "best_funder": transport[0]["best_funder"],
        "best_inst": transport[0]["best_funder_inst"],
        "actions": [{"action": m["action"], "af": float(m["af"])} for m in transport],
    },
    "pool": pool_rows,
}
(OUT / "valdivia.json").write_text(json.dumps(valdivia, ensure_ascii=False))

# ---------- geometry: simplify + join, national + Los Ríos ----------
geo = json.loads(GEOJSON.read_text())

def round_geom(obj, nd=4):
    if isinstance(obj, (list, tuple)):
        if obj and isinstance(obj[0], (int, float)):
            return [round(obj[0], nd), round(obj[1], nd)]
        return [round_geom(x, nd) for x in obj]
    return obj

nat_feats, lr_feats = [], []
for f in geo["features"]:
    p = f["properties"]
    loc = p["locode"]
    attrs = by_locode.get(loc, {})
    simp = shape(f["geometry"]).simplify(0.01, preserve_topology=True)
    if simp.is_empty:
        continue
    gj = mapping(simp)
    gj["coordinates"] = round_geom(gj["coordinates"])
    feat = {
        "type": "Feature",
        "geometry": gj,
        "properties": {
            "comuna": p["comuna_name"], "locode": loc, "region": p["region_name"],
            "pool_status": attrs.get("pool_status", "not scored"),
            "unit_anchor": attrs.get("unit_anchor"),
            "cofinance_score": attrs.get("cofinance_score"),
            "is_anchor": attrs.get("is_anchor", False),
        },
    }
    nat_feats.append(feat)
    if p["region_name"] == LOS_RIOS:
        lr = json.loads(json.dumps(feat))
        in_pool = attrs.get("unit_id") == "11"
        lr["properties"]["pool_role"] = (
            "anchor" if attrs.get("is_anchor") and in_pool
            else "pool member" if in_pool else "other"
        )
        lr_feats.append(lr)

(OUT / "comunas.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": nat_feats}, ensure_ascii=False))
(OUT / "losrios.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": lr_feats}, ensure_ascii=False))

# ---------- report ----------
print("WROTE public/data/:")
for fn in ["national.json", "valdivia.json", "comunas.geojson", "losrios.geojson"]:
    print(f"  {fn:18} {(OUT/fn).stat().st_size/1024:7.1f} KB")
print("\nKPIs:", national["kpis"])
print("bundle_table:", bundle_table)
print("Valdivia funders:", valdivia["funders_count"], "| actions:", valdivia["actions"])
print("transport:", valdivia["transport"]["n_actions"], "actions, best af", valdivia["transport"]["best_af"])
print("pool rows:", [(r["comuna"], r["cofinance_score"]) for r in pool_rows])
print("national feats:", len(nat_feats), "| los rios feats:", len(lr_feats))
