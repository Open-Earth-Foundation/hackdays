"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FunderComunaProfile } from "@/components/tool/FunderComunaProfile";
import { loadChileComunas } from "@/lib/tool/chile-data";
import { slugToLocode } from "@/lib/tool/chile-regions";
import type { ChileComuna } from "@/lib/tool/types";

export function FunderComunaPage({ slug }: { slug: string }) {
  const [comunas, setComunas] = useState<ChileComuna[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadChileComunas()
      .then((c) => {
        setComunas(c);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) {
    return <p style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>Loading…</p>;
  }

  const locode = slugToLocode(slug);
  const comuna = comunas.find((c) => c.locode === locode);
  if (!comuna) notFound();

  return <FunderComunaProfile comuna={comuna} allComunas={comunas} />;
}
