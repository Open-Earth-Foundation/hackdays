import actionCatalog from "./action-catalog.json";
import type {
  AiSuggestion,
  CityHiapData,
  ConfidenceLevel,
  PoliticalWillAction,
  PoliticalWillEvidence,
  PoliticalWillSignal,
  SignalKey,
} from "@/types/political-will";

type CatalogAction = {
  id: string;
  rank: number;
  title: string;
  sector: string;
  sectorIcon: string;
  sourceName: string;
  sourceUrl: string;
  sourceCheckedDate: string;
  sourceExcerpt: string;
  score: number;
  confidence: ConfidenceLevel;
  topDataGap: string | null;
};

type CatalogCity = {
  cityId: string;
  cityName: string;
  actions: CatalogAction[];
};

const signalLabels: Record<SignalKey, string> = {
  budgetFollowThrough: "Budget follow-through",
  electionExposure: "Election exposure",
  institutionalContinuity: "Institutional continuity",
  publicCommitment: "Public commitment",
};

const signalWeights: Record<SignalKey, number> = {
  budgetFollowThrough: 0.35,
  electionExposure: 0.25,
  institutionalContinuity: 0.25,
  publicCommitment: 0.15,
};

const gapToSignal: Record<string, SignalKey> = {
  "Budget follow-through": "budgetFollowThrough",
  "Election exposure": "electionExposure",
  "Institutional continuity": "institutionalContinuity",
  "Public commitment": "publicCommitment",
};

const citywidePoliticalEvents: Record<
  string,
  Array<{
    id: string;
    sourceName: string;
    sourceUrl: string;
    signalKey: SignalKey;
    impactValue: number;
    confidence: ConfidenceLevel;
    evidenceDate: string;
    claim: string;
    sourceExcerpt: string;
  }>
