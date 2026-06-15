import { FunderComunaPage } from "@/components/tool/FunderComunaPage";

export default async function Page({ params }: { params: Promise<{ locode: string }> }) {
  const { locode } = await params;
  return <FunderComunaPage slug={locode} />;
}
