"""Request/response models for the generation service."""
from pydantic import BaseModel, Field


class ActionIn(BaseModel):
    name: str
    description: str = ""
    type: str = "adaptation"  # "mitigation" | "adaptation"


class CityContext(BaseModel):
    name: str
    country: str = ""
    topHazards: list[str] = Field(default_factory=list)  # e.g. "Heatwaves (Very High)"
    topSectors: list[str] = Field(default_factory=list)  # e.g. "Transportation (81%)"
    localSources: list[str] = Field(default_factory=list)  # real civic channel names
    facts: list[str] = Field(default_factory=list)  # plain factual lines from city data


# task: next_steps | draft_proposal | evidence | pathways | future_vision | refine
class GenerateRequest(BaseModel):
    task: str = "next_steps"
    action: ActionIn
    cityContext: CityContext
    language: str = "en"  # en | es | pt
    prior: str = ""  # prior content (for refine)
    instruction: str = ""  # refinement instruction (for refine)


class GenerateResponse(BaseModel):
    content: str  # markdown
    energyWh: float
    gCO2e: float
    model: str
    provider: str
    mock: bool
