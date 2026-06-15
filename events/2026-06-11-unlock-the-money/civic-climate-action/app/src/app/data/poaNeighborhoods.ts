// Approximate coordinates for Porto Alegre neighborhoods, used to plot where
// engagement is happening on the map. Names are matched accent-insensitively;
// neighborhoods we don't have coordinates for are simply not plotted (they still
// appear in the bar breakdown).

export const POA_CENTER: [number, number] = [-30.043, -51.2];

const COORDS: Record<string, [number, number]> = {
  "centro historico": [-30.0277, -51.2287],
  "cidade baixa": [-30.0436, -51.2225],
  "bom fim": [-30.033, -51.208],
  "menino deus": [-30.056, -51.223],
  "moinhos de vento": [-30.025, -51.205],
  petropolis: [-30.044, -51.185],
  partenon: [-30.056, -51.17],
  azenha: [-30.051, -51.215],
  santana: [-30.049, -51.205],
  "santa cecilia": [-30.045, -51.213],
  floresta: [-30.015, -51.212],
  "sao geraldo": [-30.008, -51.22],
  navegantes: [-29.999, -51.21],
  sarandi: [-29.976, -51.123],
  restinga: [-30.156, -51.145],
  "lomba do pinheiro": [-30.11, -51.11],
  cavalhada: [-30.095, -51.235],
  ipanema: [-30.124, -51.236],
  tristeza: [-30.11, -51.248],
  "rubem berta": [-29.99, -51.15],
  agronomia: [-30.07, -51.12],
  gloria: [-30.09, -51.21],
  "vila nova": [-30.11, -51.18],
  cristal: [-30.08, -51.235],
};

// Strip combining diacritics (U+0300–U+036F) without embedding them in source.
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(DIACRITICS, "").trim();
}

export function neighborhoodCoords(name: string): [number, number] | null {
  return COORDS[norm(name)] ?? null;
}
