"""Green/cheap LLM generation sidecar for the Civic Climate Action workspace.

Given a city's climate profile + a chosen action, generates one of several
"lenses" — concrete next steps, a draft proposal to the town hall, evidence to
back the concern, short→long-term pathways, or a Futures-Design "vision of the
future" — and can refine any of them from a free-text instruction. Uses a
low-carbon open-weight model via an OpenAI-compatible API and reports the
per-call carbon footprint with EcoLogits. Runs in mock mode with zero secrets.

Run:  uvicorn main:app --port 8000
"""
import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass

from fastapi import FastAPI

import providers
import ecolog
from schemas import GenerateRequest, GenerateResponse

app = FastAPI(title="Civic Climate Action — Generation Service")
ecolog.init()

_LANG_NAME = {"en": "English", "es": "Spanish", "pt": "Brazilian Portuguese"}

# Per-task completion budgets (the future vision is one short paragraph).
_MAX_TOKENS = {
    "next_steps": 500,
    "local_message": 400,
    "civic_guide": 550,
    "draft_proposal": 800,
    "evidence": 700,
    "pathways": 800,
    "future_vision": 650,
    "refine": 800,
}


@app.get("/health")
def health():
    provider, _base, model, _key = providers.get_config()
    return {
        "status": "ok",
        "mock": providers.is_mock(),
        "provider": provider,
        "model": model or "mock-small",
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    provider, base_url, model, api_key = providers.get_config()
    task = req.task if req.task in _MAX_TOKENS else "next_steps"

    if providers.is_mock():
        return GenerateResponse(
            content=mock_content(req, task),
            model=model or "mock-small",
            provider=provider,
            mock=True,
            **ecolog.estimate(),
        )

    from openai import OpenAI

    client = OpenAI(base_url=base_url, api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": _system(task, req.language)},
            {"role": "user", "content": _user(req, task)},
        ],
        temperature=0.5 if task == "future_vision" else 0.4,
        max_tokens=_MAX_TOKENS[task],
    )
    content = _strip_fence((resp.choices[0].message.content or "").strip())
    impacts = ecolog.measure(resp)
    return GenerateResponse(
        content=content, model=model, provider=provider, mock=False, **impacts
    )


# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
_GUARDRAILS = (
    "Use plain, global-standard language and minimal jargon. "
    "Never invent specific counts, quantities, dates, deadlines, budgets, percentages, named "
    "officials, ordinance numbers, or report titles — not even inside proposals, asks, or "
    "targets. Describe scope qualitatively instead (e.g. 'the hottest bus stops', 'priority "
    "neighborhoods', 'within one council term'). The ONLY numbers you may use are those in the "
    "provided facts, quoted exactly. Only name civic channels that appear in the provided list; "
    "if none fits, use a clearly bracketed placeholder. Keep local program/channel names in "
    "their original language. Output plain GitHub-flavored Markdown — do NOT wrap the whole "
    "answer in a code block or ``` fences."
)

