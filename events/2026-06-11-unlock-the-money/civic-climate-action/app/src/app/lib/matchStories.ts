// Match real success stories to a chosen action (data-driven, no LLM) for the
// "Examples" lens — so a resident sees where this kind of action already worked.

import type { ClimateAction } from "../data/climateActions";
import type { Story, Category } from "../data/types";

function categoriesFor(action: ClimateAction): Set<Category> {
  const out = new Set<Category>();
  for (const s of action.sectors) {
    if (/transport|mobil|road/.test(s)) out.add("Mobility");
    if (/energy/.test(s)) out.add("Energy");
    if (/waste/.test(s)) out.add("Waste");
    if (/afolu|land|forest|biodiv|green/.test(s)) out.add("Greening");
    if (/water|flood|geo|disaster|resilien/.test(s)) out.add("Resilience");
    if (/air|health/.test(s)) {
      out.add("AirQuality");
      out.add("Resilience");
    }
  }
  for (const h of action.hazards) {
    if (h === "heatwaves" || h === "wildfires") {
      out.add("Greening");
      out.add("Resilience");
    } else {
      out.add("Resilience"); // floods, landslides, storms, sea-level-rise, droughts, diseases
    }
  }
  if (out.size === 0) out.add(action.actionType === "adaptation" ? "Resilience" : "Participation");
  return out;
}

export function matchStories(action: ClimateAction, stories: Story[], limit = 4): Story[] {
  const cats = categoriesFor(action);
  const primary = stories.filter((s) => cats.has(s.category));
  // Always offer at least one "how change happened" participation example.
  const participation = stories.filter(
    (s) => s.category === "Participation" && !primary.includes(s)
  );
  const seen = new Set<string>();
  const out: Story[] = [];
  for (const s of [...primary, ...participation]) {
    if (out.length >= limit) break;
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
  }
  return out;
}
