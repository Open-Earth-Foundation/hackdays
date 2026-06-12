import type { City } from "./types";

// Seed set of cities where citizens have shaped local climate action.
// Each links to a sourced success story (see stories.ts). `locode` is the
// UN/LOCODE — the same key CityCatalyst uses — so a city can later be wired
// to live GHGI / CCRA / HIAP data from the CityCatalyst Global API.

export const cities: City[] = [
  {
    id: "medellin",
    name: "Medellín",
    country: "Colombia",
    lat: 6.2476,
    lng: -75.5658,
    locode: "CO MDE",
    summary:
      "Residents from low-income neighborhoods became the city's gardeners, building green corridors that measurably cooled the streets.",
    highlights: [
      "Join a neighborhood greening or tree-care crew",
      "Request a green corridor for a hot, treeless street",
      "Train as a community gardener through the city program",
    ],
    storyIds: ["medellin-green-corridors"],
  },
  {
    id: "bogota",
    name: "Bogotá",
    country: "Colombia",
    lat: 4.711,
    lng: -74.0721,
    locode: "CO BOG",
    summary:
      "A 1970s citizen bike protest became Ciclovía — a weekly ritual that hands the streets back to people and inspired 400+ cities.",
    highlights: [
      "Ride or volunteer at the weekly open-streets event",
      "Map an unsafe cycling route with a mobility collective",
      "Back protected bike lanes in public consultations",
    ],
    storyIds: ["bogota-ciclovia"],
  },
  {
    id: "curitiba",
    name: "Curitiba",
    country: "Brazil",
    lat: -25.4284,
    lng: -49.2733,
    locode: "BR CWB",
    summary:
      "Households swap sorted recyclables for fresh produce through 'Green Exchange,' making citizen sorting the backbone of recycling.",
    highlights: [
      "Sort and bring recyclables to a Green Exchange station",
      "Start or join a neighborhood composting hub",
      "Support organics-collection in the city budget",
    ],
    storyIds: ["curitiba-green-exchange"],
  },
  {
    id: "rio-de-janeiro",
    name: "Rio de Janeiro",
    country: "Brazil",
    lat: -22.9068,
    lng: -43.1729,
    locode: "BR RIO",
    summary:
      "Favela residents were trained to reforest landslide-prone hillsides, planting millions of native seedlings since 1986.",
    highlights: [
      "Join a community reforestation crew",
      "Help stabilize a landslide-prone slope near you",
      "Volunteer for a watershed or resilience council",
    ],
    storyIds: ["rio-favela-reforestation"],
  },
  {
    id: "sao-paulo",
    name: "São Paulo",
    country: "Brazil",
    lat: -23.5558,
    lng: -46.6396,
    locode: "BR SAO",
    summary:
      "Neighbors turned a dump in a protected zone into a thriving community garden — feeding the area and resisting eviction.",
    highlights: [
      "Start or join a community garden on idle land",
      "Organize neighbors around a shared green space",
      "Document local green space to protect it",
    ],
    storyIds: ["saopaulo-community-garden"],
  },
  {
    id: "porto-alegre",
    name: "Porto Alegre",
    country: "Brazil",
    lat: -30.0346,
    lng: -51.2177,
    locode: "BR POA",
    summary:
      "The birthplace of participatory budgeting: residents vote on real spending, expanding water and sanitation citywide.",
    highlights: [
      "Take part in a participatory-budget assembly",
      "Propose a climate project for neighborhood funding",
      "Rally neighbors to vote for it",
    ],
    storyIds: ["portoalegre-participatory-budget"],
  },
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    lat: 38.7223,
    lng: -9.1393,
    locode: "PT LIS",
    summary:
      "Lisbon refocused its participatory budget on climate — citizens fund cycle lanes, tree planting and rainwater capture.",
    highlights: [
      "Submit a green project to the participatory budget",
      "Vote for climate-focused proposals",
      "Join a tree-planting or rewilding initiative",
    ],
    storyIds: ["lisbon-green-budget"],
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    lat: 37.5665,
    lng: 126.978,
    locode: "KR SEL",
    summary:
      "Citizens powered the 'One Less Nuclear Power Plant' campaign, cutting energy use and installing community solar.",
    highlights: [
      "Join an energy-saving rewards scheme",
      "Co-invest in a community solar project",
      "Run a building energy-efficiency drive",
    ],
    storyIds: ["seoul-one-less-plant"],
  },
  {
    id: "schonau",
    name: "Schönau",
    country: "Germany",
    lat: 47.7869,
    lng: 7.9018,
    summary:
      "A small town's residents bought their own power grid and built a citizen-owned clean-energy cooperative.",
    highlights: [
      "Join or start an energy cooperative",
      "Pool funds for community-owned renewables",
      "Campaign for local control of the grid",
    ],
    storyIds: ["schonau-electricity-rebels"],
  },
  {
    id: "new-york-city",
    name: "New York City",
    country: "United States",
    lat: 40.6451,
    lng: -74.0185,
    locode: "US NYC",
    summary:
      "A women-led group in Sunset Park, Brooklyn built the city's first cooperatively owned community solar project.",
    highlights: [
      "Organize neighbors around community solar",
      "Bring multilingual outreach to your block",
      "Sign up lower-income households for bill savings",
    ],
    storyIds: ["nyc-sunset-park-solar"],
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    country: "India",
    lat: 23.0225,
    lng: 72.5714,
    locode: "IN AMD",
    summary:
      "Women in informal settlements became climate leaders — spreading heat warnings and cool-roof paint under South Asia's first Heat Action Plan.",
    highlights: [
      "Train neighbors on heat-warning response",
      "Coat roofs with heat-reflective paint",
      "Map the hottest, most exposed homes",
    ],
    storyIds: ["ahmedabad-heat-action"],
  },
  {
    id: "rotterdam",
    name: "Rotterdam",
    country: "Netherlands",
    lat: 51.9244,
    lng: 4.4777,
    locode: "NL RTM",
    summary:
      "Neighbors co-designed the world's first 'water square' — a public plaza that absorbs storm water to prevent flooding.",
    highlights: [
      "Join a co-design workshop for public space",
      "Push for rain gardens and permeable surfaces",
      "Adopt a street planter or water feature",
    ],
    storyIds: ["rotterdam-water-square"],
  },
  {
    id: "copenhagen",
    name: "Copenhagen",
    country: "Denmark",
    lat: 55.6761,
    lng: 12.5683,
    locode: "DK CPH",
    summary:
      "Østerbro residents launched 170+ grassroots projects to green their district and manage heavy rain locally.",
    highlights: [
      "Propose a pocket park or green roof",
      "Start a citizen rainwater-management project",
      "Join the neighborhood climate group",
    ],
    storyIds: ["copenhagen-climate-quarter"],
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    lat: 51.5072,
    lng: -0.1276,
    locode: "GB LON",
    summary:
      "Schools and community groups measured their own air and won 'School Streets' that cut traffic and pollution.",
    highlights: [
      "Host a low-cost air-quality sensor",
      "Campaign for a School Street near you",
      "Use the data to push for safer streets",
    ],
    storyIds: ["london-breathe-air"],
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    locode: "FR PAR",
    summary:
      "A randomly selected citizens' assembly deliberated and wrote climate proposals that fed into national law.",
    highlights: [
      "Join or call for a local citizens' assembly",
      "Deliberate concrete climate measures with experts",
      "Track which proposals become policy",
    ],
    storyIds: ["paris-citizens-convention"],
  },
];
