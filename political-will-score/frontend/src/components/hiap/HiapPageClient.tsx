"use client";

import { useMemo, useState } from "react";
import { FindActionsPanel } from "@/components/hiap/FindActionsPanel";
import { PoliticalActionInspector } from "@/components/hiap/PoliticalActionInspector";
import { SelectedActionTable } from "@/components/hiap/SelectedActionTable";
import { SummaryTiles } from "@/components/hiap/SummaryTiles";
import type { CityHiapData } from "@/types/political-will";

type HiapPageClientProps = {
  data: CityHiapData;
};

export function HiapPageClient({ data }: HiapPageClientProps) {
  const [selectedActionId, setSelectedActionId] = useState<string | null>(
    data.actions[0]?.id ?? null
  );

  const selectedAction = useMemo(
    () => data.actions.find((action) => action.id === selectedActionId) ?? null,
    [data.actions, selectedActionId]
  );

  return (
    <>
      <SummaryTiles data={data} />
      <FindActionsPanel />
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SelectedActionTable
            actions={data.actions}
            selectedActionId={selectedActionId}
            onSelectAction={setSelectedActionId}
          />
        </div>
        <PoliticalActionInspector
          cityId={data.cityId}
          action={selectedAction}
          onClose={() => setSelectedActionId(null)}
        />
      </div>
    </>
  );
}
