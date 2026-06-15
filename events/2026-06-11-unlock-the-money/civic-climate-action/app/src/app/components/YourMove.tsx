"use client";

import { useEffect, useRef, useState } from "react";
import { useGenerate, type GenResult } from "../lib/useGenerate";
import {
  poaWorries,
  appetiteMeta,
  getMove,
  whyByIntent,
  type Appetite,
  type WorryKey,
  type Worry,
} from "../lib/poaMoves";
import { usePledges } from "../lib/pledgeContext";
import {
  findMine,
  addMine,
  updateMineStatus,
  receiptText,
  type MyCommitment,
} from "../lib/myCommitments";
import type { PledgeStatus } from "../lib/pledgeStore";
import { orgsForWorry, actionMeta } from "../data/partnerOrgs";
import Markdown from "./Markdown";

type MsgLang = "pt" | "en";

const CITY_ID = "porto-alegre";
const CITY_NAME = "Porto Alegre";

export default function YourMove() {
  const [worry, setWorry] = useState<WorryKey | null>(null);
  const [appetite, setAppetite] = useState<Appetite | null>(null);

  function reset() {
    setWorry(null);
    setAppetite(null);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Step n={1} label="What worries you" active={!worry} done={!!worry} onClick={() => reset()} />
        <Arrow />
        <Step n={2} label="How you'll act" active={!!worry && !appetite} done={!!appetite} onClick={() => worry && setAppetite(null)} />
        <Arrow />
        <Step n={3} label="Your commitment" active={!!worry && !!appetite} done={false} />
      </div>

      {!worry ? (
        <WorryStep onPick={setWorry} />
      ) : !appetite ? (
        <AppetiteStep worry={worry} onPick={setAppetite} onBack={() => setWorry(null)} />
      ) : (
        <MoveCard worry={worry} appetite={appetite} onRestart={reset} onBack={() => setAppetite(null)} />
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- steps */

function WorryStep({ onPick }: { onPick: (w: WorryKey) => void }) {
  return (
    <div>
      <h3 style={{ fontSize: "1.35rem", marginBottom: "0.4rem" }}>What worries you most in Porto Alegre?</h3>
      <p className="muted" style={{ marginBottom: "1.4rem" }}>Pick one. We&rsquo;ll point you to a single real thing you can do about it.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.8rem" }}>
        {poaWorries.map((w) => (
          <button key={w.key} onClick={() => onPick(w.key)} style={cardBtn}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: "1.7rem" }}>{w.icon}</span>
              {w.level === "Very High" && <span style={veryHighBadge}>Very high risk</span>}
            </div>
            <div style={{ fontWeight: 650, fontSize: "1.02rem", marginTop: "0.6rem" }}>{w.label}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "0.2rem" }}>{w.blurb}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AppetiteStep({ worry, onPick, onBack }: { worry: WorryKey; onPick: (a: Appetite) => void; onBack: () => void }) {
  const w = poaWorries.find((x) => x.key === worry)!;
  return (
    <div>
      <BackLink onClick={onBack} />
      <h3 style={{ fontSize: "1.35rem", margin: "0.6rem 0 0.4rem" }}>
        {w.icon} {w.label} — how do you want to act?
      </h3>
      <p className="muted" style={{ marginBottom: "1.4rem" }}>Be honest about your time and energy. There&rsquo;s a real first move either way.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.8rem" }}>
        {(["quick", "deeper"] as Appetite[]).map((a) => {
          const m = appetiteMeta[a];
          return (
            <button key={a} onClick={() => onPick(a)} style={cardBtn}>
              <span style={{ fontSize: "1.7rem" }}>{m.icon}</span>
              <div style={{ fontWeight: 650, fontSize: "1.02rem", marginTop: "0.6rem" }}>{m.label}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "0.2rem" }}>{m.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- move card */

type Phase = "draft" | "signing" | "tracking";

function MoveCard({ worry, appetite, onRestart, onBack }: { worry: WorryKey; appetite: Appetite; onRestart: () => void; onBack: () => void }) {
  const move = getMove(worry, appetite);
  const w = poaWorries.find((x) => x.key === worry)!;
  const { run } = useGenerate();
  const { sign, setStatus, aggregate } = usePledges();

  const [msg, setMsg] = useState<GenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<MsgLang>("pt");
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<Phase>("draft");
  const [mine, setMine] = useState<MyCommitment | null>(null);
  const [tab, setTab] = useState<"message" | "guide">("message");

  // If this exact move was already signed in this browser, resume the tracker.
  useEffect(() => {
    const existing = findMine(move.recId, move.headline);
    if (existing) {
      setMine(existing);
      setPhase("tracking");
    }
  }, [move.recId, move.headline]);

  async function generate(targetLang: MsgLang) {
    setLoading(true);
    const res = await run({
      task: "local_message",
      action: { name: move.headline, description: move.messageSeed, type: "adaptation" },
      cityContext: {
        name: CITY_NAME,
        country: "Brazil",
        topHazards: [`${w.label}${w.level ? ` (${w.level})` : ""}`],
        topSectors: [],
        localSources: [move.channelName],
        facts: [w.blurb],
      },
      language: targetLang,
    });
    setLoading(false);
    if (res) setMsg(res);
  }

  // Fill the [name]/[neighborhood] placeholders once the resident has signed.
  function personalize(text: string): string {
    if (!mine) return text;
    return text
      .replace(/\[\s*(seu nome|your name|tu nombre)\s*\]/gi, mine.firstName)
      .replace(/\[\s*(bairro|neighbou?rhood|barrio)\s*\]/gi, mine.neighborhood);
  }

  const displayedMsg = msg ? (phase === "tracking" ? personalize(msg.content) : msg.content) : "";

  function copy(text: string) {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(() => {});
    else done();
  }

  const agg = aggregate(CITY_ID);

  return (
    <div>
      <BackLink onClick={onBack} />

      <div style={{ marginTop: "0.7rem", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", background: "var(--bg)", boxShadow: "0 1px 2px rgba(20,24,31,0.04)" }}>
        {/* Headline band */}
        <div style={{ background: "var(--accent-soft)", padding: "1.3rem 1.5rem" }}>
          <div className="eyebrow" style={{ marginBottom: "0.4rem" }}>{w.icon} {w.label} · {appetiteMeta[appetite].label}</div>
          <h3 style={{ fontSize: "1.45rem", lineHeight: 1.2 }}>{move.headline}</h3>
        </div>

        <div style={{ padding: "1.4rem 1.5rem", display: "grid", gap: "1.4rem" }}>
          {/* Where + time */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <a href={move.channelUrl} target="_blank" rel="noopener noreferrer" style={channelBtn}>Open {move.channelName} ↗</a>
            <span style={timeBadge}>⏱ {move.time}</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: move.channelType === "official" ? "var(--accent)" : "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {move.channelType === "official" ? "Official channel" : "Community group"}
            </span>
          </div>

          {/* Toolkit: tabbed — ready-to-send message / guide-me chat */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: "0.8rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setTab("message")} style={tabBtn(tab === "message")}>
                  ✉️ {move.intent === "join" ? "Ready-to-send intro" : "Ready-to-send message"}
                </button>
                <button onClick={() => setTab("guide")} style={tabBtn(tab === "guide")}>🧭 Guide me</button>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {(["pt", "en"] as MsgLang[]).map((l) => (
                  <button key={l} onClick={() => { setLang(l); if (tab === "message" && msg) generate(l); }} style={langBtn(lang === l)}>{l.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {tab === "message" ? (
              <>
                {!msg && !loading && (
                  <button onClick={() => generate(lang)} style={generateBtn}>✦ Write my message</button>
                )}
                {loading && <div style={{ fontSize: "0.9rem", color: "var(--ink-faint)" }}>Writing…</div>}
                {msg && !loading && (
                  <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "0.9rem 1.1rem", background: "var(--bg-soft)" }}>
                    <Markdown>{displayedMsg}</Markdown>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "0.8rem", flexWrap: "wrap" }}>
                      <button onClick={() => copy(displayedMsg)} style={smallBtn}>{copied ? "✓ Copied" : "Copy"}</button>
                      <button onClick={() => generate(lang)} style={smallBtn}>↻ Rewrite</button>
                      <span style={{ fontSize: "0.68rem", color: "var(--ink-faint)" }}>
                        AI-written · ~{msg.gCO2e.toFixed(3)} g CO₂e{phase !== "tracking" ? " · names fill in when you sign" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <GuideChat worry={w} lang={lang} />
            )}
          </div>

          {/* Why it matters (resident-facing — the awareness / demand-signal leverage) */}
          <div style={{ background: "var(--bg-soft)", borderRadius: 12, padding: "0.9rem 1.1rem" }}>
            <div className="eyebrow" style={{ marginBottom: "0.3rem" }}>Why this helps</div>
            <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>{whyByIntent[move.intent]}</p>
          </div>

          {/* What happens next */}
          <div style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "0.9rem" }}>
            <div className="eyebrow" style={{ marginBottom: "0.3rem" }}>What happens next</div>
            <p style={{ fontSize: "0.92rem", color: "var(--ink-soft)" }}>{move.whatNext}</p>
          </div>

          {/* Team up with organizations already doing this */}
          <TeamUp worry={worry} />

          {/* Commitment zone: draft CTA / sign form / tracker */}
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1.2rem" }}>
            {phase === "draft" && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => setPhase("signing")} style={commitBtn}>💚 I care about this</button>
                <span style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                  <strong style={{ color: "var(--ink)" }}>{agg.total.toLocaleString()}</strong> residents have committed ·{" "}
                  <strong style={{ color: "var(--ink)" }}>{agg.sent.toLocaleString()}</strong> reported they sent it
                </span>
              </div>
            )}

            {phase === "signing" && (
              <SignForm
                onCancel={() => setPhase("draft")}
                onSign={async (firstName, neighborhood, email) => {
                  const pledge = await sign({
                    cityId: CITY_ID,
                    actionId: move.recId,
                    worryLabel: w.label,
                    headline: move.headline,
                    firstName,
                    neighborhood,
                    email,
                  });
                  const commitment: MyCommitment = {
                    id: pledge?.id ?? `local_${Date.now().toString(36)}`,
                    cityId: CITY_ID,
                    actionId: move.recId,
                    worryLabel: w.label,
                    headline: move.headline,
                    channelName: move.channelName,
                    channelUrl: move.channelUrl,
                    firstName,
                    neighborhood,
                    createdAt: pledge?.createdAt ?? new Date().toISOString(),
                    status: "committed",
                  };
                  addMine(commitment);
                  setMine(commitment);
                  setPhase("tracking");
                  if (!msg) generate(lang); // make sure they leave with a personalized message
                }}
              />
            )}

            {phase === "tracking" && mine && (
              <Tracker
                mine={mine}
                onAdvance={(next) => {
                  updateMineStatus(mine.id, next);
                  setStatus(mine.id, CITY_ID, next);
                  setMine({ ...mine, status: next });
                }}
                onCopyReceipt={() => copy(receiptText(mine))}
                copied={copied}
              />
            )}
          </div>
        </div>
      </div>

      <button onClick={onRestart} style={{ ...textLink, marginTop: "1rem" }}>← Start over with a different worry</button>
    </div>
  );
}

/* --------------------------------------------------------------- guide chat */

type ChatMsg = { role: "user" | "assistant"; content: string };

function GuideChat({ worry, lang }: { worry: Worry; lang: MsgLang }) {
  const { run } = useGenerate();
  const orgs = orgsForWorry(worry.key);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const started = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Everything the coach is allowed to draw on: both moves + the partner orgs.
  const facts = [
    `${worry.label}: ${worry.blurb}`,
    `Quick action (${worry.moves.quick.time}): ${worry.moves.quick.headline} — via ${worry.moves.quick.channelName} (${worry.moves.quick.channelUrl})`,
    `Deeper action (${worry.moves.deeper.time}): ${worry.moves.deeper.headline} — via ${worry.moves.deeper.channelName} (${worry.moves.deeper.channelUrl})`,
    ...orgs.map((o) => `Organization — ${o.name}: ${o.what} Ways to help: ${o.actions.map((a) => a.label).join("; ")}. ${o.url}`),
  ];
  const sources = [worry.moves.quick.channelName, worry.moves.deeper.channelName, ...orgs.map((o) => o.name)];

  async function ask(question: string, opts: { hidden?: boolean } = {}) {
    const q = question.trim();
    if (!q || loading) return;
    const prior = messages.map((m) => `${m.role === "user" ? "Resident" : "Guide"}: ${m.content}`).join("\n");
    if (!opts.hidden) setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    const res = await run({
      task: "civic_guide",
      action: { name: worry.label, description: `Coaching a resident to act on: ${worry.label}.`, type: "adaptation" },
      cityContext: { name: CITY_NAME, country: "Brazil", topHazards: [worry.label], topSectors: [], localSources: sources, facts },
      language: lang,
      prior,
      instruction: q,
    });
    setLoading(false);
    if (res) setMessages((m) => [...m, { role: "assistant", content: res.content }]);
  }

  // Auto-build the starter toolkit the first time the tab is opened.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    ask("Give me a short starter toolkit for this — what I can do, how to do it, and why it works. Keep it skimmable.", { hidden: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const chips = ["Where do I start?", "What do I actually say?", "How do I get neighbors involved?", "What if I get no response?"];

  return (
    <div>
      <div ref={scrollRef} style={{ maxHeight: 340, overflowY: "auto", display: "grid", gap: "0.7rem", padding: "0.1rem" }}>
        {messages.length === 0 && loading && <p className="muted" style={{ fontSize: "0.88rem" }}>Building your toolkit…</p>}
        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} style={{ background: "var(--bg-soft)", borderRadius: 12, padding: "0.7rem 0.95rem", fontSize: "0.9rem" }}>
              <Markdown>{m.content}</Markdown>
            </div>
          ) : (
            <div key={i} style={{ justifySelf: "end", maxWidth: "85%", background: "var(--accent)", color: "#fff", borderRadius: 12, padding: "0.45rem 0.8rem", fontSize: "0.88rem" }}>
              {m.content}
            </div>
          )
        )}
        {loading && messages.length > 0 && <div style={{ fontSize: "0.85rem", color: "var(--ink-faint)" }}>Thinking…</div>}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "0.8rem 0 0.6rem" }}>
        {chips.map((c) => (
          <button key={c} onClick={() => ask(c)} disabled={loading} style={{ ...smallBtn, opacity: loading ? 0.5 : 1 }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="Ask anything — e.g. how do I run a block meeting?"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={() => ask(input)} disabled={loading || !input.trim()} style={{ ...generateBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}>Send</button>
      </div>
      <p style={{ fontSize: "0.68rem", color: "var(--ink-faint)", marginTop: "0.5rem" }}>
        AI civic coach · grounded in this city&rsquo;s real channels &amp; groups · double-check details before acting.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- team up */

function TeamUp({ worry }: { worry: WorryKey }) {
  const orgs = orgsForWorry(worry);
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: "0.3rem" }}>Team up with people already doing this</div>
      {orgs.length === 0 ? (
        <p style={{ fontSize: "0.88rem", color: "var(--ink-soft)" }}>
          We haven&rsquo;t vetted a resident-facing organization for this in Porto Alegre yet — the
          official channel above is your route for now. (Know one? It belongs here.)
        </p>
      ) : (
        <div style={{ display: "grid", gap: "0.7rem" }}>
          {orgs.map((o) => (
            <div key={o.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "0.85rem 1rem", background: "var(--bg)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <a href={o.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 650, fontSize: "0.96rem" }}>{o.name} ↗</a>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-faint)" }}>{o.theme}</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.3rem 0 0.6rem" }}>{o.what}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {o.actions.map((a) => (
                  <a
                    key={a.type + a.url}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.78rem", fontWeight: 600, color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 999, padding: "0.3rem 0.7rem" }}
                  >
                    {actionMeta[a.type].icon} {a.label} ↗
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- sign form */

function SignForm({ onSign, onCancel }: { onSign: (firstName: string, neighborhood: string, email?: string) => void; onCancel: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [email, setEmail] = useState("");
  const valid = firstName.trim().length > 0;

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: "0.2rem" }}>Add your name to this</div>
      <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.9rem" }}>
        Signing puts your first name on Porto Alegre&rsquo;s public engagement record and fills in your
        message so it&rsquo;s ready to send. We never publish your email.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem", maxWidth: 620 }}>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name *" style={inputStyle} />
        <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Neighborhood" style={inputStyle} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional — for follow-up)" type="email" style={inputStyle} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "1rem", flexWrap: "wrap" }}>
        <button
          disabled={!valid}
          onClick={() => onSign(firstName.trim(), neighborhood.trim() || "Porto Alegre", email.trim() || undefined)}
          style={{ ...commitBtn, opacity: valid ? 1 : 0.5, cursor: valid ? "pointer" : "not-allowed" }}
        >
          ✍️ Sign &amp; commit
        </button>
        <button onClick={onCancel} style={textLink}>Cancel</button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- tracker */

const STAGES: { key: PledgeStatus; label: string; cta: string }[] = [
  { key: "committed", label: "Committed", cta: "" },
  { key: "sent", label: "Sent", cta: "I've sent it" },
  { key: "responded", label: "Got a response", cta: "I got a response" },
];

function Tracker({ mine, onAdvance, onCopyReceipt, copied }: { mine: MyCommitment; onAdvance: (s: PledgeStatus) => void; onCopyReceipt: () => void; copied: boolean }) {
  const idx = STAGES.findIndex((s) => s.key === mine.status);
  const next = STAGES[idx + 1];

  function saveReceipt() {
    try {
      const blob = new Blob([receiptText(mine)], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `commitment-${mine.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      onCopyReceipt(); // fall back to clipboard
    }
  }

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: "0.7rem" }}>
        ✓ You signed this, {mine.firstName}
      </div>

      {/* Stage stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
        {STAGES.map((s, i) => {
          const reached = i <= idx;
          return (
            <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: reached ? "var(--accent)" : "var(--ink-faint)" }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center", fontSize: "0.62rem", color: reached ? "#fff" : "var(--ink-faint)", background: reached ? "var(--accent)" : "var(--bg-soft)", border: `1px solid ${reached ? "var(--accent)" : "var(--line)"}` }}>
                  {reached ? "✓" : i + 1}
                </span>
                {s.label}
              </span>
              {i < STAGES.length - 1 && <span style={{ color: "var(--ink-faint)" }}>→</span>}
            </span>
          );
        })}
      </div>

      {next ? (
        <button onClick={() => onAdvance(next.key)} style={commitBtn}>✅ {next.cta}</button>
      ) : (
        <div style={{ background: "var(--accent-soft)", borderRadius: 10, padding: "0.6rem 0.9rem", fontSize: "0.88rem" }}>
          🎉 Followed through, start to response. This is what a city&rsquo;s engagement actually looks like.
        </div>
      )}

      {/* Receipt */}
      <div style={{ marginTop: "1.2rem", border: "1px dashed var(--line)", borderRadius: 12, padding: "0.9rem 1.1rem", background: "var(--bg-soft)" }}>
        <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>Commitment receipt</div>
        <div style={{ fontSize: "0.85rem", color: "var(--ink)", lineHeight: 1.7 }}>
          <div><strong>{mine.firstName}</strong> · {mine.neighborhood}, {CITY_NAME}</div>
          <div style={{ color: "var(--ink-soft)" }}>{mine.headline}</div>
          <div style={{ color: "var(--ink-soft)" }}>via {mine.channelName}</div>
          <div style={{ color: "var(--ink-faint)", fontSize: "0.78rem", marginTop: "0.3rem" }}>
            Signed {new Date(mine.createdAt).toLocaleDateString()} · ref {mine.id}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: "0.8rem", flexWrap: "wrap" }}>
          <button onClick={saveReceipt} style={smallBtn}>⬇ Save receipt (.txt)</button>
          <button onClick={onCopyReceipt} style={smallBtn}>{copied ? "✓ Copied" : "Copy receipt"}</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- bits */

function Step({ n, label, active, done, onClick }: { n: number; label: string; active: boolean; done: boolean; onClick?: () => void }) {
  const color = active ? "var(--accent)" : done ? "var(--ink)" : "var(--ink-faint)";
  return (
    <button onClick={onClick} disabled={!onClick} style={{ font: "inherit", background: "none", border: "none", padding: 0, cursor: onClick ? "pointer" : "default", display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", fontSize: "0.78rem", fontWeight: 700, color: active ? "#fff" : color, background: active ? "var(--accent)" : done ? "var(--accent-soft)" : "var(--bg-soft)", border: `1px solid ${active ? "var(--accent)" : "var(--line)"}` }}>
        {done ? "✓" : n}
      </span>
      <span style={{ fontSize: "0.82rem", fontWeight: 600, color }}>{label}</span>
    </button>
  );
}

const Arrow = () => <span style={{ color: "var(--ink-faint)" }}>→</span>;
function BackLink({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} style={textLink}>← Back</button>;
}

const cardBtn: React.CSSProperties = { font: "inherit", textAlign: "left", cursor: "pointer", border: "1px solid var(--line)", borderRadius: 14, background: "var(--bg)", padding: "1.1rem 1.2rem" };
const veryHighBadge: React.CSSProperties = { fontSize: "0.64rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#b91c1c", background: "#fee2e2", borderRadius: 999, padding: "0.18rem 0.5rem" };
const channelBtn: React.CSSProperties = { fontSize: "0.9rem", fontWeight: 650, color: "#fff", background: "var(--accent)", borderRadius: 10, padding: "0.55rem 1rem" };
const timeBadge: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-soft)", background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 999, padding: "0.3rem 0.7rem" };
const generateBtn: React.CSSProperties = { font: "inherit", fontSize: "0.9rem", fontWeight: 650, cursor: "pointer", color: "#fff", background: "var(--accent)", border: "none", borderRadius: 10, padding: "0.6rem 1.1rem" };
const commitBtn: React.CSSProperties = { font: "inherit", fontSize: "0.9rem", fontWeight: 650, cursor: "pointer", color: "#fff", background: "var(--accent)", border: "none", borderRadius: 999, padding: "0.55rem 1.3rem" };
const smallBtn: React.CSSProperties = { font: "inherit", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", color: "var(--accent)", background: "var(--accent-soft)", border: "none", borderRadius: 8, padding: "0.35rem 0.7rem" };
const inputStyle: React.CSSProperties = { font: "inherit", fontSize: "0.9rem", padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg)", outlineColor: "var(--accent)" };
const tabBtn = (active: boolean): React.CSSProperties => ({
  font: "inherit",
  fontSize: "0.8rem",
  fontWeight: 650,
  cursor: "pointer",
  padding: "0.35rem 0.75rem",
  borderRadius: 999,
  border: "1px solid",
  borderColor: active ? "var(--accent)" : "var(--line)",
  background: active ? "var(--accent)" : "var(--bg)",
  color: active ? "#fff" : "var(--ink-soft)",
});

const langBtn = (active: boolean): React.CSSProperties => ({ font: "inherit", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", padding: "0.2rem 0.5rem", borderRadius: 7, border: "1px solid", borderColor: active ? "var(--accent)" : "var(--line)", background: active ? "var(--accent)" : "var(--bg)", color: active ? "#fff" : "var(--ink-soft)" });
const textLink: React.CSSProperties = { font: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", color: "var(--accent)", background: "none", border: "none", padding: 0 };