_SYSTEMS = {
    "next_steps": (
        "You are a civic-engagement assistant for city residents. Help a resident act on this "
        "climate action. Output Markdown in exactly two sections, in this order and nothing else:\n"
        "## Next steps\nA numbered list of 4-6 concrete moves an ordinary resident can make over the "
        "coming weeks (join a group, attend a meeting, submit a public comment, start something "
        "small). Each step is one imperative sentence; where a step involves government or a group, "
        "name a real local channel from the context.\n"
        "## Ready-to-send message\nA short (~120-word) copy-pasteable message the resident can send "
        "to the single best-fitting local channel — greeting, one-line ask naming the action, 1-2 "
        "sentences of why it matters here (quoting the provided facts closely, no new numbers), and "
        "a sign-off with [Your name], [Neighborhood]. Name the channel in the message."
    ),
    "local_message": (
        "You are helping a city resident write a SHORT, ready-to-send message to a specific local "
        "channel (named in the context as the first local source). The resident's goal is given as "
        "the action name/description. Write ONLY the message itself — copy-pasteable, ~70-110 words, "
        "warm but direct. Structure: a one-line greeting to the named channel; one or two sentences "
        "stating the concrete ask (the action) and, where relevant, briefly where/what; a closing "
        "line. End with the placeholders [Seu nome] and [Bairro] (or [Your name] and [Neighbourhood] "
        "in English). If the channel is a community group, make it a friendly introduction asking how "
        "to get involved. "
        "IMPORTANT — write only what the resident is asking for. Do NOT explain to the recipient why "
        "reporting or engaging matters, do NOT reference budgets, 'investment lists', awareness, "
        "prioritization, or use phrases like 'as you know' or 'let me know if you need more details'. "
        "No meta-commentary or filler. "
        "Do NOT invent addresses, dates, statistics, or other channels. Output plain text or minimal "
        "Markdown — no headings, no preamble like 'here is your message'."
    ),
    "civic_guide": (
        "You are a warm, practical civic-action coach for a city resident who wants to act on a "
        "local climate issue. Using ONLY the actions, channels, and organizations in the context, "
        "help them actually do it. Answer their question concretely and encouragingly, covering — "
        "where useful — WHAT to do, HOW to do it (clear steps), and WHY it works. Keep replies SHORT "
        "and skimmable: a few sentences or a short numbered/bulleted list, never an essay. Name the "
        "real channels and organizations from the context when relevant. NEVER invent contacts, "
        "links, phone numbers, statistics, dates, or events beyond those provided. If the resident "
        "seems unsure or overwhelmed, give the single smallest first step they can take today, then "
        "offer to go deeper. Speak directly to the resident ('you'). No preamble, no sign-off."
    ),
    "draft_proposal": (
        "You are helping a resident draft a first proposal letter to their town hall or council "
        "requesting this action. Write a copy-pasteable letter, under ~350 words, in this exact "
        "Markdown order:\n"
        "# {short concrete title naming the action and city}\n"
        "To: {the single best-fitting local channel/body}  \nRe: {one-line subject}\n"
        "## Why this matters here\n2-4 sentences of rationale that quote the provided facts (hazard "
        "severity and/or top-sector share) closely. No new numbers.\n"
        "## What we ask\n1-3 bullets, each a clear, checkable ask a council member could say "
        "yes/no to — describe scope qualitatively (e.g. 'plant and maintain trees at the hottest "
        "bus stops and squares'). Do NOT invent counts, dates, or budgets.\n"
        "## Expected benefits\n3-5 qualitative bullets: the climate benefit + co-benefits (health, "
        "cost, comfort, equity, jobs).\n"
        "## A note on getting started\n1-3 sentences on a simple, low-cost first step (a pilot, a "
        "map, a working group).\n"
        "## How to submit this\nName the single most appropriate local channel and one line on why "
        "it fits (a spending request → the participatory-budget channel; a policy/oversight request "
        "→ the relevant municipal council; a hazard report → civil defense).\n"
        "Close with a line and the placeholders [Your name], [Neighborhood], [Date]."
    ),
    "evidence": (
        "You are helping a resident back their climate concern with credible evidence. Output "
        "Markdown in this order:\n"
        "## Your city's facts\n2-4 bullets drawn ONLY from the provided facts, quoted closely.\n"
        "## Widely-known context\n1-3 bullets of general, NON-numeric climate knowledge that frames "
        "why the action matters.\n"
        "## Sources to cite\n3-5 bullets naming source TYPES to pull real numbers from — the city's "
        "own emissions inventory (via CityCatalyst), its climate-risk assessment, the national "
        "statistics office, and 1-2 recognized bodies (IPCC, WRI, C40, World Bank) — each with a "
        "one-line 'what you'll find here'. Do not fabricate report titles, URLs, or years.\n"
        "## Talking points\n2-3 short sentences a resident can say in a meeting, each fusing one "
        "city fact with one benefit, with no invented numbers.\n"
        "Keep the city-fact vs general-knowledge distinction visible; never attach a number to a "
        "general claim."
    ),
    "pathways": (
        "You are mapping implementation alternatives for this action, escalating from most "
        "feasible/short-term to most ambitious/long-term. Output Markdown with three subsections, "
        "in this fixed order and nothing else:\n"
        "## Now (most feasible, weeks)\n## Next (a few months)\n## Long-term (most ambitious, a year+)\n"
        "Under each, the SAME four labeled lines:\n"
        "- **What it is:** 1-2 sentences for this ambition level.\n"
        "- **Effort / cost:** a qualitative band (low / volunteer time; medium / small grant or "
        "council line item; high / capital budget) — no invented amounts.\n"
        "- **Who's involved:** the people/bodies needed, naming a real local channel where relevant.\n"
        "- **First move:** one concrete thing the resident can do this week.\n"
        "Make the three levels genuinely escalate (solo/pilot → funded neighborhood program → "
        "citywide policy or investment). End with one short line noting they escalate."
    ),
    "future_vision": (
        "You are a foresight practitioner using Futures Design and Future Design methodology. "
        "Produce a SHORT, DATA-BACKED exploration of plausible futures for this city if the action "
        "is taken up and scaled — grounded in the city's real data, reasoning from trends, the "
        "Futures Cone (probable vs preferable futures), and Future Design's future-generations "
        "standpoint. This is structured foresight, NOT a sensory 'day in the life' anecdote. Output "
        "Markdown in exactly these sections:\n"
        "## Where today's trends point\n2-3 sentences reading the city's current trajectory from its "
        "real risk and emissions data (use the provided facts by name) — the qualitative direction "
        "things head if nothing changes. No invented numbers.\n"
        "## A plausible future history (to ~2050)\nFrom the standpoint of a resident in ~2050 looking "
        "back: the realistic pathway and the necessary transitions if this action is adopted and "
        "scaled — what changed, roughly in what order, and why it held. Plausible and partial, not "
        "utopian; acknowledge the effort and trade-offs involved.\n"
        "## Two futures, side by side\n"
        "- **If little changes (probable):** where the current trend lands without sustained action.\n"
        "- **If this action takes hold (preferable):** the better-but-plausible outcome, plus one or "
        "two systemic ripple effects it unlocks (health, mobility, equity, cost of living).\n"
        "Close with one italicized line starting '_What it asks of us now:_' — the present trade-off "
        "that future generations would thank us for. Keep the whole thing tight (~200-280 words). "
        "Qualitative trends only; the only numbers allowed are the provided facts."
    ),
    "refine": (
        "You are refining a resident's existing draft. Revise the PRIOR content according to the "
        "INSTRUCTION, keeping the EXACT same Markdown structure, sections and field labels. Return "
        "ONLY the revised content — no preamble, no 'here is your revised...' line. Preserve every "
        "grounded fact, channel name and bracketed placeholder; do not introduce new statistics or "
        "new channels. If the instruction needs facts that aren't provided, keep what's grounded and "
        "add a bracketed note like '[verify before submitting]' rather than inventing support."
    ),
}


