"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Carbon = {
  totalGramsCO2e: number;
  totalWh: number;
  callCount: number;
  addUsage: (gCO2e: number, energyWh: number) => void;
};

const CarbonCtx = createContext<Carbon | null>(null);

export function CarbonProvider({ children }: { children: React.ReactNode }) {
  const [totalGramsCO2e, setG] = useState(0);
  const [totalWh, setWh] = useState(0);
  const [callCount, setCount] = useState(0);

  const addUsage = useCallback((g: number, wh: number) => {
    setG((p) => p + (g || 0));
    setWh((p) => p + (wh || 0));
    setCount((p) => p + 1);
  }, []);

  const value = useMemo(
    () => ({ totalGramsCO2e, totalWh, callCount, addUsage }),
    [totalGramsCO2e, totalWh, callCount, addUsage]
  );

  return <CarbonCtx.Provider value={value}>{children}</CarbonCtx.Provider>;
}

export function useCarbon(): Carbon {
  const ctx = useContext(CarbonCtx);
  if (!ctx) throw new Error("useCarbon must be used within <CarbonProvider>");
  return ctx;
}
