"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { defaultWizardState, type WizardState } from "./types";

interface ToolContextValue {
  wizard: WizardState;
  patchWizard: (patch: Partial<WizardState>) => void;
  selectedInstrument: number;
  setSelectedInstrument: (n: number) => void;
  funderStep: number;
  setFunderStep: (n: number) => void;
  step1Summary: string;
  step2Summary: string;
}

const ToolContext = createContext<ToolContextValue | null>(null);

export function ToolProvider({ children }: { children: ReactNode }) {
  const [wizard, setWizard] = useState<WizardState>(defaultWizardState);
  const [selectedInstrument, setSelectedInstrument] = useState(0);
  const [funderStep, setFunderStep] = useState(1);

  const patchWizard = (patch: Partial<WizardState>) =>
    setWizard((w) => ({ ...w, ...patch }));

  const step1Summary = useMemo(() => {
    const parts = [
      wizard.funding || "Any",
      wizard.sectors.length ? wizard.sectors.slice(0, 2).join(", ") : "Any sector",
      wizard.urgency.includes("now") ? "Active" : wizard.urgency ? "Exploring" : "",
    ].filter(Boolean);
    return parts.join(" · ");
  }, [wizard]);

  const step2Summary = useMemo(() => {
    const pop = wizard.population ? wizard.population.split(" ")[0] : "Medium";
    const fiscal = wizard.fiscal ? wizard.fiscal.charAt(0) : "B";
    const cap = wizard.capacity ? wizard.capacity.split("—")[0].trim() : "Med";
    const place = wizard.comuna ? `${wizard.comuna}, Chile` : wizard.country || "City";
    return `${place} · ${pop} · Fiscal ${fiscal} · ${cap} capacity`;
  }, [wizard]);

  return (
    <ToolContext.Provider
      value={{
        wizard,
        patchWizard,
        selectedInstrument,
        setSelectedInstrument,
        funderStep,
        setFunderStep,
        step1Summary,
        step2Summary,
      }}
    >
      {children}
    </ToolContext.Provider>
  );
}

export function useTool() {
  const ctx = useContext(ToolContext);
  if (!ctx) throw new Error("useTool must be used within ToolProvider");
  return ctx;
}
