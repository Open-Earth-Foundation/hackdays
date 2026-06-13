// Proxy to the green-LLM sidecar (llm-service). If the sidecar is unreachable,
// fall back to a deterministic templated localization so the demo never breaks.
// Adding this route handler is the one thing that makes the app need a Node
// server (next start) rather than a pure static export.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  action: { name: string; description: string; type: "mitigation" | "adaptation" };
  cityContext: { name: string; country: string; topHazards: string[]; topSectors: string[] };
  language: "en" | "es" | "pt";
};

const SERVICE_URL = process.env.LLM_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  // Try the sidecar first (real or mock-mode EcoLogits measurement).
  try {
    const res = await fetch(`${SERVICE_URL}/localize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {
    // fall through to local fallback
  }

  return NextResponse.json(fallbackLocalize(body));
}

// Deterministic templated localization — mirrors the sidecar's mock mode so the
// click-through and CO₂ counter work even with the sidecar down.
function fallbackLocalize(body: Body) {
  const { action, cityContext, language } = body;
  const city = cityContext.name;
  const rawFocus =
    action.type === "adaptation"
      ? cityContext.topHazards[0] ?? "climate risk"
      : cityContext.topSectors[0] ?? "emissions";
  const focus = translateFocus(rawFocus, language);

  const steps = templates(language, city, focus, action.name);
  // A modest estimate (no live call): ~0.3 g CO₂e for a small open model call.
  return {
    localizedSteps: steps,
    energyWh: 0.8,
    gCO2e: 0.3,
    model: "templated-fallback",
    provider: "fallback",
    mock: true,
  };
}

// Localize the matched hazard/sector term so templated steps read naturally.
function translateFocus(raw: string, lang: "en" | "es" | "pt"): string {
  if (lang === "en") return raw.toLowerCase();
  const s = raw.toLowerCase();
  const map: Record<string, [string, string]> = {
    // [es, pt]
    heat: ["las olas de calor", "as ondas de calor"],
    landslide: ["los deslizamientos", "os deslizamentos"],
    flood: ["las inundaciones", "as inundações"],
    drought: ["la sequía", "a seca"],
    disease: ["las enfermedades", "as doenças"],
    "sea-level": ["el aumento del nivel del mar", "a elevação do nível do mar"],
    storm: ["las tormentas", "as tempestades"],
    wildfire: ["los incendios", "os incêndios"],
    transport: ["el transporte", "o transporte"],
    energy: ["la energía", "a energia"],
    waste: ["los residuos", "os resíduos"],
    stationary: ["la energía", "a energia"],
  };
  for (const key of Object.keys(map)) {
    if (s.includes(key)) return lang === "es" ? map[key][0] : map[key][1];
  }
  return s;
}

function templates(lang: "en" | "es" | "pt", city: string, focus: string, action: string): string[] {
  if (lang === "es") {
    return [
      `Identifica en ${city} a un grupo vecinal o colectivo que ya trabaje en ${focus}.`,
      `Asiste a la próxima sesión del consejo municipal donde se discuta "${action}".`,
      `Presenta esta acción como propuesta o comentario público, citando el riesgo local.`,
      `Invita a tres vecinos a sumarse y comparte el avance en tu comunidad.`,
    ];
  }
  if (lang === "pt") {
    return [
      `Identifique em ${city} um grupo de bairro ou coletivo que já atue em ${focus}.`,
      `Participe da próxima sessão do conselho municipal onde "${action}" for discutida.`,
      `Apresente esta ação como proposta ou comentário público, citando o risco local.`,
      `Convide três vizinhos para participar e compartilhe o progresso na sua comunidade.`,
    ];
  }
  return [
    `Find a neighborhood group or collective in ${city} already working on ${focus}.`,
    `Attend the next city-council session where "${action}" is on the agenda.`,
    `Submit this action as a proposal or public comment, citing the local risk.`,
    `Invite three neighbors to join and share progress in your community.`,
  ];
}
