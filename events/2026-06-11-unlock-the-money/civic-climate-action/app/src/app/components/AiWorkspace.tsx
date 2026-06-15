"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../data/climateActions";
import type { LocalSource } from "../data/localEngagement";
import type { RankedAction } from "../lib/prioritize";
import { useGenerate, type GenResult, type GenTask } from "../lib/useGenerate";
import { stories } from "../data/stories";
import { matchStories } from "../lib/matchStories";
import { categoryMeta } from "../data/types";
import Markdown from "./Markdown";
import PledgeButton from "./PledgeButton";

type LensKey = GenTask | "examples";

type CityContext = {
  country: string;
  topHazards: string[];
  topSectors: string[];
  localSources: string[];
  facts: string[];
};

const LENSES: {
  key: LensKey;
  llm: boolean;
  label: Record<Lang, string>;
  desc: Record<Lang, string>;
}[] = [
  {
    key: "next_steps",
    llm: true,
    label: { en: "Next steps", es: "Próximos pasos", pt: "Próximos passos" },
    desc: {
      en: "Concrete moves you can make in the coming weeks.",
      es: "Acciones concretas para las próximas semanas.",
      pt: "Ações concretas para as próximas semanas.",
    },
  },
  {
    key: "draft_proposal",
    llm: true,
    label: { en: "Draft a proposal", es: "Redactar propuesta", pt: "Redigir proposta" },
    desc: {
      en: "A ready-to-send draft for your town hall.",
      es: "Un borrador listo para enviar a tu municipio.",
      pt: "Um rascunho pronto para enviar à prefeitura.",
    },
  },
  {
    key: "evidence",
    llm: true,
    label: { en: "Back it with data", es: "Respáldalo con datos", pt: "Embase com dados" },
    desc: {
      en: "Facts and sources to make your case.",
      es: "Datos y fuentes para sustentar tu caso.",
      pt: "Dados e fontes para embasar seu caso.",
    },
  },
  {
    key: "pathways",
    llm: true,
    label: { en: "Pathways", es: "Rutas", pt: "Caminhos" },
    desc: {
      en: "From a quick first move to citywide change.",
      es: "De un primer paso a un cambio en toda la ciudad.",
      pt: "De um primeiro passo à mudança em toda a cidade.",
    },
  },
  {
    key: "examples",
    llm: false,
    label: { en: "Examples", es: "Ejemplos", pt: "Exemplos" },
    desc: {
      en: "Where this has already worked.",
      es: "Dónde ya ha funcionado.",
      pt: "Onde isto já funcionou.",
    },
  },
  {
    key: "future_vision",
    llm: true,
    label: { en: "Futures", es: "Futuros", pt: "Futuros" },
    desc: {
      en: "Data-backed plausible futures if this scales — trends, not guesses.",
      es: "Futuros plausibles con base en datos — tendencias, no conjeturas.",
      pt: "Futuros plausíveis com base em dados — tendências, não palpites.",
    },
  },
];

const t = {
  generate: { en: "Generate", es: "Generar", pt: "Gerar" },
  regenerate: { en: "Regenerate", es: "Regenerar", pt: "Regenerar" },
  working: { en: "Working…", es: "Generando…", pt: "Gerando…" },
  copy: { en: "Copy", es: "Copiar", pt: "Copiar" },
  copied: { en: "Copied", es: "Copiado", pt: "Copiado" },
  refinePh: {
    en: "Refine — e.g. shorter, more formal, focus on flooding…",
    es: "Refinar — p. ej. más corto, más formal, enfocar en inundaciones…",
    pt: "Refinar — ex. mais curto, mais formal, focar em enchentes…",
  },
  refine: { en: "Refine", es: "Refinar", pt: "Refinar" },
  where: { en: "Where to engage locally", es: "Dónde participar localmente", pt: "Onde participar localmente" },
  estimated: { en: "est.", es: "est.", pt: "est." },
  disclaimer: {
    en: "AI-generated draft — check the facts and local details before submitting.",
    es: "Borrador generado por IA — verifica los datos y detalles locales antes de enviarlo.",
    pt: "Rascunho gerado por IA — confira os fatos e detalhes locais antes de enviar.",
  },
  futureLabel: {
    en: "Plausible futures · grounded in this city's data (Futures Design)",
    es: "Futuros plausibles · con base en los datos de la ciudad (Futures Design)",
    pt: "Futuros plausíveis · com base nos dados da cidade (Futures Design)",
  },
  noExamples: { en: "No close examples yet — browse the Inspiration gallery below.", es: "Aún sin ejemplos cercanos — mira la galería de Inspiración abajo.", pt: "Ainda sem exemplos próximos — veja a galeria de Inspiração abaixo." },
};

