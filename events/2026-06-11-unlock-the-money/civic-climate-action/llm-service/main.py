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
    "draft_proposal": 800,
    "evidence": 700,
    "pathways": 800,
    "future_vision": 380,
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
        "You are a civic-engagement assistant for city residents. Produce a short plan of 4-6 "
        "concrete next steps an ordinary resident can take over the coming weeks to push this "
        "action forward (join a group, attend a meeting, submit a public comment, start something "
        "small). Each step: one imperative sentence; where a step involves government or a group, "
        "name a real local channel from the context. Return ONLY a numbered Markdown list."
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
        "You are a futures designer using Experiential Futures (\"a day in the life\"). Write ONE "
        "short, vivid, hopeful-but-plausible vision of this city in the NEAR future (about 3-7 "
        "years) AFTER this action has taken hold. Output Markdown, ~150-220 words, in exactly three "
        "parts and nothing else:\n"
        "1. A short **bold title** (6-10 words) naming the changed place/feeling — no 'Vision:' label.\n"
        "2. One present-tense paragraph (~110-160 words) from one ordinary resident's point of view "
        "during a normal moment of their day (a bus stop, a school run, a market). Make it sensory "
        "and human; show 2-3 of the city's real hazards/sectors visibly easing. Keep it partial and "
        "local ('this block', 'your corner'), the result of residents and named local channels — "
        "not a miracle. Introduce no hazards, places, or numbers not in the context.\n"
        "3. One closing line, italicized, starting 'First ripple:' — a single concrete knock-on "
        "effect that plausibly follows. One sentence.\n"
        "No other headings, no bullet lists, no statistics."
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
    return f"{_context_block(req)}\n\nNow produce the requested output."


# ---------------------------------------------------------------------------
# Mock content (no key) — concise templated markdown per task.
# ---------------------------------------------------------------------------
def mock_content(req: GenerateRequest, task: str) -> str:
    c = req.cityContext
    a = req.action.name
    channel = c.localSources[0] if c.localSources else "your city council"
    hazard = c.topHazards[0] if c.topHazards else "local climate risk"
    if task == "future_vision":
        return (
            f"**A cooler, calmer corner of {c.name}**\n\n"
            f"A few years from now you walk your usual block in {c.name} and it simply feels "
            f"better cared for — more shade, cleaner air, fewer worries when the rain comes hard. "
            f"The change started small, pushed by neighbors through {channel}, and it shows: "
            f"{a.lower()} has quietly reshaped the everyday. It isn't finished, but your corner "
            f"feels looked after.\n\n"
            f"*First ripple: the next block asks for the same, and the idea spreads.*"
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
        f"1. Find a neighborhood group in {c.name} already working on this.\n"
        f"2. Bring **{a}** to **{channel}** as a proposal or public comment.\n"
        f"3. Back it with your city's own climate data.\n"
        f"4. Invite three neighbors to join and share progress."
    )
