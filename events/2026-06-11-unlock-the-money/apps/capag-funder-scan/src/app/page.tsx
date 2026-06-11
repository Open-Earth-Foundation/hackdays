import fs from "node:fs";
import path from "node:path";
import Explorer, { type Row } from "../components/Explorer";

export const dynamic = "force-static";

export default function Home() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "crosswalk.json"), "utf-8")
  );
  let risks: Record<string, Record<string, number>> = {};
  const risksPath = path.join(process.cwd(), "data", "risks.json");
  if (fs.existsSync(risksPath)) {
    risks = JSON.parse(fs.readFileSync(risksPath, "utf-8")).cities;
  }
  const rows: Row[] = raw.records.map((r: Record<string, unknown>) => ({
    risks: risks[String(r.locode)] ?? null,
    ibge: String(r.cod_ibge),
    name: String(r.municipio),
    uf: String(r.uf),
    capag: r.capag == null ? "n.d." : String(r.capag),
    debt: r.nota1 == null ? "—" : String(r.nota1),
    savings: r.nota2 == null ? "—" : String(r.nota2),
    liquidity: r.nota3 == null ? "—" : String(r.nota3),
    icf: r.icf == null ? "—" : String(r.icf),
    locode: String(r.locode),
  }));
  return <Explorer rows={rows} />;
}
