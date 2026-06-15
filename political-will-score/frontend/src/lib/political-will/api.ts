import type {
  CityHiapData,
  ConfidenceLevel,
  PoliticalWillDetail,
  PoliticalWillSource,
  SignalKey,
} from "@/types/political-will";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type SourceCreatePayload = {
  sourceKind: "url" | "manual_note";
  sourceType: string;
  title?: string;
  url?: string;
  rawText?: string;
  contractStatus?: string;
  submittedBy?: string;
};

type SourceResponse = {
  source: PoliticalWillSource;
  detail: PoliticalWillDetail;
};

export type EvidenceUpdatePayload = {
  claim?: string;
  signalKey?: SignalKey;
  impact?: number;
  confidence?: ConfidenceLevel;
  contractStatus?: string | null;
  sourceExcerpt?: string;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers:
      init?.body instanceof FormData
        ? init.headers
        : {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
          },
  });

  if (!response.ok) {
    let message = `API request failed with ${response.status}`;
    try {
      const payload = await response.json();
      message = typeof payload.detail === "string" ? payload.detail : message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchCityHiapData(cityId: string): Promise<CityHiapData> {
  return apiFetch<CityHiapData>(`/api/v1/cities/${cityId}/hiap`);
}

export async function fetchPoliticalWillDetail(
  cityId: string,
  actionId: string
): Promise<PoliticalWillDetail> {
  return apiFetch<PoliticalWillDetail>(
    `/api/v1/cities/${cityId}/hiap/actions/${actionId}/political-will`
  );
}

export async function createSource(
  cityId: string,
  actionId: string,
  payload: SourceCreatePayload
): Promise<SourceResponse> {
  return apiFetch<SourceResponse>(
    `/api/v1/cities/${cityId}/hiap/actions/${actionId}/political-will/sources`,
    {
      method: "POST",
      body: JSON.stringify({ submittedBy: "Demo reviewer", ...payload }),
    }
  );
}

export async function uploadSource(
  cityId: string,
  actionId: string,
  payload: {
    file: File;
    sourceType: string;
    contractStatus?: string;
  }
): Promise<SourceResponse> {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("sourceType", payload.sourceType);
  form.append("submittedBy", "Demo reviewer");
  if (payload.contractStatus) {
    form.append("contractStatus", payload.contractStatus);
  }

  return apiFetch<SourceResponse>(
    `/api/v1/cities/${cityId}/hiap/actions/${actionId}/political-will/sources/upload`,
    {
      method: "POST",
      body: form,
    }
  );
}

export async function analyzeSource(
  cityId: string,
  actionId: string,
  sourceId: string
): Promise<PoliticalWillDetail> {
  return apiFetch<PoliticalWillDetail>(
    `/api/v1/cities/${cityId}/hiap/actions/${actionId}/political-will/sources/${sourceId}/analyze`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export async function reviewEvidence(
  cityId: string,
  actionId: string,
  evidenceId: string,
  decision: "approve" | "reject" | "needs-review"
): Promise<PoliticalWillDetail> {
  return apiFetch<PoliticalWillDetail>(
    `/api/v1/cities/${cityId}/hiap/actions/${actionId}/political-will/evidence/${evidenceId}/${decision}`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export async function updateEvidence(
  cityId: string,
  actionId: string,
  evidenceId: string,
  payload: EvidenceUpdatePayload
): Promise<PoliticalWillDetail> {
  return apiFetch<PoliticalWillDetail>(
    `/api/v1/cities/${cityId}/hiap/actions/${actionId}/political-will/evidence/${evidenceId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ submittedBy: "Demo reviewer", ...payload }),
    }
  );
}

export async function searchPoliticalClimate(
  cityId: string,
  actionId: string,
  payload: { recencyDays: number; queryTerms?: string }
): Promise<PoliticalWillDetail> {
  return apiFetch<PoliticalWillDetail>(
    `/api/v1/cities/${cityId}/hiap/actions/${actionId}/political-will/news-search`,
    {
      method: "POST",
      body: JSON.stringify({ submittedBy: "Demo reviewer", ...payload }),
    }
  );
}
