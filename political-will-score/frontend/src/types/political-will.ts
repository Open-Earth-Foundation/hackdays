export type ConfidenceLevel = "low" | "medium" | "high";

export type SignalKey =
  | "budgetFollowThrough"
  | "electionExposure"
  | "institutionalContinuity"
  | "publicCommitment";

export type EvidenceStatus =
  | "suggested"
  | "verified"
  | "needs_review"
  | "rejected"
  | "missing";

export type PoliticalWillSignal = {
  key: SignalKey;
  label: string;
  weight: number;
  score: number;
  status: "verified" | "needs_review" | "missing";
  evidenceIds: string[];
};

export type PoliticalWillEvidence = {
  id: string;
  actionId: string;
  type: string;
  sourceName: string;
  sourceUrl?: string;
  signalKey: SignalKey;
  status: EvidenceStatus;
  impact: "positive" | "negative" | "neutral";
  impactValue?: number;
  evidenceDate?: string;
  extractedClaim?: string;
  contractStatus?: string;
  addedBy?: string;
  createdAt: string;
};

export type PoliticalWillAuditEvent = {
  id: string;
  actionId: string;
  actorName: string;
  eventType: string;
  message: string;
  createdAt: string;
};

export type PoliticalWillAction = {
  id: string;
  rank: number;
  title: string;
  sector: string;
  sectorIcon: string;
  sourceName: string;
  sourceUrl: string;
  sourceCheckedDate: string;
  selected: boolean;
  score: number;
  confidence: ConfidenceLevel;
  evidenceComplete: number;
  evidenceExpected: number;
  pendingReview: number;
  topDataGap: string | null;
  signals: PoliticalWillSignal[];
  evidence: PoliticalWillEvidence[];
  auditLog: PoliticalWillAuditEvent[];
};

export type CityHiapData = {
  cityId: string;
  cityName: string;
  actionConfidence: number;
  sourceBackedActions: number;
  evidenceGaps: number;
  pendingReview: number;
  actions: PoliticalWillAction[];
};

export type AiSuggestion = {
  id: string;
  claim: string;
  signalKey: SignalKey;
  signalLabel: string;
  contractStatus?: string;
  impact: number;
  confidence: ConfidenceLevel;
};
