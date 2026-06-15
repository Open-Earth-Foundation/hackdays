import Link from "next/link";
import { notFound } from "next/navigation";
import { HiapPageClient } from "@/components/hiap/HiapPageClient";
import { getCityHiapData } from "@/data/political-will";
import { fetchCityHiapData } from "@/lib/political-will/api";

type PageProps = {
  params: Promise<{ cityId: string }>;
};

export default async function HiapPage({ params }: PageProps) {
  const { cityId } = await params;
  const data =
    (await fetchCityHiapData(cityId).catch(() => undefined)) ?? getCityHiapData(cityId);

  if (!data) {
    notFound();
  }

  return (
    <main className="page-content">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/hiap">HIAP</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Top actions</span>
        </nav>
        <h1 className="page-title">Top actions for {data.cityName}</h1>
        <p className="page-subtitle">Source-backed actions with political will checks</p>
      </header>
      <HiapPageClient data={data} />
    </main>
  );
}
