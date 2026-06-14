"""EcoLogits carbon accounting for the localizer.

EcoLogits (by the GenAI Impact non-profit) estimates per-request energy (kWh)
and GHG emissions (kgCO2eq) for LLM API calls. We init it once and read the
`.impacts` attribute EcoLogits attaches to each response. When running without a
live call (mock mode), we fall back to a documented constant so the carbon
counter still moves with a defensible number.

Note: EcoLogits figures are *estimates* (generic-GPU, fixed-batch assumptions) —
directionally useful for dashboards, not audited emissions. The UI labels mocked
numbers as "estimated".
"""

_INITIALIZED = False

# Token-based estimate, used when EcoLogits can't measure (e.g. Scaleway's model
# id isn't in its registry) or in mock mode. Grounded in a small (~24B) open model
# on a low-carbon EU grid (Scaleway France ≈ 52 gCO2e/kWh).
ENERGY_WH_PER_TOKEN = 0.0009  # rough active-inference energy for a ~24B model
EU_GRID_GCO2E_PER_WH = 0.052  # France/Scaleway low-carbon grid intensity
DEFAULT_TOKENS = 350  # assumed completion length when token count is unknown


def init() -> bool:
    """Initialize EcoLogits' tracer. Safe to call repeatedly. Returns availability."""
    global _INITIALIZED
    if _INITIALIZED:
        return True
    try:
        from ecologits import EcoLogits  # type: ignore

        EcoLogits.init(providers=["openai"])
        _INITIALIZED = True
    except Exception:
        _INITIALIZED = False
    return _INITIALIZED


def _scalar(v) -> float:
    """EcoLogits values may be a float or a range object (min/max/mean)."""
    for attr in ("mean", "value"):
        inner = getattr(v, attr, None)
        if isinstance(inner, (int, float)):
            return float(inner)
    lo, hi = getattr(v, "min", None), getattr(v, "max", None)
    if isinstance(lo, (int, float)) and isinstance(hi, (int, float)):
        return (lo + hi) / 2
    return float(v) if isinstance(v, (int, float)) else 0.0


def measure(response) -> dict:
    """Read EcoLogits impacts off an OpenAI-compatible response → Wh + gCO2e.

    Falls back to a token-based estimate when EcoLogits has no data for the model
    (e.g. a non-OpenAI model served via a custom base_url like Scaleway).
    """
    try:
        impacts = response.impacts
        energy_wh = _scalar(impacts.energy.value) * 1000.0  # kWh → Wh
        gco2e = _scalar(impacts.gwp.value) * 1000.0  # kgCO2e → g
        if energy_wh > 0 or gco2e > 0:
            return {"energyWh": round(energy_wh, 4), "gCO2e": round(gco2e, 4)}
    except Exception:
        pass
    # Estimate from the completion token count when available.
    tokens = DEFAULT_TOKENS
    try:
        tokens = response.usage.completion_tokens or response.usage.total_tokens or DEFAULT_TOKENS
    except Exception:
        pass
    return estimate(tokens)


def estimate(completion_tokens: int = DEFAULT_TOKENS) -> dict:
    """Token-based estimate (no usable EcoLogits measurement)."""
    energy_wh = completion_tokens * ENERGY_WH_PER_TOKEN
    gco2e = energy_wh * EU_GRID_GCO2E_PER_WH
    return {"energyWh": round(energy_wh, 4), "gCO2e": round(gco2e, 4)}
