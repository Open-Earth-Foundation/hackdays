"""Green/cheap LLM localizer sidecar.

Turns a chosen CityCatalyst HIAP action + a city's climate profile into concrete,
localized, executable next steps (EN/ES/PT) using a low-carbon open-weight model
through an OpenAI-compatible API, and reports the per-call carbon footprint via
EcoLogits. Runs in mock mode with zero secrets so the demo always works.

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
from schemas import LocalizeRequest, LocalizeResponse

app = FastAPI(title="Civic Climate Action — LLM Localizer")
ecolog.init()


@app.get("/health")
def health():
    provider, _base, model, _key = providers.get_config()
    return {
        "status": "ok",
        "mock": providers.is_mock(),
        "provider": provider,
        "model": model or "mock-small",
    }


@app.post("/localize", response_model=LocalizeResponse)
def localize(req: LocalizeRequest):
    provider, base_url, model, api_key = providers.get_config()

    if providers.is_mock():
        return LocalizeResponse(
            localizedSteps=mock_steps(req),
            model=model or "mock-small",
            provider=provider,
            mock=True,
            **ecolog.estimate(),
        )

    # Real path: OpenAI-compatible call, wrapped by EcoLogits.
    from openai import OpenAI

    client = OpenAI(base_url=base_url, api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": _system(req.language)},
            {"role": "user", "content": _prompt(req)},
        ],
        temperature=0.4,
        max_tokens=400,
    )
    text = resp.choices[0].message.content or ""
    impacts = ecolog.measure(resp)
    return LocalizeResponse(
        localizedSteps=_parse_steps(text),
        model=model,
        provider=provider,
        mock=False,
        **impacts,
    )


# ---------------------------------------------------------------------------
# Prompt construction
# ---------------------------------------------------------------------------
_LANG_NAME = {"en": "English", "es": "Spanish", "pt": "Brazilian Portuguese"}


def _system(language: str) -> str:
    lang = _LANG_NAME.get(language, "English")
    return (
        f"You are a civic-engagement assistant. Reply ONLY in {lang}. "
        "Turn a city climate action into 4 short, concrete, executable next steps "
        "a resident can actually take. Each step one sentence, imperative, no preamble. "
        "Return a numbered list, nothing else."
    )


def _prompt(req: LocalizeRequest) -> str:
    c = req.cityContext
    hazards = ", ".join(c.topHazards[:3]) or "n/a"
    sectors = ", ".join(c.topSectors[:3]) or "n/a"
    return (
        f"City: {c.name}, {c.country}\n"
        f"Top climate hazards: {hazards}\n"
        f"Top emitting sectors: {sectors}\n"
        f"Action ({req.action.type}): {req.action.name}\n"
        f"Description: {req.action.description[:400]}\n\n"
        "Give 4 concrete next steps a resident of this city can take to push this "
        "action forward (join a group, attend a meeting, submit a comment, start "
        "something small). Ground them in the city's hazards/sectors above."
    )


def _parse_steps(text: str) -> list[str]:
    import re

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    steps = [re.sub(r"^\s*(?:\d+[\.\)]|[-*•])\s*", "", l) for l in lines]
    steps = [s for s in steps if len(s) > 8]
    return steps[:4] if steps else [text.strip()]


# ---------------------------------------------------------------------------
# Mock localization (no key) — mirrors the Next.js route fallback.
# ---------------------------------------------------------------------------
_FOCUS = {
    "heat": ("las olas de calor", "as ondas de calor"),
    "landslide": ("los deslizamientos", "os deslizamentos"),
    "flood": ("las inundaciones", "as inundações"),
    "drought": ("la sequía", "a seca"),
    "disease": ("las enfermedades", "as doenças"),
    "sea-level": ("el aumento del nivel del mar", "a elevação do nível do mar"),
    "storm": ("las tormentas", "as tempestades"),
    "wildfire": ("los incendios", "os incêndios"),
    "transport": ("el transporte", "o transporte"),
    "energy": ("la energía", "a energia"),
    "waste": ("los residuos", "os resíduos"),
    "stationary": ("la energía", "a energia"),
}


def _focus(raw: str, lang: str) -> str:
    s = raw.lower()
    if lang == "en":
        return s
    for key, (es, pt) in _FOCUS.items():
        if key in s:
            return es if lang == "es" else pt
    return s


def mock_steps(req: LocalizeRequest) -> list[str]:
    c = req.cityContext
    lang = req.language
    raw = (c.topHazards[0] if req.action.type == "adaptation" else None) or (
        c.topSectors[0] if c.topSectors else "climate"
    )
    focus = _focus(raw, lang)
    action = req.action.name
    if lang == "es":
        return [
            f"Identifica en {c.name} a un grupo vecinal o colectivo que ya trabaje en {focus}.",
            f'Asiste a la próxima sesión del consejo municipal donde se discuta "{action}".',
            "Presenta esta acción como propuesta o comentario público, citando el riesgo local.",
            "Invita a tres vecinos a sumarse y comparte el avance en tu comunidad.",
        ]
    if lang == "pt":
        return [
            f"Identifique em {c.name} um grupo de bairro ou coletivo que já atue em {focus}.",
            f'Participe da próxima sessão do conselho municipal onde "{action}" for discutida.',
            "Apresente esta ação como proposta ou comentário público, citando o risco local.",
            "Convide três vizinhos para participar e compartilhe o progresso na sua comunidade.",
        ]
    return [
        f"Find a neighborhood group or collective in {c.name} already working on {focus}.",
        f'Attend the next city-council session where "{action}" is on the agenda.',
        "Submit this action as a proposal or public comment, citing the local risk.",
        "Invite three neighbors to join and share progress in your community.",
    ]
