"use client";

import { useCallback, useState } from "react";
import type { Lang } from "../data/climateActions";
import { useCarbon } from "./carbonContext";

export type LocalizeRequest = {
  action: { name: string; description: string; type: "mitigation" | "adaptation" };
  cityContext: { name: string; country: string; topHazards: string[]; topSectors: string[] };
  language: Lang;
};

export type LocalizeResult = {
  localizedSteps: string[];
  energyWh: number;
  gCO2e: number;
  model: string;
  provider: string;
  mock: boolean;
};

export function useLocalize() {
  const { addUsage } = useCarbon();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocalizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (req: LocalizeRequest) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/localize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        const data: LocalizeResult = await res.json();
        setResult(data);
        addUsage(data.gCO2e, data.energyWh);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [addUsage]
  );

  return { run, loading, result, error };
}
