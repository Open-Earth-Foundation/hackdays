"use client";

import { useCallback, useState } from "react";
import type { Lang } from "../data/climateActions";
import { useCarbon } from "./carbonContext";

export type GenTask =
  | "next_steps"
  | "draft_proposal"
  | "evidence"
  | "pathways"
  | "future_vision"
  | "refine";

export type GenerateRequest = {
  task: GenTask;
  action: { name: string; description: string; type: "mitigation" | "adaptation" };
  cityContext: {
    name: string;
    country: string;
    topHazards: string[];
    topSectors: string[];
    localSources: string[];
    facts: string[];
  };
  language: Lang;
  prior?: string;
  instruction?: string;
};

export type GenResult = {
  content: string;
  energyWh: number;
  gCO2e: number;
  model: string;
  provider: string;
  mock: boolean;
};

export function useGenerate() {
  const { addUsage } = useCarbon();
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (req: GenerateRequest): Promise<GenResult | null> => {
      setLoading(true);
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        if (!res.ok) return null;
        const data: GenResult = await res.json();
        if (typeof data?.content !== "string") return null;
        addUsage(data.gCO2e ?? 0, data.energyWh ?? 0);
        return data;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addUsage]
  );

  return { run, loading };
}
