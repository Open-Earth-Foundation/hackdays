#!/usr/bin/env python3
"""Bake the derived CSVs + geojson into static JSON for the funder-scan app.

Run from apps/funder-scan/:  python3 scripts/build_data.py
Re-runnable; outputs land in public/data/.
"""
import ast, csv, json, re
from pathlib import Path
from collections import Counter, defaultdict
from shapely.geometry import shape, mapping

APP = Path(__file__).resolve().parents[1]
DATA = APP.parents[1] / "city–funder-matching" / "data"
DERIVED = DATA / "derived"
INPUT = DATA / "input"
GEOJSON = INPUT / "raw_data_cl_ocha_ab.geojson"
OUT = APP / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

def read_csv(name):
    with open(DERIVED / name, encoding="utf-8") as f:
        return list(csv.DictReader(f))

units    = read_csv("coordination_units.csv")
caps     = read_csv("comuna_capacity_scores.csv")
prior    = read_csv("comuna_action_priority.csv")
funders  = read_csv("valdivia_funders_open.csv")
matches  = read_csv("valdivia_action_matches.csv")
tiers    = read_csv("action_coordination.csv")
bundles  = read_csv("unit_bundle_candidates.csv")

def read_input_csv(name):
    with open(INPUT / name, encoding="utf-8") as f:
        return list(csv.DictReader(f))

def parse_sectors(raw):
    if not raw:
        return []
    try:
        return [s.lower() for s in ast.literal_eval(raw)]
    except (ValueError, SyntaxError):
        return []

def pop_band(pop):
    if pop is None:
        return "Medium (100k–1M)"
    if pop < 100_000:
        return "Small (<100k)"
    if pop < 1_000_000:
        return "Medium (100k–1M)"
    if pop < 5_000_000:
        return "Large (1M–5M)"
    return "Megacity (>5M)"

def fiscal_band(cofinance, anchor):
    score = max(cofinance or 0, anchor or 0)
    if score >= 40:
        return "A — Strong"
    if score >= 22:
        return "B — Moderate"
    return "C — Limited"

def capacity_band(prof_pct, staff_per_1k):
    prof = prof_pct or 0
    staff = staff_per_1k or 0
    if prof >= 45 or staff >= 12:
        return "High — Dedicated team"
    if prof >= 30 or staff >= 8:
        return "Medium — Some capacity"
    return "Low — Limited dedicated staff"

LOS_RIOS = "Región de Los Ríos"

def write_json(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False), encoding="utf-8")
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
write_json(OUT / "national.json", national)

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
write_json(OUT / "valdivia.json", valdivia)

# ---------- geometry: simplify + join, national + Los Ríos ----------
geo = json.loads(GEOJSON.read_text(encoding="utf-8"))

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

write_json(OUT / "comunas.geojson", {"type": "FeatureCollection", "features": nat_feats})
write_json(OUT / "losrios.geojson", {"type": "FeatureCollection", "features": lr_feats})

# ---------- matcher: comuna index ----------
prio_by_locode = {p["locode"]: p for p in prior if p.get("locode")}
sal_cols = {
    "stationary_energy": "sal_StationaryEnergy",
    "transportation": "sal_Transportation",
    "waste": "sal_Waste",
    "afolu": "sal_AFOLU",
    "ippu": "sal_IPPU",
}
comunas_index = []
for c in caps:
    loc = c.get("locode")
    if not loc:
        continue
    unit = by_locode.get(loc, {})
    p = prio_by_locode.get(loc, {})
    pop = int(float(c["population"])) if c.get("population") else None
    cof = fnum(c.get("cofinance_score"))
    anc = fnum(c.get("anchor_score"))
    salient = [k for k, col in sal_cols.items() if p.get(col) == "1"]
    comunas_index.append({
        "name": c["city_name"],
        "locode": loc,
        "region": c.get("region_name") or unit.get("region"),
        "population": pop,
        "populationBand": pop_band(pop),
        "fcmDependencyPct": fnum(c.get("fcm_dependency_pct")),
        "cofinanceScore": cof,
        "anchorScore": anc,
        "compositeScore": fnum(c.get("composite_score")),
        "professionalizationPct": fnum(c.get("professionalization_pct_2023")),
        "staffPer1000": fnum(c.get("staff_per_1000_2023")),
        "fiscalBand": fiscal_band(cof, anc),
        "capacityBand": capacity_band(
            fnum(c.get("professionalization_pct_2023")),
            fnum(c.get("staff_per_1000_2023")),
        ),
        "poolStatus": unit.get("pool_status"),
        "unitId": unit.get("unit_id"),
        "isAnchor": unit.get("is_anchor", False),
        "salientSectors": salient,
    })
