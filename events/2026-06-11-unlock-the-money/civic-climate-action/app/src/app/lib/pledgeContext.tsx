"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CityAggregate, PublicPledge, PledgeStatus } from "./pledgeStore"; // type-only

const emptyAggregate = (): CityAggregate => ({ total: 0, sent: 0, responded: 0, actions: [] });

export type SignInput = {
  cityId: string;
  actionId: string;
  worryLabel: string;
  headline: string;
  firstName: string;
  neighborhood: string;
  email?: string;
};

type Ctx = {
  aggregate: (cityId: string) => CityAggregate;
  sign: (input: SignInput) => Promise<PublicPledge | null>;
  setStatus: (id: string, cityId: string, status: PledgeStatus) => Promise<void>;
  loaded: boolean;
};

const PledgeCtx = createContext<Ctx | null>(null);

export function PledgeProvider({ children }: { children: React.ReactNode }) {
  const [cities, setCities] = useState<Record<string, CityAggregate>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? {}))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const sign = useCallback(async (input: SignInput): Promise<PublicPledge | null> => {
    // optimistic bump
    setCities((c) => {
      const m = c[input.cityId] ?? emptyAggregate();
      const actions = m.actions.includes(input.actionId) ? m.actions : [...m.actions, input.actionId];
      return { ...c, [input.cityId]: { ...m, total: m.total + 1, actions } };
    });
    try {
      const res = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const d = await res.json();
      if (d?.aggregate) setCities((c) => ({ ...c, [input.cityId]: d.aggregate }));
      return d?.pledge ?? null;
    } catch {
      return null; // keep optimistic value
    }
  }, []);

  const setStatus = useCallback(async (id: string, cityId: string, status: PledgeStatus) => {
    try {
      const res = await fetch("/api/pledge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const d = await res.json();
      if (d?.aggregate) setCities((c) => ({ ...c, [cityId]: d.aggregate }));
    } catch {
      /* server unreachable — local tracker still advances */
    }
  }, []);

  const aggregate = useCallback((cityId: string) => cities[cityId] ?? emptyAggregate(), [cities]);

  const value = useMemo(() => ({ aggregate, sign, setStatus, loaded }), [aggregate, sign, setStatus, loaded]);
  return <PledgeCtx.Provider value={value}>{children}</PledgeCtx.Provider>;
}

export function usePledges(): Ctx {
  const ctx = useContext(PledgeCtx);
  if (!ctx) throw new Error("usePledges must be used within <PledgeProvider>");
  return ctx;
}
