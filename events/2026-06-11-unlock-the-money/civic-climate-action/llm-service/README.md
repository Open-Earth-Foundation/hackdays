# LLM Localizer Service (green + cheap)

A small FastAPI sidecar that turns a chosen CityCatalyst HIAP action + a city's
climate profile into concrete, localized next steps (EN/ES/PT) using a **low-carbon,
open-weight** model through an OpenAI-compatible API — and reports the per-call
carbon footprint with **EcoLogits**.

The Next.js app calls it at `POST /localize`. If this service is down, the app's
route handler falls back to a built-in templated localizer, so the demo never breaks.

## Run (mock mode — no secrets)

```bash
cd llm-service
python -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic python-dotenv   # mock-mode minimum
uvicorn main:app --port 8000
```

`GET /health` → `{"mock": true, ...}`. `POST /localize` returns templated steps +
an estimated footprint. Point the app at it with `LLM_SERVICE_URL=http://localhost:8000`.

## Run (live, green model)

```bash
pip install -r requirements.txt          # adds openai + ecologits
cp .env.example .env                      # set LLM_PROVIDER + LLM_API_KEY
uvicorn main:app --port 8000
```

## Swapping models/providers (config only)

Everything is OpenAI-compatible, so changing model is **one env var** — no code
change. Presets in `providers.py`:

| `LLM_PROVIDER` | Why |
|---|---|
| `scaleway` (default) | Low-carbon EU grid (DC5, adiabatic cooling, PUE ~1.15) — the green pick |
| `greenpt` | Green AI, per-conversation CO₂, EU data residency |
| `salamandra` | BSC, Spanish-first (Apache-2.0) — ES/PT-critical path |
| `aya` | Cohere Aya Expanse — strong Spanish + Portuguese |
| `qwen` / `groq` | Cheap multilingual workhorse / fast fallback |

Override `LLM_BASE_URL` / `LLM_MODEL` for anything not in the table.

## Carbon accounting

`ecolog.py` wraps each call with EcoLogits and reads `response.impacts` →
energy (Wh) + gCO₂e. In mock mode it returns a documented estimate. EcoLogits
figures are **estimates** (generic-GPU / fixed-batch assumptions), surfaced in the
UI as "estimated" — directionally useful for the green-AI story, not audited.