comunas_index.sort(key=lambda x: (-(x["population"] or 0), x["name"]))
write_json(OUT / "chile-comunas.json", comunas_index)

chile_regions = sorted({c["region"] for c in comunas_index if c.get("region")})
write_json(OUT / "chile-regions.json", chile_regions)

# ---------- matcher: national fund catalog (municipality-applicable) ----------
fund_rows = read_input_csv("chile_funders_detail.csv")
chile_funds = []
seen = set()
for i, row in enumerate(fund_rows):
    actor = (row.get("eligible_actor") or "").lower()
    if "municipality" not in actor:
        continue
    key = row.get("program_name") or str(i)
    if key in seen:
        continue
    seen.add(key)
    sectors = parse_sectors(row.get("gpc_sectors"))
    inst = (row.get("instrument_type") or "grant").lower()
    chile_funds.append({
        "id": f"cl-{i}",
        "program": row.get("program_name", ""),
        "family": row.get("program_family", ""),
        "funder": row.get("funder_institution", ""),
        "instrumentType": inst,
        "eligibleActor": row.get("eligible_actor", ""),
        "gpcSectors": sectors,
        "status": row.get("status", ""),
        "recurrence": row.get("recurrence", ""),
        "amountClp": fnum(row.get("amount_clp")),
    })
write_json(OUT / "chile-funds.json", chile_funds)

# ---------- matcher: Valdivia pre-computed instruments ----------
prog_to_inst = {f["program"]: f["instrumentType"] for f in chile_funds}
prog_to_sectors = {f["program"]: f["gpcSectors"] for f in chile_funds}
applicant_matches = [m for m in matches if m["role"] == "applicant" and "match" in m["verdict"]]
by_program = defaultdict(list)
for m in applicant_matches:
    by_program[m["best_funder"]].append(m)
valdivia_instruments = []
for prog, rows in by_program.items():
    best = max(rows, key=lambda r: float(r["combined"]))
    sector = best["sector"]
    valdivia_instruments.append({
        "program": prog,
        "funder": best["best_funder_inst"],
        "sector": sector,
        "gpcSectors": prog_to_sectors.get(prog, [sector]),
        "score": round(float(best["combined"]) * 100),
        "actionCount": len(rows),
        "topAction": best["action"][:120],
        "instrumentType": prog_to_inst.get(prog, "grant"),
    })
valdivia_instruments.sort(key=lambda x: (-x["score"], -x["actionCount"]))
write_json(OUT / "valdivia-instruments.json", valdivia_instruments[:12])

# ---------- report ----------
print("WROTE public/data/:")
for fn in [
    "national.json", "valdivia.json", "comunas.geojson", "losrios.geojson",
    "chile-comunas.json", "chile-funds.json", "valdivia-instruments.json", "chile-regions.json",
]:
    print(f"  {fn:18} {(OUT/fn).stat().st_size/1024:7.1f} KB")
print("\nKPIs:", national["kpis"])
print("bundle_table:", bundle_table)
print("Valdivia funders:", valdivia["funders_count"], "| actions:", valdivia["actions"])
print("transport:", valdivia["transport"]["n_actions"], "actions, best af", valdivia["transport"]["best_af"])
print("pool rows:", [(r["comuna"], r["cofinance_score"]) for r in pool_rows])
print("national feats:", len(nat_feats), "| los rios feats:", len(lr_feats))
print("matcher:", len(comunas_index), "comunas |", len(chile_funds), "funds |",
      len(valdivia_instruments), "valdivia instruments |", len(chile_regions), "regions")
