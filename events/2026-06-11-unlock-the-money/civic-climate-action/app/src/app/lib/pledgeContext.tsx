"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Ctx = {
  count: (cityId: string) => number;
  pledge: (cityId: string) => Promise<void>;
  loaded: boolean;
};

const PledgeCtx = createContext<Ctx | null>(null);

export function PledgeProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((d) => setCounts(d.counts ?? {}))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const pledge = useCallback(async (cityId: string) => {
    setCounts((c) => ({ ...c, [cityId]: (c[cityId] ?? 0) + 1 })); // optimistic
    try {
      const res = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId }),
      });
      const d = await res.json();
      if (typeof d.count === "number") setCounts((c) => ({ ...c, [cityId]: d.count }));
    } catch {
      /* keep optimistic value */
    }
  }, []);

  const count = useCallback((cityId: string) => counts[cityId] ?? 0, [counts]);

  const value = useMemo(() => ({ count, pledge, loaded }), [count, pledge, loaded]);
  return <PledgeCtx.Provider value={value}>{children}</PledgeCtx.Provider>;
}

export function usePledges(): Ctx {
  const ctx = useContext(PledgeCtx);
  if (!ctx) throw new Error("usePledges must be used within <PledgeProvider>");
  return ctx;
}
