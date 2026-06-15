"use client";

import { useEffect, useMemo, useState } from "react";
import { loadMatcherData } from "./chile-data";
import { buildReadinessGaps, matchCity } from "./match-engine";
import type { ChileComuna, ChileFund, InstrumentMatch, ReadinessGap, ValdiviaInstrument, WizardState } from "./types";

export function useChileMatch(wizard: WizardState) {
  const [comunas, setComunas] = useState<ChileComuna[]>([]);
  const [funds, setFunds] = useState<ChileFund[]>([]);
  const [valdivia, setValdivia] = useState<ValdiviaInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMatcherData()
      .then((data) => {
        if (cancelled) return;
        setComunas(data.comunas);
        setFunds(data.funds);
        setValdivia(data.valdivia);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load matcher data");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedComuna = useMemo(() => {
    if (!comunas.length) return undefined;
    if (wizard.locode) return comunas.find((c) => c.locode === wizard.locode);
    if (wizard.comuna) return comunas.find((c) => c.name === wizard.comuna);
    return undefined;
  }, [comunas, wizard.locode, wizard.comuna]);

  const matches: InstrumentMatch[] = useMemo(() => {
    if (loading || !funds.length) return [];
    return matchCity(wizard, resolvedComuna, funds, valdivia);
  }, [wizard, resolvedComuna, funds, valdivia, loading]);

  const readinessGaps: ReadinessGap[] = useMemo(
    () => buildReadinessGaps(wizard, resolvedComuna),
    [wizard, resolvedComuna],
  );

  const engineLabel =
    wizard.locode === "CL ZAL" || wizard.comuna === "Valdivia"
      ? "Valdivia engine (full action match)"
      : "Chile catalog (sector + capacity heuristic)";

  return {
    matches,
    readinessGaps,
    comuna: resolvedComuna,
    loading,
    error,
    engineLabel,
    fundCount: funds.length,
  };
}
