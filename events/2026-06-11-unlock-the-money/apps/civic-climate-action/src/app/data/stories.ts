import type { Story } from "./types";

// Real, sourced civic climate action success stories used as inspiration.
// Researched and fact-checked June 2026. Headline numbers were cross-checked;
// where a figure was uncertain it is described qualitatively. A few cases
// (Curitiba, Seoul) are city programs that depended heavily on citizen
// participation rather than being purely citizen-originated — worded honestly.

export const stories: Story[] = [
  {
    id: "medellin-green-corridors",
    city: "Medellín",
    country: "Colombia",
    lat: 6.2476,
    lng: -75.5658,
    title: "Green corridors cool the city",
    category: "Greening",
    whatCitizensDid:
      "People from low-income neighborhoods were trained and hired as city gardeners to build and tend a network of green corridors along streets and waterways, planting and maintaining hundreds of thousands of trees and millions of smaller plants.",
    outcome:
      "Across 30 green corridors, average temperatures fell from about 31.6°C to 27.1°C (2016–2019), with ~880,000 trees and 2.5 million plants established and 107 people from disadvantaged communities trained as gardeners.",
    year: "2016–2019",
    sourceName: "SEforALL",
    sourceUrl:
      "https://www.seforall.org/stories-of-success/creating-a-greener-cooler-and-healthier-medellin",
  },
  {
    id: "bogota-ciclovia",
    city: "Bogotá",
    country: "Colombia",
    lat: 4.711,
    lng: -74.0721,
    title: "Ciclovía: streets for people",
    category: "Mobility",
    whatCitizensDid:
      "In 1974 residents and activists staged a mass bike demonstration to reclaim car-dominated streets, closing about 5 km of road for a few hours. The protest grew into a weekly ritual the city later made official.",
    outcome:
      "Today 120+ km of Bogotá's roads close to cars every Sunday, drawing roughly 1.5–2 million people weekly, and the model has inspired open-streets programs in 400+ cities worldwide.",
    year: "1974–present",
    sourceName: "WRI · TheCityFix",
    sourceUrl:
      "https://thecityfix.com/blog/ciclovia-at-50-what-we-can-learn-from-bogotas-open-streets-initiative/",
  },
  {
    id: "curitiba-green-exchange",
    city: "Curitiba",
    country: "Brazil",
    lat: -25.4284,
    lng: -49.2733,
    title: "Trade trash for food",
    category: "Waste",
    whatCitizensDid:
      "Residents in areas trucks couldn't reach bring sorted recyclables to neighborhood stations and swap them for fresh fruit and vegetables through the city's 'Câmbio Verde' (Green Exchange). High household participation made citizen sorting the backbone of recycling.",
    outcome:
      "By 2007 the exchange had diverted 45,000+ tons of waste from landfills across ~100 trading sites; in the early 1990s the related recycling effort reached about 70% household participation.",
    year: "1991–present",
    sourceName: "NYC Food Policy Center",
    sourceUrl:
      "https://www.nycfoodpolicy.org/green-exchange-program-curitiba-urban-food-policy-snapshot/",
  },
  {
    id: "rio-favela-reforestation",
    city: "Rio de Janeiro",
    country: "Brazil",
    lat: -22.9068,
    lng: -43.1729,
    title: "Favela residents reforest the hills",
    category: "Resilience",
    whatCitizensDid:
      "Through a community reforestation program, favela residents were contracted and trained to replant degraded hillsides with native Atlantic rainforest species — turning barren, landslide-prone slopes back into forest.",
    outcome:
      "Since 1986 the program has planted 6+ million seedlings across ~2,200 hectares in 58 communities, restoring shade, improving soil and water, and reducing mudslide risk.",
    year: "1986–present",
    sourceName: "World Bank Blogs",
    sourceUrl:
      "https://blogs.worldbank.org/en/latinamerica/rio-de-janeiros-reforestation-changes-life-favelas",
  },
  {
    id: "saopaulo-community-garden",
    city: "São Paulo",
    country: "Brazil",
    lat: -23.5558,
    lng: -46.6396,
    title: "A garden to resist eviction",
    category: "Greening",
    whatCitizensDid:
      "In the Vila Nova Esperança favela, resident Maria de Lourdes Andrade Silva and neighbors transformed a dump in an environmental protection zone into a community garden over more than a decade, using sustainability as both livelihood and a defense against demolition.",
    outcome:
      "The community turned the site into a roughly 0.5-hectare green garden, strengthening their case against eviction and supplying food and green space to residents.",
    year: "2010s–present",
    sourceName: "The Sustainable Post",
    sourceUrl:
      "https://www.thesustainablepost.com/2025/08/sao-paulo-favela-community-garden-eviction-resistance.html",
  },
  {
    id: "portoalegre-participatory-budget",
    city: "Porto Alegre",
    country: "Brazil",
    lat: -30.0346,
    lng: -51.2177,
    title: "Citizens set the city budget",
    category: "Participation",
    whatCitizensDid:
      "From 1989, activists and residents pushed the city to let ordinary people debate and vote on how part of the municipal budget is spent. Neighborhood assemblies prioritized basic infrastructure like water, sanitation and schools.",
    outcome:
      "Participatory budgeting helped expand sewerage from 46% to about 86% of the city and brought treated water to nearly all residents; the model has since spread to 2,700+ governments worldwide.",
    year: "1989–present",
    sourceName: "World Resources Institute",
    sourceUrl:
      "https://www.wri.org/insights/what-if-citizens-set-city-budgets-experiment-captivated-world-participatory-budgeting",
  },
  {
    id: "lisbon-green-budget",
    city: "Lisbon",
    country: "Portugal",
    lat: 38.7223,
    lng: -9.1393,
    title: "Citizens fund a greener city",
    category: "Participation",
    whatCitizensDid:
      "Residents propose and vote on projects funded by a dedicated slice of the city budget, which Lisbon refocused into a 'green' participatory budget after winning European Green Capital 2020. Winning ideas include cycle lanes, tree planting and rainwater capture.",
    outcome:
      "Between 2008 and 2018 over 303,000 citizens voted and about €36.3 million was invested; the green phase delivered dozens of climate-focused projects.",
    year: "2008–present",
    sourceName: "People Powered",
    sourceUrl:
      "https://www.peoplepowered.org/resources-content/green-participatory-budgeting-lisbon-portugal",
  },
  {
    id: "seoul-one-less-plant",
    city: "Seoul",
    country: "South Korea",
    lat: 37.5665,
    lng: 126.978,
    title: "One Less Nuclear Power Plant",
    category: "Energy",
    whatCitizensDid:
      "Citizens helped design and drive a city campaign to cut energy use and generate solar power, joining an 'Eco-Mileage' rewards scheme and installing rooftop and community solar. The policy was deliberately built as civic-participatory governance.",
    outcome:
      "Seoul cut energy consumption by 2.04 million tonnes of oil equivalent by mid-2014 — meeting its target six months early — with Eco-Mileage reaching about 1.7 million members.",
    year: "2012–2014",
    sourceName: "Wikipedia (Seoul Metro Gov / C40)",
    sourceUrl: "https://en.wikipedia.org/wiki/One_Less_Nuclear_Power_Plant",
  },
  {
    id: "schonau-electricity-rebels",
    city: "Schönau",
    country: "Germany",
    lat: 47.7869,
    lng: 7.9018,
    title: "The electricity rebels",
    category: "Energy",
    whatCitizensDid:
      "After Chernobyl, Schönau residents organized referenda and a fundraising drive to wrest control of their local power grid from a utility unwilling to drop nuclear, forming a citizen-owned cooperative to supply clean energy.",
    outcome:
      "The citizens won the right to operate and buy the grid (1997); their cooperative EWS now supplies clean energy to over 185,000 people across Germany and owns wind and solar assets.",
    year: "1986–present",
    sourceName: "Centre for Public Impact",
    sourceUrl:
      "https://centreforpublicimpact.org/public-impact-fundamentals/community-energy-cooperative-schonau-germany/",
  },
  {
    id: "nyc-sunset-park-solar",
    city: "New York City",
    country: "United States",
    lat: 40.6451,
    lng: -74.0185,
    title: "Sunset Park's community solar",
    category: "Energy",
    whatCitizensDid:
      "The women-led, multiracial community group UPROSE ran local meetings, door-to-door outreach and multilingual materials to build NYC's first cooperatively owned community solar project, on the Brooklyn Army Terminal roof, designed to benefit a lower-income, majority-immigrant neighborhood.",
    outcome:
      "The project is expected to deliver bill savings to ~200 households and generate about 19.6 million kWh over 25 years, avoiding an estimated 13,056 tons of CO₂e.",
    year: "2021–present",
    sourceName: "C40 Cities",
    sourceUrl: "https://www.c40.org/case-studies/nyc-sunset-park-solar/",
  },
  {
    id: "ahmedabad-heat-action",
    city: "Ahmedabad",
    country: "India",
    lat: 23.0225,
    lng: 72.5714,
    title: "Women beat the heat",
    category: "Resilience",
    whatCitizensDid:
      "The Mahila Housing Trust mobilized women in informal settlements to monitor heat warnings, educate neighbors, and coat roofs of low-income homes with heat-reflective 'cool roof' paint as part of South Asia's first Heat Action Plan.",
    outcome:
      "A peer-reviewed study found the Heat Action Plan saves roughly 1,100–1,190 lives per year versus pre-2013 levels; the model has reached 125,000+ people across 100+ slums in several South Asian cities.",
    year: "2013–present",
    sourceName: "Exemplars in Global Health",
    sourceUrl: "https://www.exemplars.health/stories/ahmedabad-indias-heat-action-plan",
  },
  {
    id: "rotterdam-water-square",
    city: "Rotterdam",
    country: "Netherlands",
    lat: 51.9244,
    lng: 4.4777,
    title: "A square that drinks the rain",
    category: "Resilience",
    whatCitizensDid:
      "Neighbors, students, teachers, a church and local sports groups joined three design workshops to co-create Benthemplein, the world's first full-scale 'water square,' shaping how the space looks and works on dry days versus storms.",
    outcome:
      "Opened in 2013, the square doubles as a public plaza and a stormwater buffer, holding hundreds of thousands of liters of rainwater during heavy downpours to reduce neighborhood flooding.",
    year: "2011–2013",
    sourceName: "De Urbanisten",
    sourceUrl: "https://www.urbanisten.nl/work/benthemplein",
  },
  {
    id: "copenhagen-climate-quarter",
    city: "Copenhagen",
    country: "Denmark",
    lat: 55.6761,
    lng: 12.5683,
    title: "Neighbors build a climate quarter",
    category: "Resilience",
    whatCitizensDid:
      "Residents of the Østerbro district launched scores of grassroots projects to add green surfaces, pocket parks and water-retention features that handle heavy rain — shaping the city's first climate-resilient neighborhood.",
    outcome:
      "More than 10,000 people took part in around 170 citizen-led initiatives; the completed system is designed to manage about 30% of rainwater locally instead of overloading the sewers.",
    year: "2010s",
    sourceName: "C40 Cities",
    sourceUrl:
      "https://www.c40.org/case-studies/cities100-copenhagen-creating-a-climate-resilient-neighborhood/",
  },
  {
    id: "london-breathe-air",
    city: "London",
    country: "United Kingdom",
    lat: 51.5072,
    lng: -0.1276,
    title: "Communities measure their own air",
    category: "AirQuality",
    whatCitizensDid:
      "Schools and community groups hosted low-cost air-quality sensors through the Breathe London network, gathering neighborhood pollution data and campaigning for 'School Streets' that limit cars at drop-off and pick-up. The evidence helped justify street changes.",
    outcome:
      "Monitoring at 18 primary schools showed major drops in nitrogen dioxide on School Streets, with car travel to school down about 18%; the sensor network grew to 350+ sites and inspired the global Breathe Cities initiative.",
    year: "2020–present",
    sourceName: "Greater London Authority",
    sourceUrl:
      "https://www.london.gov.uk/press-releases/mayoral/school-streets-improve-air-quality",
  },
  {
    id: "paris-citizens-convention",
    city: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    title: "150 citizens rewrite climate law",
    category: "Participation",
    whatCitizensDid:
      "150 randomly selected French citizens, broadly representative of the population, met over months in a national Citizens' Convention for Climate to deliberate with experts and propose fair ways to cut emissions, producing 149 concrete proposals.",
    outcome:
      "Many proposals fed into the 2021 Climate and Resilience Law, which created an 'ecocide' offence, banned some short-haul domestic flights with rail alternatives, and funded electric-bike incentives.",
    year: "2019–2021",
    sourceName: "Wikipedia (Citizens' Convention for Climate)",
    sourceUrl: "https://en.wikipedia.org/wiki/Citizens_Convention_for_Climate",
  },
];
