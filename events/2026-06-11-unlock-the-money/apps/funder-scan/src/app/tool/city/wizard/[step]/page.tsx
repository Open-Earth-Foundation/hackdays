import { notFound } from "next/navigation";
import { CityWizard } from "@/components/tool/CityWizard";

export default async function CityWizardPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  const n = parseInt(step, 10);
  if (n < 1 || n > 3) notFound();
  return <CityWizard step={n as 1 | 2 | 3} />;
}
