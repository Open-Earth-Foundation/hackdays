"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FunderComunaProfile } from "@/components/tool/FunderComunaProfile";
import {
  loadChileComunas,
  loadChileFunds,
  loadValdiviaDetail,
  loadValdiviaInstruments,
} from "@/lib/tool/chile-data";
import { slugToLocode } from "@/lib/tool/chile-regions";
import type { ChileComuna, ChileFund, ValdiviaDetail, ValdiviaInstrument } from "@/lib/tool/types";

export function FunderComunaPage({ slug }: { slug: string }) {
  const [comunas, setComunas] = useState<ChileComuna[]>([]);
  const [funds, setFunds] = useState<ChileFund[]>([]);
  const [valdiviaInstruments, setValdiviaInstruments] = useState<ValdiviaInstrument[]>([]);
  const [valdiviaDetail, setValdiviaDetail] = useState<ValdiviaDetail | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const locode = slugToLocode(slug);
    const isValdivia = locode === "CL ZAL";

    Promise.all([
      loadChileComunas(),
      loadChileFunds(),
      loadValdiviaInstruments(),
      isValdivia ? loadValdiviaDetail() : Promise.resolve(null),
    ])
      .then(([c, f, vi, vd]) => {
        setComunas(c);
        setFunds(f);
        setValdiviaInstruments(vi);
        setValdiviaDetail(vd);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [slug]);

  if (!ready) {
    return (
      <div className="comuna-loading">
        <i className="ti ti-loader" /> Loading comuna profile…
      </div>
    );
  }

  const locode = slugToLocode(slug);
  const comuna = comunas.find((c) => c.locode === locode);
  if (!comuna) notFound();

  return (
    <FunderComunaProfile
      comuna={comuna}
      allComunas={comunas}
      funds={funds}
      valdiviaInstruments={valdiviaInstruments}
      valdiviaDetail={valdiviaDetail}
    />
  );
}
