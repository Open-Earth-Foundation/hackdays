"""Request/response models for the localizer service."""
from pydantic import BaseModel, Field


class ActionIn(BaseModel):
    name: str
    description: str = ""
    type: str = "adaptation"  # "mitigation" | "adaptation"


class CityContext(BaseModel):
    name: str
    country: str = ""
    topHazards: list[str] = Field(default_factory=list)
    topSectors: list[str] = Field(default_factory=list)
    localSources: list[str] = Field(default_factory=list)


class LocalizeRequest(BaseModel):
    action: ActionIn
    cityContext: CityContext
    language: str = "en"  # en | es | pt


class LocalizeResponse(BaseModel):
    localizedSteps: list[str]
    energyWh: float
    gCO2e: float
    model: str
    provider: str
    mock: bool
