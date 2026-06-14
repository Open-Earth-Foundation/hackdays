# Political Will Score Backend

FastAPI backend for the hackday Political Will Score prototype.

## Run

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Set OPENROUTER_API_KEY in .env for LLM analysis and web search.
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

The API seeds local Warsaw demo data into `data/political_will.sqlite` on first startup.

## Runtime Data

Runtime data is intentionally ignored by git:

- `data/political_will.sqlite`
- `data/uploads/`

## LLM Provider

The backend calls OpenRouter chat completions with `google/gemini-3.5-flash`.
Source analysis uses saved source text only. Political climate search uses the OpenRouter web plugin.
