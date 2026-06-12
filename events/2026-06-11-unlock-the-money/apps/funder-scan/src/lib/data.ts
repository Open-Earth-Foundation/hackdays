import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function load<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T;
}

export interface National {
  kpis: {
    units: number; viable_anchors: number; feasible_bundles: number;
    units_with_feasible: number; multi_units: number;
    anchors: number; passengers: number; stranded: number;
  };
  bundle_table: { sector: string; highly_coordinated: number; semi_coordinated: number }[];
  flagship: { anchor: string; region: string; size: number }[];
  comunas: unknown[];
}

export interface Valdivia {
  profile: { name: string; region: string; population: number; fcm_dependency_pct: number; unit_id: string };
  funders_count: { applicant: number; facilitator: number; referrer: number };
  funders_by_role: Record<"applicant" | "facilitator" | "referrer", { program: string; funder: string; actor: string }[]>;
  actions: { total: number; match: number; referrer: number };
  blocked_by: Record<string, number>;
  transport: {
    n_actions: number; best_af: number; best_funder: string; best_inst: string;
    actions: { action: string; af: number }[];
  };
  pool: { comuna: string; population: number | null; fcm_dependency_pct: number | null; cofinance_score: number | null; is_anchor: boolean }[];
}

export const getNational = () => load<National>("national.json");
export const getValdivia = () => load<Valdivia>("valdivia.json");