const typeColor = { adaptation: "var(--accent)", mitigation: "#d97706" } as const;

export default function AiWorkspace({
  ranked,
  cityId,
  cityName,
  cityContext,
  localSources,
  lang,
}: {
  ranked: RankedAction;
  cityId: string;
  cityName: string;
  cityContext: CityContext;
  localSources: LocalSource[];
  lang: Lang;
}) {
  const { action } = ranked;
  const { run } = useGenerate();
  const [active, setActive] = useState<LensKey>("next_steps");
  const [cache, setCache] = useState<Partial<Record<LensKey, GenResult>>>({});
  const [pendingSet, setPendingSet] = useState<Set<LensKey>>(new Set());
  const [refineText, setRefineText] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset transient input/feedback when the lens changes (don't carry a refine
  // instruction or a "Copied" flag across lenses).
  useEffect(() => {
    setRefineText("");
    setCopied(false);
  }, [active]);

  const exampleStories = useMemo(() => matchStories(action, stories), [action]);

  const lens = LENSES.find((l) => l.key === active)!;
  const result = cache[active];

  async function generate(task: GenTask, opts: { prior?: string; instruction?: string } = {}) {
    const lensKey = active; // capture: the lens this generation belongs to
    setPendingSet((p) => new Set(p).add(lensKey));
    const res = await run({
      task,
      action: { name: action.name[lang], description: action.description[lang], type: action.actionType },
      cityContext: { name: cityName, ...cityContext },
      language: lang,
      ...opts,
    });
    setPendingSet((p) => {
      const n = new Set(p);
      n.delete(lensKey);
      return n;
    });
    if (res) setCache((c) => ({ ...c, [lensKey]: res }));
  }

  function onRefine() {
    if (!result || !refineText.trim()) return;
    generate("refine", { prior: result.content, instruction: refineText.trim() });
    setRefineText("");
  }

  function copy() {
    if (!result) return;
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(result.content).then(done).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      try {
        const ta = document.createElement("textarea");
        ta.value = result!.content;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch {
        /* clipboard unavailable */
      }
    }
  }

  const isLoading = pendingSet.has(active);

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        background: "var(--bg-soft)",
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
        overflow: "hidden",
      }}
    >
      {/* Action header */}
      <div style={{ padding: "1.1rem 1.25rem 0.6rem" }}>
        <span style={{ fontSize: "0.66rem", fontWeight: 700, color: typeColor[action.actionType], textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {action.actionType}
        </span>
        <h4 style={{ fontSize: "1.12rem", margin: "0.2rem 0 0.6rem", lineHeight: 1.25 }}>{action.name[lang]}</h4>
        <PledgeButton cityId={cityId} lang={lang} />
      </div>

      {/* Lens tabs */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", padding: "0.5rem 1.25rem", borderBottom: "1px solid var(--line)" }}>
        {LENSES.map((l) => (
          <button
            key={l.key}
            onClick={() => setActive(l.key)}
            style={{
              font: "inherit",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              padding: "0.3rem 0.6rem",
              borderRadius: 8,
              border: "1px solid",
              borderColor: active === l.key ? "var(--accent)" : "transparent",
              background: active === l.key ? "var(--bg)" : "transparent",
              color: active === l.key ? "var(--accent)" : "var(--ink-soft)",
            }}
          >
            {l.label[lang]}
          </button>
        ))}
      </div>

      {/* Lens body */}
      <div style={{ padding: "1.1rem 1.25rem", flex: 1 }}>
        <p className="muted" style={{ fontSize: "0.85rem", margin: "0 0 0.9rem" }}>
          {lens.desc[lang]}
        </p>

        {active === "examples" ? (
          <ExamplesList stories={exampleStories} lang={lang} />
        ) : isLoading ? (
          <div style={{ fontSize: "0.9rem", color: "var(--ink-faint)" }}>{t.working[lang]}</div>
        ) : !result ? (
          <button onClick={() => generate(active as GenTask)} style={ctaStyle}>
            ✦ {t.generate[lang]}
          </button>
        ) : (
          <div>
            {active === "future_vision" && (
              <div className="eyebrow" style={{ marginBottom: "0.5rem", color: "var(--ink-faint)" }}>
                {t.futureLabel[lang]}
              </div>
            )}
            <Markdown>{result.content}</Markdown>

            <p style={{ fontSize: "0.7rem", color: "var(--ink-faint)", fontStyle: "italic", margin: "0.5rem 0 0" }}>
              {t.disclaimer[lang]}
            </p>

            {/* Refine bar */}
            <div style={{ display: "flex", gap: 6, marginTop: "1rem" }}>
              <input
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onRefine()}
                placeholder={t.refinePh[lang]}
                style={{
                  flex: 1,
                  padding: "0.5rem 0.7rem",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  background: "var(--bg)",
                  outlineColor: "var(--accent)",
                }}
              />
              <button
                onClick={onRefine}
                disabled={isLoading || !refineText.trim()}
                style={{ ...smallBtn, opacity: !isLoading && refineText.trim() ? 1 : 0.5 }}
              >
                {t.refine[lang]}
              </button>
            </div>

            {/* Actions + carbon */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "0.7rem", flexWrap: "wrap" }}>
              <button onClick={() => generate(active as GenTask)} disabled={isLoading} style={{ ...smallBtn, opacity: isLoading ? 0.5 : 1 }}>
                ↻ {t.regenerate[lang]}
              </button>
              <button onClick={copy} style={smallBtn}>
                {copied ? `✓ ${t.copied[lang]}` : t.copy[lang]}
              </button>
              {isLoading ? (
                <span style={{ fontSize: "0.7rem", color: "var(--ink-faint)" }}>{t.working[lang]}</span>
              ) : (
                <span style={{ fontSize: "0.7rem", color: "var(--ink-faint)" }}>
                  ~{result.gCO2e.toFixed(3)} g CO₂e ({t.estimated[lang]}) · {result.model}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Local sources footer */}
      {localSources.length > 0 && (
        <div style={{ padding: "0.9rem 1.25rem", borderTop: "1px solid var(--line)" }}>
          <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>
            {t.where[lang]}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {localSources.slice(0, 8).map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.note}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 999,
                  padding: "0.2rem 0.55rem",
                  fontSize: "0.74rem",
                  color: s.type === "official" ? "var(--accent)" : "var(--ink-soft)",
                  background: s.type === "official" ? "var(--accent-soft)" : "var(--bg)",
                }}
              >
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExamplesList({ stories, lang }: { stories: ReturnType<typeof matchStories>; lang: Lang }) {
  if (stories.length === 0) {
    return <p className="muted" style={{ fontSize: "0.88rem" }}>{t.noExamples[lang]}</p>;
  }
  return (
    <div style={{ display: "grid", gap: "0.6rem" }}>
      {stories.map((s) => {
        const m = categoryMeta[s.category];
        return (
          <div key={s.id} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "0.7rem 0.85rem", background: "var(--bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: m.color }}>{m.label}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>
                {s.city}, {s.country}
              </span>
            </div>
            <div style={{ fontWeight: 650, fontSize: "0.92rem", margin: "0.2rem 0 0.2rem" }}>{s.title}</div>
            <p style={{ fontSize: "0.84rem", color: "var(--ink-soft)", margin: 0 }}>{s.outcome}</p>
            <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.76rem", display: "inline-block", marginTop: "0.4rem" }}>
              {s.sourceName} ↗
            </a>
          </div>
        );
      })}
    </div>
  );
}

const ctaStyle: React.CSSProperties = {
  font: "inherit",
  fontSize: "0.9rem",
  fontWeight: 650,
  cursor: "pointer",
  color: "#fff",
  background: "var(--accent)",
  border: "none",
  borderRadius: 8,
  padding: "0.6rem 1rem",
};

const smallBtn: React.CSSProperties = {
  font: "inherit",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
  color: "var(--accent)",
  background: "var(--accent-soft)",
  border: "none",
  borderRadius: 8,
  padding: "0.35rem 0.7rem",
};
