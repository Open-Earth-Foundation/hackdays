import fs from "node:fs";
import path from "node:path";
import Explorer, { type Row } from "../components/Explorer";
import type { Project } from "../lib/matchProjects";
import { computeLeverage } from "../lib/leverage";
import { headroom, unlock } from "../lib/headroom";

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
  const centroids: Record<string, [number, number]> = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "centroids.json"), "utf-8")
  );
  let fiscal: Record<string, { rcl: number; dc: number; year: number }> = {};
  const fiscalPath = path.join(process.cwd(), "data", "fiscal.json");
  if (fs.existsSync(fiscalPath)) {
    fiscal = JSON.parse(fs.readFileSync(fiscalPath, "utf-8")).cities;
  }
  const rows: Row[] = raw.records.map((r: Record<string, unknown>) => {
    const capag = r.capag == null ? "n.d." : String(r.capag);
    const debt = r.nota1 == null ? "—" : String(r.nota1);
    const savings = r.nota2 == null ? "—" : String(r.nota2);
    const liquidity = r.nota3 == null ? "—" : String(r.nota3);
    const icf = r.icf == null ? "—" : String(r.icf);
    const leverage = computeLeverage({
      capag, debt, savings, liquidity, icf,
      dcaMissing: r.possui_dca_2024 === "Não",
      rgfMissing: r.publicou_rgf === "Não",
      rreoMissing: r.publicou_rreo === "Não",
      dedNeg: !!r.deducao_negativa,
      dcbNeg: !!r.dcb_zerada_negativa,
      ofNeg: !!r.of_negativa,
    });
    const fin = fiscal[String(r.cod_ibge)];
    const rcl = fin?.rcl ?? null;
    const headroomBrl = headroom(rcl, fin?.dc ?? null);
    const unlockBrl = unlock(capag, leverage, headroomBrl);
    return {
      risks: risks[String(r.locode)] ?? null,
      lat: centroids[String(r.cod_ibge)]?.[0] ?? null,
      lng: centroids[String(r.cod_ibge)]?.[1] ?? null,
      ibge: String(r.cod_ibge),
      name: String(r.municipio),
      uf: String(r.uf),
      capag,
      debt,
      savings,
      liquidity,
      icf,
      locode: String(r.locode),
      leverage,
      rcl,
      headroomBrl,
      unlockBrl,
    };
  });
  const projects: Project[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "projects.json"), "utf-8")
  ).projects;
  return <Explorer rows={rows} projects={projects} />;
}
