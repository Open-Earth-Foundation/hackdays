import { notFound } from "next/navigation";
import { PoliticalDetailsClient } from "@/components/political-details/PoliticalDetailsClient";
import { aiSuggestions, getAction, getCityHiapData } from "@/data/political-will";
import { fetchPoliticalWillDetail } from "@/lib/political-will/api";
import type { PoliticalWillDetail } from "@/types/political-will";

type PageProps = {
  params: Promise<{ cityId: string; actionId: string }>;
};

export default async function PoliticalDetailsPage({ params }: PageProps) {
  const { cityId, actionId } = await params;
  const apiDetail = await fetchPoliticalWillDetail(cityId, actionId).catch(() => undefined);
  const city = getCityHiapData(cityId);
  const action = getAction(cityId, actionId);
  const fallbackDetail: PoliticalWillDetail | undefined =
    city && action
      ? {
          city,
          action,
          suggestions: aiSuggestions,
        }
      : undefined;
  const detail = apiDetail ?? fallbackDetail;

  if (!detail) {
    notFound();
  }

  return <PoliticalDetailsClient cityId={cityId} initialDetail={detail} />;
}
