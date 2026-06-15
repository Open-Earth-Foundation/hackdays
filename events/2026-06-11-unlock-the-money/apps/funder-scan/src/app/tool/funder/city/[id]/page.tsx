import { notFound } from "next/navigation";
import { FunderCityProfile } from "@/components/tool/FunderCityProfile";
import { getCity } from "@/lib/tool/cities";

export default async function FunderCityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const city = getCity(Number(id));
  if (!city) notFound();
  return <FunderCityProfile city={city} />;
}