def _strip_fence(text: str) -> str:
    """Remove a wrapping ```markdown / ``` code fence the model sometimes adds."""
    import re

    t = text.strip()
    m = re.match(r"^```[a-zA-Z]*\s*\n(.*)\n```$", t, re.DOTALL)
    return m.group(1).strip() if m else t


def _system(task: str, language: str) -> str:
    lang = _LANG_NAME.get(language, "English")
    return f"{_SYSTEMS[task]}\n\n{_GUARDRAILS} Reply ONLY in {lang}."


def _context_block(req: GenerateRequest) -> str:
    c = req.cityContext
    lines = [
        f"City: {c.name}, {c.country}",
        f"Top climate hazards: {', '.join(c.topHazards[:4]) or 'n/a'}",
        f"Top emitting sectors: {', '.join(c.topSectors[:4]) or 'n/a'}",
    ]
    if c.facts:
        lines.append("Key facts about this city (use these exactly; invent no others):")
        lines += [f"- {f}" for f in c.facts[:8]]
    if c.dataCaveat:
        lines.append(f"Data caveat (do NOT cite sector shares as precise): {c.dataCaveat}")
    lines.append(f"Local civic channels: {', '.join(c.localSources[:6]) or 'n/a'}")
    lines.append(f"Action ({req.action.type}): {req.action.name}")
    if req.action.description:
        lines.append(f"Action description: {req.action.description[:400]}")
    return "\n".join(lines)


def _user(req: GenerateRequest, task: str) -> str:
    if task == "refine":
        return (
            f"{_context_block(req)}\n\n"
            f"PRIOR CONTENT:\n{req.prior[:4000]}\n\n"
            f"INSTRUCTION: {req.instruction or 'Improve clarity and concreteness.'}\n\n"
            "Return the revised content only."
        )
    if task == "civic_guide":
        convo = (req.prior or "")[:3000]
        question = req.instruction or "Help me get started."
        parts = [_context_block(req)]
        if convo:
            parts.append(f"CONVERSATION SO FAR:\n{convo}")
        parts.append(f"RESIDENT'S MESSAGE: {question}\n\nReply as their civic-action coach.")
        return "\n\n".join(parts)
    return f"{_context_block(req)}\n\nNow produce the requested output."


