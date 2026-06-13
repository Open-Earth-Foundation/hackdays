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

# Fallback for mock mode: a small open model, short completion, low-carbon EU
# grid. ~0.8 Wh / ~0.3 gCO2e per call. Kept in sync with the JS route fallback.
MOCK_ENERGY_WH = 0.8
MOCK_GCO2E = 0.3


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
    """Read EcoLogits impacts off an OpenAI-compatible response → Wh + gCO2e."""
    try:
        impacts = response.impacts
        energy_wh = _scalar(impacts.energy.value) * 1000.0  # kWh → Wh
        gco2e = _scalar(impacts.gwp.value) * 1000.0  # kgCO2e → g
        if energy_wh > 0 or gco2e > 0:
            return {"energyWh": round(energy_wh, 4), "gCO2e": round(gco2e, 4)}
    except Exception:
        pass
    return estimate()


def estimate() -> dict:
    """Mock-mode estimate (no live call)."""
    return {"energyWh": MOCK_ENERGY_WH, "gCO2e": MOCK_GCO2E}