> = {
  krakow: [
    {
      id: "mayor-recall-notes-from-poland",
      sourceName: "Notes from Poland",
      sourceUrl: "https://notesfrompoland.com/2026/05/25/mayor-of-krakow-dismissed-in-rare-recall-referendum/",
      signalKey: "electionExposure",
      impactValue: -35,
      confidence: "high",
      evidenceDate: "25 May 2026",
      claim:
        "Krakow Mayor Aleksander Miszalski was removed from office in a recall referendum on 24 May 2026 after criticism including the clean transport zone, public finances, and governance.",
      sourceExcerpt:
        "Notes from Poland reported that Krakow's mayor was dismissed in a rare recall referendum, with criticism including the city's clean transport zone, finances, and governance.",
    },
    {
      id: "mayor-recall-polskie-radio",
      sourceName: "Polskie Radio",
      sourceUrl: "https://www.polskieradio.pl/395/7784/artykul/3690942%2Ckrakow-mayor-ousted-in-recall-referendum",
      signalKey: "electionExposure",
      impactValue: -30,
      confidence: "high",
      evidenceDate: "25 May 2026",
      claim:
        "Polskie Radio reported that residents voted to remove Krakow Mayor Aleksander Miszalski, with more than 171,000 votes in favor of removal.",
      sourceExcerpt:
        "Polskie Radio described the mayoral recall result and listed public criticism over debt, cronyism, election promises, clean transport policy, ticket prices, and parking rules.",
    },
    {
      id: "mayor-recall-tvp-world",
      sourceName: "TVP World",
      sourceUrl: "https://tvpworld.com/93467997/why-polands-right-wing-thinks-krakow-mayor-miszalskis-recall-is-start-of-a-wave",
      signalKey: "institutionalContinuity",
      impactValue: -12,
      confidence: "medium",
      evidenceDate: "1 Jun 2026",
      claim:
        "TVP World reported that the Krakow mayoral recall could become a broader opposition campaign signal, creating continuity risk for city policy delivery.",
      sourceExcerpt:
        "TVP World framed the Krakow recall as a political signal beyond one local contest, relevant to continuity and implementation risk.",
    },
  ],
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildSignals(action: CatalogAction): PoliticalWillSignal[] {
  const rows: Array<[SignalKey, number, PoliticalWillSignal["status"]]> = [
    ["budgetFollowThrough", clamp(action.score - 8), "needs_review"],
    ["electionExposure", clamp(action.score - 14), "needs_review"],
    ["institutionalContinuity", clamp(action.score - 4), "needs_review"],
    ["publicCommitment", clamp(action.score + 8), "verified"],
  ];
  const gapSignal = action.topDataGap ? gapToSignal[action.topDataGap] : undefined;

  return rows.map(([key, score, status]) => ({
    key,
    label: signalLabels[key],
    weight: signalWeights[key],
    score,
    status: key === gapSignal ? "missing" : status,
    evidenceIds: key === "publicCommitment" ? [`ev-catalog-${action.id}`] : [],
  }));
}

function buildCitywideEvidence(cityId: string, actionId: string): PoliticalWillEvidence[] {
  return (citywidePoliticalEvents[cityId] ?? []).map((event) => ({
    id: `ev-citywide-${event.id}-${actionId}`,
    actionId,
    sourceId: `src-citywide-${event.id}-${actionId}`,
    type: "news_article",
    sourceName: event.sourceName,
    sourceUrl: event.sourceUrl,
    signalKey: event.signalKey,
    status: "suggested",
    impact: "negative",
    impactValue: event.impactValue,
    evidenceDate: event.evidenceDate,
    extractedClaim: event.claim,
    sourceExcerpt: event.sourceExcerpt,
    addedBy: "Seed catalog",
    confidence: event.confidence,
    createdAt: "2026-06-15T00:00:00Z",
  }));
}

function buildAction(cityId: string, action: CatalogAction): PoliticalWillAction {
  const citywideEvidence = buildCitywideEvidence(cityId, action.id);

  return {
    id: action.id,
    rank: action.rank,
    title: action.title,
    sector: action.sector,
    sectorIcon: action.sectorIcon,
    sourceName: action.sourceName,
    sourceUrl: action.sourceUrl,
    sourceCheckedDate: action.sourceCheckedDate,
    selected: true,
    score: action.score,
    confidence: action.confidence,
    evidenceComplete: 1,
    evidenceExpected: 4,
    pendingReview: citywideEvidence.length,
    topDataGap: action.topDataGap,
    signals: buildSignals(action),
    evidence: [
      {
        id: `ev-catalog-${action.id}`,
        actionId: action.id,
        sourceId: `src-catalog-${action.id}`,
        type: "action_source",
        sourceName: action.sourceName,
        sourceUrl: action.sourceUrl,
        signalKey: "publicCommitment",
        status: "verified",
        impact: "positive",
        impactValue: 8,
        evidenceDate: action.sourceCheckedDate,
        extractedClaim: action.title,
        sourceExcerpt: action.sourceExcerpt,
        addedBy: "Seed catalog",
        confidence: action.confidence,
        reviewerDecision: "approved",
        createdAt: "2026-06-15T00:00:00Z",
        reviewedAt: "2026-06-15T00:00:00Z",
      },
      ...citywideEvidence,
    ],
    auditLog: [],
  };
}

function buildCityData(city: CatalogCity): CityHiapData {
  const actions = city.actions.map((action) => buildAction(city.cityId, action));
  const actionConfidence = Math.round(
    actions.reduce((total, action) => total + action.score, 0) / actions.length
  );
  const evidenceGaps = actions.reduce(
    (total, action) => total + action.signals.filter((signal) => signal.status === "missing").length,
    0
  );
  const pendingReview = actions.reduce((total, action) => total + action.pendingReview, 0);

  return {
    cityId: city.cityId,
    cityName: city.cityName,
    actionConfidence,
    sourceBackedActions: actions.length,
    evidenceGaps,
    pendingReview,
    actions,
  };
}

export const aiSuggestions: AiSuggestion[] = [];

const cities = actionCatalog.cities as CatalogCity[];
const cityData: Record<string, CityHiapData> = Object.fromEntries(
  cities.map((city) => [city.cityId, buildCityData(city)])
);

export function getCityHiapData(cityId: string): CityHiapData | undefined {
  return cityData[cityId];
}

export function getAction(cityId: string, actionId: string) {
  const city = getCityHiapData(cityId);
  return city?.actions.find((action) => action.id === actionId);
}

export function getSuggestionsForAction(cityId: string, actionId: string): AiSuggestion[] {
  return buildCitywideEvidence(cityId, actionId).map((evidence) => ({
    id: evidence.id,
    evidenceId: evidence.id,
    claim: evidence.extractedClaim ?? "Untitled suggested evidence",
    signalKey: evidence.signalKey,
    signalLabel: signalLabels[evidence.signalKey],
    impact: evidence.impactValue ?? 0,
    confidence: evidence.confidence ?? "medium",
    sourceName: evidence.sourceName,
    sourceUrl: evidence.sourceUrl,
    sourceExcerpt: evidence.sourceExcerpt,
    status: "suggested",
  }));
}