# ---------------------------------------------------------------------------
# Mock content (no key) — concise templated markdown per task.
# ---------------------------------------------------------------------------
def mock_content(req: GenerateRequest, task: str) -> str:
    c = req.cityContext
    a = req.action.name
    channel = c.localSources[0] if c.localSources else "your city council"
    hazard = c.topHazards[0] if c.topHazards else "local climate risk"
    if task == "civic_guide":
        return (
            f"**Start with one small step.**\n\n"
            f"1. **What:** {a.lower()} — the easiest entry is through **{channel}**.\n"
            f"2. **How:** open {channel}, describe your street or spot in a line or two (a photo helps), and send.\n"
            f"3. **Why:** documented, located voices are what move {a.lower()} up the city's priority list.\n\n"
            f"Want help with what to say, or how to bring a few neighbours in?"
        )
    if task == "local_message":
        return (
            f"Olá, {channel},\n\n"
            f"Sou morador de Porto Alegre e gostaria de pedir apoio para: {a.lower()}. "
            f"{hazard} é uma preocupação real no nosso bairro, e uma ação local como esta tornaria "
            f"a região mais segura e saudável. Poderíamos conversar sobre um primeiro passo?\n\n"
            f"Obrigado(a), [Seu nome], [Bairro]"
        )
    if task == "future_vision":
        return (
            f"## Where today's trends point\n"
            f"On its current path, {c.name} faces growing pressure from {hazard.lower()} and its "
            f"main emitting sectors. Without sustained action, those pressures compound.\n\n"
            f"## A plausible future history (to ~2050)\n"
            f"Looking back from 2050, {a.lower()} started small — championed by residents through "
            f"{channel} — then scaled neighborhood by neighborhood as results showed and held.\n\n"
            f"## Two futures, side by side\n"
            f"- **If little changes (probable):** the same risks, unevenly felt.\n"
            f"- **If this action takes hold (preferable):** a measurably more resilient, livable city, "
            f"with knock-on gains in health and cost of living.\n\n"
            f"_What it asks of us now: a modest, shared effort today for a city future generations inherit._"
        )
    if task == "draft_proposal":
        return (
            f"# Proposal: {a} in {c.name}\n\n"
            f"To: {channel}  \nRe: {a}\n\n"
            f"## Why this matters here\n{hazard} is a top concern for our city, and this action "
            f"helps address it directly.\n\n"
            f"## What we ask\n- Pilot **{a.lower()}** in our neighborhood\n\n"
            f"## Expected benefits\n- A safer, healthier, more comfortable neighborhood\n\n"
            f"## A note on getting started\nBegin with a small, low-cost pilot on one block.\n\n"
            f"## How to submit this\nSubmit through **{channel}**.\n\n"
            f"Sincerely, [Your name], [Neighborhood], [Date]"
        )
    if task == "evidence":
        facts = "\n".join(f"- {f}" for f in (c.facts[:3] or [f"{hazard} affects our city."]))
        return (
            f"## Your city's facts\n{facts}\n\n"
            f"## Widely-known context\n- Local action on this issue improves health and comfort.\n\n"
            f"## Sources to cite\n- Your city's emissions inventory (via CityCatalyst)\n"
            f"- Your city's climate-risk assessment\n- IPCC / WRI / C40 city briefs\n\n"
            f"## Talking points\n- Our own city data shows {hazard.lower()} matters here — this "
            f"action is a practical response."
        )
    if task == "pathways":
        return (
            f"## Now (most feasible, weeks)\n- **What it is:** A resident-led first step on {a.lower()}.\n"
            f"- **Effort / cost:** low / volunteer time\n- **Who's involved:** neighbors\n"
            f"- **First move:** Gather a few neighbors this week.\n\n"
            f"## Next (a few months)\n- **What it is:** A funded neighborhood version.\n"
            f"- **Effort / cost:** medium\n- **Who's involved:** {channel}\n"
            f"- **First move:** Propose it through {channel}.\n\n"
            f"## Long-term (most ambitious, a year+)\n- **What it is:** A citywide policy or investment.\n"
            f"- **Effort / cost:** high\n- **Who's involved:** the city council\n"
            f"- **First move:** Ask your council to take it up.\n\n"
            f"These escalate — start at Now and build toward Long-term."
        )
    if task == "refine":
        return req.prior or "_(nothing to refine yet)_"
    # next_steps
    return (
        f"## Next steps\n"
        f"1. Find a neighborhood group in {c.name} already working on this.\n"
        f"2. Bring **{a}** to **{channel}** as a proposal or public comment.\n"
        f"3. Back it with your city's own climate data on {hazard.lower()}.\n"
        f"4. Invite three neighbors to join and share progress.\n\n"
        f"## Ready-to-send message\n"
        f"Hello, I'm a resident writing to ask {channel} to support **{a.lower()}** in our "
        f"neighborhood. {hazard} is a real concern here, and this is a practical, local response "
        f"that would make our area safer and healthier. Could we discuss a small first step? "
        f"Thank you, [Your name], [Neighborhood]"
    )
