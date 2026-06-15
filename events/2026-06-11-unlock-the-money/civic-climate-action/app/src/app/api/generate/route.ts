// Proxy to the green-LLM sidecar (llm-service) /generate. If the sidecar is
// unreachable, fall back to deterministic templated Markdown so the demo never
// breaks. Adding this route handler means the app runs via `next start` (a Node
// server) rather than a pure static export.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Lang = "en" | "es" | "pt";

type Body = {
  task: string;
  action: { name: string; description: string; type: "mitigation" | "adaptation" };
  cityContext: {
    name: string;
    country: string;
    topHazards: string[];
    topSectors: string[];
    localSources: string[];
    facts: string[];
  };
  language: Lang;
  prior?: string;
  instruction?: string;
};

const SERVICE_URL = process.env.LLM_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${SERVICE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch {
    // fall through
  }

  return NextResponse.json({
    content: fallbackContent(body),
    energyWh: 0.32,
    gCO2e: 0.016,
    model: "templated-fallback",
    provider: "fallback",
    mock: true,
  });
}

function fallbackContent(b: Body): string {
  const c = b.cityContext;
  const a = b.action.name;
  const channel = c.localSources?.[0] ?? "your city council";
  const lang = b.language;
  const T = (en: string, es: string, pt: string) => (lang === "es" ? es : lang === "pt" ? pt : en);

  if (b.task === "future_vision") {
    return T(
      `## Where today's trends point\nOn its current path, ${c.name} faces growing climate pressure. Without sustained action, those pressures compound.\n\n## A plausible future history (to ~2050)\nLooking back from 2050, "${a.toLowerCase()}" started small — pushed by residents through ${channel} — then scaled as results showed and held.\n\n## Two futures, side by side\n- **If little changes (probable):** the same risks, unevenly felt.\n- **If this action takes hold (preferable):** a more resilient, livable city, with gains in health and cost of living.\n\n_What it asks of us now: a modest, shared effort today for a city future generations inherit._`,
      `## Hacia dónde apuntan las tendencias\nEn su trayectoria actual, ${c.name} enfrenta una presión climática creciente. Sin acción sostenida, esas presiones se acumulan.\n\n## Una historia futura plausible (hacia ~2050)\nMirando atrás desde 2050, "${a.toLowerCase()}" empezó pequeño — impulsado por vecinos a través de ${channel} — y luego escaló al mostrar resultados.\n\n## Dos futuros, lado a lado\n- **Si poco cambia (probable):** los mismos riesgos, de forma desigual.\n- **Si esta acción se afianza (preferible):** una ciudad más resiliente y habitable, con mejoras en salud y costo de vida.\n\n_Lo que nos pide ahora: un esfuerzo compartido hoy por una ciudad que heredarán las próximas generaciones._`,
      `## Para onde apontam as tendências\nNo caminho atual, ${c.name} enfrenta pressão climática crescente. Sem ação sustentada, essas pressões se acumulam.\n\n## Uma história futura plausível (até ~2050)\nOlhando de 2050 para trás, "${a.toLowerCase()}" começou pequeno — levado por moradores pelo ${channel} — e depois escalou ao mostrar resultados.\n\n## Dois futuros, lado a lado\n- **Se pouco muda (provável):** os mesmos riscos, de forma desigual.\n- **Se esta ação se firma (preferível):** uma cidade mais resiliente e habitável, com ganhos em saúde e custo de vida.\n\n_O que isso nos pede agora: um esforço compartilhado hoje por uma cidade que as próximas gerações herdarão._`
    );
  }
  if (b.task === "draft_proposal") {
    return T(
      `# Proposal: ${a} in ${c.name}\n\nTo: ${channel}  \nRe: ${a}\n\n## Why this matters here\nThis action responds directly to our city's top climate concerns.\n\n## What we ask\n- Pilot **${a.toLowerCase()}** in our neighborhood\n\n## Expected benefits\n- A safer, healthier, more comfortable neighborhood\n\n## A note on getting started\nBegin with a small, low-cost pilot on one block.\n\n## How to submit this\nSubmit through **${channel}**.\n\nSincerely, [Your name], [Neighborhood], [Date]`,
      `# Propuesta: ${a} en ${c.name}\n\nA: ${channel}  \nAsunto: ${a}\n\n## Por qué importa aquí\nEsta acción responde directamente a las principales preocupaciones climáticas de la ciudad.\n\n## Lo que pedimos\n- Probar **${a.toLowerCase()}** en nuestro barrio\n\n## Beneficios esperados\n- Un barrio más seguro, sano y cómodo\n\n## Cómo empezar\nComenzar con un piloto pequeño y de bajo costo en una cuadra.\n\n## Cómo presentarlo\nPresentar a través de **${channel}**.\n\nAtentamente, [Tu nombre], [Barrio], [Fecha]`,
      `# Proposta: ${a} em ${c.name}\n\nPara: ${channel}  \nAssunto: ${a}\n\n## Por que isto importa aqui\nEsta ação responde diretamente às principais preocupações climáticas da cidade.\n\n## O que pedimos\n- Testar **${a.toLowerCase()}** no nosso bairro\n\n## Benefícios esperados\n- Um bairro mais seguro, saudável e confortável\n\n## Como começar\nComeçar com um piloto pequeno e de baixo custo em uma rua.\n\n## Como enviar\nEnviar pelo **${channel}**.\n\nAtenciosamente, [Seu nome], [Bairro], [Data]`
    );
  }
  if (b.task === "evidence") {
    const facts = (c.facts?.slice(0, 3) ?? []).map((f) => `- ${f}`).join("\n") || "- (see your city's data)";
    return T(
      `## Your city's facts\n${facts}\n\n## Widely-known context\n- Local action on this issue improves health and comfort.\n\n## Sources to cite\n- Your city's emissions inventory (via CityCatalyst)\n- Your city's climate-risk assessment\n- IPCC / WRI / C40 city briefs\n\n## Talking points\n- Our own city data backs this action as a practical response.`,
      `## Datos de tu ciudad\n${facts}\n\n## Contexto conocido\n- La acción local en este tema mejora la salud y el confort.\n\n## Fuentes para citar\n- El inventario de emisiones de tu ciudad (vía CityCatalyst)\n- La evaluación de riesgo climático de tu ciudad\n- Informes de IPCC / WRI / C40\n\n## Puntos clave\n- Los datos de la propia ciudad respaldan esta acción.`,
      `## Dados da sua cidade\n${facts}\n\n## Contexto conhecido\n- A ação local neste tema melhora saúde e conforto.\n\n## Fontes para citar\n- O inventário de emissões da sua cidade (via CityCatalyst)\n- A avaliação de risco climático da sua cidade\n- Relatórios do IPCC / WRI / C40\n\n## Pontos de fala\n- Os dados da própria cidade embasam esta ação.`
    );
  }
  if (b.task === "pathways") {
    return T(
      `## Now (most feasible, weeks)\n- **What it is:** A resident-led first step.\n- **Effort / cost:** low / volunteer time\n- **Who's involved:** neighbors\n- **First move:** Gather a few neighbors this week.\n\n## Next (a few months)\n- **What it is:** A funded neighborhood version.\n- **Effort / cost:** medium\n- **Who's involved:** ${channel}\n- **First move:** Propose it through ${channel}.\n\n## Long-term (most ambitious, a year+)\n- **What it is:** A citywide policy or investment.\n- **Effort / cost:** high\n- **Who's involved:** the city council\n- **First move:** Ask your council to take it up.\n\nThese escalate — start at Now and build toward Long-term.`,
      `## Ahora (más viable, semanas)\n- **Qué es:** Un primer paso liderado por vecinos.\n- **Esfuerzo / costo:** bajo / tiempo voluntario\n- **Quiénes participan:** vecinos\n- **Primer paso:** Reúne a algunos vecinos esta semana.\n\n## Luego (unos meses)\n- **Qué es:** Una versión financiada a escala de barrio.\n- **Esfuerzo / costo:** medio\n- **Quiénes participan:** ${channel}\n- **Primer paso:** Propónlo a través de ${channel}.\n\n## Largo plazo (más ambicioso, un año+)\n- **Qué es:** Una política o inversión a escala de ciudad.\n- **Esfuerzo / costo:** alto\n- **Quiénes participan:** el concejo municipal\n- **Primer paso:** Pide al concejo que lo retome.\n\nEstos escalan — empieza en Ahora y avanza hacia Largo plazo.`,
      `## Agora (mais viável, semanas)\n- **O que é:** Um primeiro passo liderado por moradores.\n- **Esforço / custo:** baixo / tempo voluntário\n- **Quem participa:** vizinhos\n- **Primeiro passo:** Reúna alguns vizinhos esta semana.\n\n## Depois (alguns meses)\n- **O que é:** Uma versão financiada na escala do bairro.\n- **Esforço / custo:** médio\n- **Quem participa:** ${channel}\n- **Primeiro passo:** Proponha pelo ${channel}.\n\n## Longo prazo (mais ambicioso, um ano+)\n- **O que é:** Uma política ou investimento na escala da cidade.\n- **Esforço / custo:** alto\n- **Quem participa:** a câmara municipal\n- **Primeiro passo:** Peça à câmara que assuma o tema.\n\nEles escalam — comece em Agora e avance para Longo prazo.`
    );
  }
  if (b.task === "refine") {
    const note = T(
      "\n\n> _Refinement needs the live model — it's offline right now, so the text is unchanged._",
      "\n\n> _Refinar requiere el modelo en vivo — está desconectado, así que el texto no cambió._",
      "\n\n> _Refinar precisa do modelo ativo — ele está offline, então o texto não mudou._"
    );
    return (b.prior || "_(nothing to refine yet)_") + note;
  }
  // next_steps
  return T(
    `1. Find a neighborhood group in ${c.name} already working on this.\n2. Bring **${a}** to **${channel}** as a proposal or public comment.\n3. Back it with your city's own climate data.\n4. Invite three neighbors to join and share progress.`,
    `1. Busca un grupo vecinal en ${c.name} que ya trabaje en esto.\n2. Lleva **${a}** a **${channel}** como propuesta o comentario público.\n3. Respáldalo con los datos climáticos de tu ciudad.\n4. Invita a tres vecinos a sumarse y comparte el avance.`,
    `1. Procure um grupo de bairro em ${c.name} que já atue nisso.\n2. Leve **${a}** ao **${channel}** como proposta ou comentário público.\n3. Embase com os dados climáticos da sua cidade.\n4. Convide três vizinhos e compartilhe o progresso.`
  );
}
