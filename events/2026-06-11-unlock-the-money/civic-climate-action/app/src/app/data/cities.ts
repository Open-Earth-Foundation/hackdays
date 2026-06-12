import type { City } from "./types";

// Shared note for the Brazilian inventories: the CityCatalyst territorial
// totals don't yet capture every sector (notably grid electricity / scope 2),
// which makes transport look larger than its true share. Surfaced honestly.
const BR_PARTIAL_NOTE =
  "Partial territorial inventory — grid electricity and some waste aren't captured yet, so transport's share is overstated.";

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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 3208337,
      topSector: "Transportation",
      inventoryYear: "2016",
      source: "Medellín Climate Action Plan (PAC 2020–2050)",
      sourceUrl:
        "https://www.medellin.gov.co/es/wp-content/uploads/2024/03/PAC_Medellin_Libro_Digital.pdf",
    },
    risk: {
      topHazards: [
        { hazard: "Landslides", level: "High" },
        { hazard: "Flooding & flash floods", level: "High" },
        { hazard: "Extreme heat & urban heat island", level: "Medium" },
      ],
      summary:
        "Set in a steep Andean valley, Medellín's main risks are rain-triggered landslides and flooding on its hillsides, with intensifying urban heat in low-vegetation neighborhoods.",
      source: "Alcaldía de Medellín / World Bank",
      sourceUrl:
        "https://www.medellin.gov.co/es/wp-content/uploads/2024/03/PAC_Medellin_Libro_Digital.pdf",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 10839378,
      topSector: "Transportation",
      inventoryYear: "2023",
      source: "Bogotá GHG Inventory (Secretaría de Ambiente)",
      sourceUrl:
        "https://www.ambientebogota.gov.co/inventario-de-gases-de-efecto-invernadero-ingei",
    },
    risk: {
      topHazards: [
        { hazard: "Water shortage & drought", level: "High" },
        { hazard: "Flooding & flash floods", level: "High" },
        { hazard: "Landslides", level: "Medium" },
      ],
      summary:
        "Bogotá faces recurring water-supply crises during El Niño droughts, plus flooding and landslides on its rivers and hillside settlements.",
      source: "IDIGER / IDEAM",
      sourceUrl: "https://www.idiger.gov.co/cambio-climatico/efectos-de-cambios-climaticos-en-bogota",
    },
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
    dataProvenance: "CityCatalyst",
    emissions: {
      totalTonnesCo2e: 2409000,
      sectors: [
        { sector: "Transportation", sharePct: 82.3 },
        { sector: "Stationary Energy", sharePct: 11.3 },
        { sector: "Waste", sharePct: 6.1 },
      ],
      inventoryYear: "2023 / 2022 (waste)",
      note: BR_PARTIAL_NOTE,
      source: "CityCatalyst Global API (SEEG, SINIR, SNIS)",
      sourceUrl: "https://api.citycatalyst.io",
    },
    risk: {
      topHazards: [
        { hazard: "Diseases", keyImpact: "public health", level: "Very High" },
        { hazard: "Floods", keyImpact: "infrastructure", level: "Very High" },
      ],
      year: 2024,
      source: "CityCatalyst CCRA",
      sourceUrl: "https://api.citycatalyst.io",
    },
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
    dataProvenance: "CityCatalyst",
    emissions: {
      totalTonnesCo2e: 8565000,
      sectors: [
        { sector: "Transportation", sharePct: 47.1 },
        { sector: "IPPU", sharePct: 32.8 },
        { sector: "Waste", sharePct: 11.8 },
        { sector: "Stationary Energy", sharePct: 8.5 },
      ],
      inventoryYear: "2023 / 2022 (waste)",
      note: BR_PARTIAL_NOTE,
      source: "CityCatalyst Global API (SEEG, SINIR, SNIS)",
      sourceUrl: "https://api.citycatalyst.io",
    },
    risk: {
      topHazards: [
        { hazard: "Heatwaves", keyImpact: "infrastructure", level: "Very High" },
        { hazard: "Landslides", keyImpact: "infrastructure", level: "Very High" },
      ],
      year: 2024,
      source: "CityCatalyst CCRA",
      sourceUrl: "https://api.citycatalyst.io",
    },
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
    dataProvenance: "CityCatalyst",
    emissions: {
      totalTonnesCo2e: 11663000,
      sectors: [
        { sector: "Transportation", sharePct: 81.1 },
        { sector: "Stationary Energy", sharePct: 11.1 },
        { sector: "Waste", sharePct: 8.1 },
      ],
      inventoryYear: "2023 / 2022 (waste)",
      note: BR_PARTIAL_NOTE,
      source: "CityCatalyst Global API (SEEG, SINIR, SNIS)",
      sourceUrl: "https://api.citycatalyst.io",
    },
    risk: {
      topHazards: [
        { hazard: "Heatwaves", keyImpact: "infrastructure", level: "Very High" },
        { hazard: "Landslides", keyImpact: "infrastructure", level: "Very High" },
      ],
      year: 2024,
      source: "CityCatalyst CCRA",
      sourceUrl: "https://api.citycatalyst.io",
    },
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
    dataProvenance: "CityCatalyst",
    emissions: {
      totalTonnesCo2e: 1491000,
      sectors: [
        { sector: "Transportation", sharePct: 77.1 },
        { sector: "Stationary Energy", sharePct: 15.4 },
        { sector: "Waste", sharePct: 7.4 },
      ],
      inventoryYear: "2023 / 2022 (waste)",
      note: BR_PARTIAL_NOTE,
      source: "CityCatalyst Global API (SEEG, SINIR, SNIS)",
      sourceUrl: "https://api.citycatalyst.io",
    },
    risk: {
      topHazards: [
        { hazard: "Landslides", keyImpact: "infrastructure", level: "Very High" },
        { hazard: "Floods", keyImpact: "infrastructure", level: "Very High" },
      ],
      year: 2024,
      source: "CityCatalyst CCRA",
      sourceUrl: "https://api.citycatalyst.io",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 2200000,
      topSector: "Transportation",
      inventoryYear: "2019",
      note: "Municipality proper (~545k residents), not the metro area.",
      source: "Lisbon Climate City Contract 2030",
      sourceUrl:
        "https://netzerocities.app/_content/files/knowledge/4423/lx_contratoclimatico_10___1_.pdf",
    },
    risk: {
      topHazards: [
        { hazard: "Extreme heat", level: "High" },
        { hazard: "Drought", level: "High" },
        { hazard: "Flooding & coastal flooding", level: "Medium" },
      ],
      summary:
        "With a Mediterranean climate, Lisbon's main risks are intensifying heatwaves and drought, alongside flash flooding and rising coastal exposure.",
      source: "Lisbon Metro Adaptation Plan (PMAAC)",
      sourceUrl: "https://www.aml.pt/en/iniciativas/plano-adaptacao-alteracoes-climaticas/",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 52340000,
      topSector: "Buildings / Energy",
      inventoryYear: "2005",
      note: "2005 baseline — the most recent officially verifiable city-wide total.",
      source: "Seoul Metropolitan Government",
      sourceUrl:
        "https://english.seoul.go.kr/seoul-aims-to-cut-carbon-emissions-by-50-percent-from-2005-levels-by-2033-to-lower-temperatures/",
    },
    risk: {
      topHazards: [
        { hazard: "Urban & river flooding", level: "High" },
        { hazard: "Extreme heat", level: "Medium" },
      ],
      summary:
        "Seoul's dominant climate risk is intense monsoon-season urban flooding (its worst in over a century hit in 2022), compounded by worsening summer heatwaves.",
      source: "Seoul Metropolitan Government",
      sourceUrl: "https://seoulsolution.kr/en/content/seoul%E2%80%99s-flood-control-policy",
    },
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
    dataProvenance: "external",
    emissions: null,
    risk: {
      topHazards: [
        { hazard: "Drought & forest dieback", level: "High" },
        { hazard: "Extreme heat", level: "Medium" },
        { hazard: "Storms", level: "Medium" },
      ],
      summary:
        "In the Black Forest, the leading threats are drought- and heat-driven forest dieback (record tree mortality since 2018) plus more frequent storms. No city-level inventory exists for a town this small.",
      source: "Uni Freiburg / Baden-Württemberg climate projections",
      sourceUrl:
        "https://kommunikation.uni-freiburg.de/pm-en/press-releases-2023/tree-mortality-in-the-black-forest-on-the-rise-climate-change-a-key-driver",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 48000000,
      topSector: "Buildings / Energy",
      inventoryYear: "2024",
      note: "Buildings are about two-thirds of emissions; ~25% below 2005.",
      source: "NYC Mayor's Office of Climate (MOCEJ)",
      sourceUrl: "https://climate.cityofnewyork.us/initiatives/nyc-greenhouse-gas-inventories/",
    },
    risk: {
      topHazards: [
        { hazard: "Coastal flooding & storm surge", level: "High" },
        { hazard: "Sea-level rise", level: "High" },
        { hazard: "Extreme heat", level: "High" },
      ],
      summary:
        "NYC's main risks are coastal and storm-surge flooding amplified by sea-level rise, plus more frequent extreme-heat events and heavy-rainfall flooding.",
      source: "NYC Panel on Climate Change (NPCC4)",
      sourceUrl:
        "https://climateassessment.nyc/assessment/nyc-climate-risk-information-2022-observations-and-projections/",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 15100000,
      topSector: "Industry (manufacturing & construction)",
      inventoryYear: "2021",
      source: "Ahmedabad Municipal Corp / ICLEI (CRCAP)",
      sourceUrl:
        "https://www.cities-and-regions.org/wp-content/uploads/2023-ahmedabad-climate-resilient-city-action-plan-compressed.pdf",
    },
    risk: {
      topHazards: [
        { hazard: "Extreme heat", level: "High" },
        { hazard: "Flooding", level: "Medium" },
        { hazard: "Water scarcity & drought", level: "Medium" },
      ],
      summary:
        "Ahmedabad's defining risk is deadly extreme heat — it launched South Asia's first Heat Action Plan after a 2010 heatwave — alongside monsoon flooding and water scarcity.",
      source: "Ahmedabad Heat Action Plan / NRDC",
      sourceUrl: "https://www.nrdc.org/sites/default/files/ahmedabad-heat-action-plan-2019-update.pdf",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 21200000,
      topSector: "Industry / Energy (port cluster)",
      inventoryYear: "2025",
      note: "Port-industrial cluster total — dominated by heavy industry, not comparable per-capita.",
      source: "Port of Rotterdam / DCMR",
      sourceUrl:
        "https://www.portofrotterdam.com/en/news-and-press-releases/co2e-emissions-rotterdam-port-area-rose-2025-due-increased-electricity",
    },
    risk: {
      topHazards: [
        { hazard: "River & coastal flooding", level: "High" },
        { hazard: "Sea-level rise", level: "High" },
        { hazard: "Extreme heat", level: "Medium" },
      ],
      summary:
        "Largely below sea level on a river delta, Rotterdam's central risk is flooding from sea-level rise, storm surge and extreme rainfall, with growing summer-heat stress.",
      source: "Rotterdam Climate Adaptation Strategy",
      sourceUrl: "https://www.urbangreenbluegrids.com/uploads/RCI_-RAS_UK_-DEF.pdf",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 470968,
      inventoryYear: "2023",
      perCapitaTonnes: 0.7,
      source: "City of Copenhagen CO₂ accounts",
      sourceUrl: "https://www.opendata.dk/city-of-copenhagen/co2-regnskab",
    },
    risk: {
      topHazards: [
        { hazard: "Cloudburst & extreme-rain flooding", level: "High" },
        { hazard: "Storm surge & sea-level rise", level: "Medium" },
      ],
      summary:
        "Copenhagen's leading risk is sudden cloudburst flooding from extreme rainfall (a 2011 storm caused major damage), plus rising storm-surge and sea-level threats.",
      source: "Copenhagen Cloudburst Management Plan",
      sourceUrl:
        "https://climate-adapt.eea.europa.eu/en/metadata/case-studies/the-economics-of-managing-heavy-rains-and-stormwater-in-copenhagen-2013-the-cloudburst-management-plan",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 30010000,
      topSector: "Stationary energy",
      inventoryYear: "2022",
      source: "London Datastore (GLA · LEGGI)",
      sourceUrl: "https://data.london.gov.uk/dataset/leggi/",
    },
    risk: {
      topHazards: [
        { hazard: "Surface-water & river flooding", level: "High" },
        { hazard: "Extreme heat & overheating", level: "High" },
        { hazard: "Drought", level: "Medium" },
      ],
      summary:
        "London's core climate risks are flooding (surface-water, tidal and fluvial), overheating during more frequent heatwaves, and drought-driven water stress.",
      source: "GLA London Climate Resilience Review",
      sourceUrl:
        "https://www.london.gov.uk/programmes-strategies/environment-and-climate-change/climate-change/climate-adaptation/london-climate-resilience-review",
    },
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
    dataProvenance: "external",
    emissions: {
      totalTonnesCo2e: 5070000,
      topSector: "Buildings / Energy",
      inventoryYear: "2022",
      perCapitaTonnes: 2.5,
      note: "In-territory emissions; full footprint incl. imports ≈ 18.7 Mt.",
      source: "Ville de Paris / APUR – Bilan Carbone",
      sourceUrl: "https://www.paris.fr/pages/les-emissions-de-gaz-a-effet-de-serre-de-paris-29491",
    },
    risk: {
      topHazards: [
        { hazard: "Extreme heat", level: "High" },
        { hazard: "Seine river flooding", level: "Medium" },
        { hazard: "Drought", level: "Medium" },
      ],
      summary:
        "Paris's foremost risk is intensifying urban heatwaves, alongside major Seine river-flooding potential and increasing summer drought.",
      source: "Ville de Paris – Paris Climate Action Plan",
      sourceUrl: "https://cdn.paris.fr/paris/2021/11/16/088fcde428650ff1e3d9680f155a54a7.pdf",
    },
  },
];
