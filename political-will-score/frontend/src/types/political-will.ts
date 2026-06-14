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
  sourceId?: string;
  type: string;
  sourceName: string;
  sourceUrl?: string;
  signalKey: SignalKey;
  status: EvidenceStatus;
  impact: "positive" | "negative" | "neutral";
  impactValue?: number;
  evidenceDate?: string;
  extractedClaim?: string;
  sourceExcerpt?: string;
  contractStatus?: string;
  addedBy?: string;
  confidence?: ConfidenceLevel;
  reviewerDecision?: string;
  reviewerNote?: string;
  createdAt: string;
  reviewedAt?: string;
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
  evidenceId: string;
  claim: string;
  signalKey: SignalKey;
  signalLabel: string;
  contractStatus?: string;
  impact: number;
  confidence: ConfidenceLevel;
  sourceName?: string;
  sourceUrl?: string;
  sourceExcerpt?: string;
  status?: "suggested" | "needs_review";
};

export type PoliticalWillSource = {
  id: string;
  cityId: string;
  actionId: string;
  sourceKind: "url" | "uploaded_document" | "structured_data" | "manual_note" | "web_search_result";
  sourceType: string;
  title?: string;
  url?: string;
  fileName?: string;
  fileMimeType?: string;
  fileSizeBytes?: number;
  storagePath?: string;
  contentSha256?: string;
  excerpt?: string;
  contractStatus?: string;
  dateChecked: string;
  submittedBy: string;
  reviewStatus: "unreviewed" | "analyzed" | "approved" | "rejected" | "needs_review";
  createdAt: string;
  updatedAt: string;
};

export type PoliticalWillDetail = {
  city: CityHiapData;
  action: PoliticalWillAction;
  suggestions: AiSuggestion[];
};
