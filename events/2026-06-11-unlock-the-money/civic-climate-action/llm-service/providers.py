"""Provider abstraction — pick a green/cheap open-weight model via env only.

Swapping providers is a config change, not a code change. All providers expose
an OpenAI-compatible API, so the client code is identical; only base_url + model
+ key differ. Defaults point at a low-carbon EU provider (Scaleway), per the
sustainability research. For Spanish/Portuguese-critical text, route to
Salamandra (BSC, Spanish-first) or Aya Expanse.
"""
import os

# name -> (base_url, default model). All OpenAI-compatible endpoints.
PRESETS: dict[str, tuple[str, str]] = {
    # Low-carbon EU grid (Scaleway DC5, adiabatic cooling) — default green pick.
    "scaleway": ("https://api.scaleway.ai/v1", "mistral-small-3.2-24b-instruct-2506"),
    "greenpt": ("https://api.greenpt.ai/v1", "mistral-small"),
    "mistral": ("https://api.mistral.ai/v1", "mistral-small-latest"),
    "qwen": ("https://dashscope-intl.aliyuncs.com/compatible-mode/v1", "qwen-turbo"),
    # Spanish/Portuguese-critical path:
    "salamandra": ("https://api.scaleway.ai/v1", "salamandra-7b-instruct"),
    "aya": ("https://api.cohere.ai/compatibility/v1", "c4ai-aya-expanse-32b"),
    # Cheap multilingual fallback:
    "groq": ("https://api.groq.com/openai/v1", "llama-3.3-70b-versatile"),
}


def get_config() -> tuple[str, str, str, str]:
    """Return (provider, base_url, model, api_key) from env, with preset fallback."""
    provider = os.getenv("LLM_PROVIDER", "scaleway")
    base_url, default_model = PRESETS.get(provider, ("", ""))
    base_url = os.getenv("LLM_BASE_URL", base_url)
    model = os.getenv("LLM_MODEL", default_model)
    api_key = os.getenv("LLM_API_KEY", "")
    return provider, base_url, model, api_key


def is_mock() -> bool:
    """Mock when explicitly requested or when no API key is configured."""
    flag = os.getenv("LLM_MOCK", "").lower() in ("1", "true", "yes")
    return flag or not os.getenv("LLM_API_KEY")


# EcoLogits maps an OpenAI-compatible model to its impact factors. Custom
# base_urls aren't always in its registry, so we expose the provider it should
# pretend to be for estimation purposes (default: a generic open model on openai).
def ecologits_provider() -> str:
    return os.getenv("ECOLOGITS_PROVIDER", "openai")
