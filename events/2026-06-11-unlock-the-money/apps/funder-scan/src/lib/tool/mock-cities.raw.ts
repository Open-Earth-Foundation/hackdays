// @ts-nocheck
export const citiesRaw = [
  {
    id: 1, name: "Bogotá", country: "Colombia", region: "Latin America", flag: "🇨🇴",
    sector: "Transport & mobility", impact: "High", risk: "Medium",
    fundingNeed: "$180M", population: "8.2M", co2Reduction: "4.2Mt CO₂/yr",
    intro: "Bogotá is one of Latin America's largest and most dynamic cities, with a long history of bold urban innovation — from the world-famous TransMilenio BRT system to pioneering car-free days and cycling infrastructure. Under the current administration, the city has set an ambitious target of achieving carbon neutrality by 2050 and is investing heavily in sustainable mobility, urban greening, and climate resilience. The city's 2030 Climate Action Plan calls for a $180M investment in electric public transit, expansion of cycling networks, and low-emission zones.",
    why: "Bogotá presents a compelling and credible opportunity for climate finance. The city has a proven track record of implementing large-scale urban mobility projects, strong institutional capacity through Secretaría Distrital de Movilidad, and a history of international partnerships. The TransMilenio network has already displaced over 1.5M tonnes of CO₂ annually, and the next phase — transitioning 3,000 buses to electric — offers measurable, bankable impact at scale. With Colombia's national NDC targeting a 51% emissions reduction by 2030, this project is aligned with national climate commitments and benefits from sovereign risk framing.",
    political: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div style="background:var(--gray-50);border-radius:8px;padding:16px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Current administration</div>
          <div style="font-size:13px;color:var(--text-muted);">Mayor Carlos Fernando Galán (2024–2027) — centrist, pro-investment, with a strong climate mandate. Elected on urban reform platform.</div>
        </div>
        <div style="background:var(--gray-50);border-radius:8px;padding:16px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Political stability</div>
          <div style="font-size:13px;color:var(--text-muted);">Strong institutional continuity. The climate agenda enjoys cross-party support at city council level.</div>
        </div>
        <div style="background:var(--gray-50);border-radius:8px;padding:16px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:8px;">National alignment</div>
          <div style="font-size:13px;color:var(--text-muted);">President Petro's national climate agenda is supportive of city-level investment. Colombia's NDC is one of the most ambitious in LATAM.</div>
        </div>
        <div style="background:var(--gray-50);border-radius:8px;padding:16px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:8px;">Procurement environment</div>
          <div style="font-size:13px;color:var(--text-muted);">Transparent public procurement via Colombia Compra Eficiente. No World Bank debarment flags. OCCRP clean record.</div>
        </div>
      </div>`,
    credibility: [
      { label: "Governance score", value: "84/100", sub: "Transparency International rank: 39th of 180", color: "var(--green)" },
      { label: "Track record", value: "Strong", sub: "12 intl. funded projects completed since 2010", color: "var(--blue)" },
      { label: "Financial health", value: "BB+", sub: "Moody's sub-sovereign credit rating", color: "var(--amber)" }
    ],
    risks: [
      { label: "Political risk", level: 35, color: "#1D9E75", note: "Low — stable multi-term administration with legislative support" },
      { label: "Implementation risk", level: 42, color: "#378ADD", note: "Medium-low — experienced project management unit in place" },
      { label: "Currency risk", level: 60, color: "#BA7517", note: "Medium — COP volatility; hedging options available via IFC" },
      { label: "Fiduciary risk", level: 28, color: "#1D9E75", note: "Low — externally audited accounts, clean 5-year track record" }
    ],
    timeline: [
      { phase: "Phase 1: Project preparation (2024–2025)", desc: "Feasibility studies, environmental and social impact assessments, procurement design, stakeholder consultations.", date: "Q1 2024 – Q4 2025" },
      { phase: "Phase 2: First fleet deployment (2026–2027)", desc: "Procurement of 800 electric buses, charging infrastructure in 6 depots, driver training programme.", date: "Q1 2026 – Q2 2027" },
      { phase: "Phase 3: Corridor electrification (2027–2029)", desc: "Full electrification of TransMilenio trunk corridors. Integration with bike-share and last-mile solutions.", date: "H2 2027 – Q4 2029" },
      { phase: "Phase 4: System optimisation (2030)", desc: "Real-time fleet management, MRV reporting aligned with IPCC guidelines, impact evaluation.", date: "2030 onwards" }
    ],
    kpis: [
      { label: "CO₂ reduced", value: "4.2Mt/yr", icon: "ti-leaf" },
      { label: "Buses electrified", value: "3,000", icon: "ti-bus" },
      { label: "Passengers/day", value: "2.8M", icon: "ti-users" },
      { label: "Jobs created", value: "12,400", icon: "ti-briefcase" },
      { label: "Air quality", value: "+34% AQI", icon: "ti-wind" },
      { label: "Project IRR", value: "8.2%", icon: "ti-chart-line" }
    ],
    contacts: [
      { name: "Dr. Andrés Forero", role: "Director, Office of Climate Finance", email: "a.forero@bogota.gov.co", phone: "+57 1 381 0000" },
      { name: "Camila Restrepo", role: "International Partnerships Lead", email: "c.restrepo@bogota.gov.co", phone: "+57 1 381 0045" }
    ],
    tags: ["Transport & mobility", "High impact", "Medium risk"],
    tagColors: ["badge-blue","badge-green","badge-amber"]
  },
  {
    id: 2, name: "Nairobi", country: "Kenya", region: "Sub-Saharan Africa", flag: "🇰🇪",
    sector: "Waste management", impact: "High", risk: "Medium",
    fundingNeed: "$95M", population: "4.4M", co2Reduction: "1.8Mt CO₂/yr",
    intro: "Nairobi is East Africa's economic hub and one of the continent's fastest-growing cities. Facing rapid urbanisation, the city confronts critical challenges in solid waste management, air pollution, and climate resilience. The Nairobi Metropolitan Services (NMS) has developed a comprehensive Integrated Solid Waste Management Plan targeting 70% waste diversion from landfill by 2030.",
    why: "Nairobi's waste sector offers one of the highest-impact, lowest-cost abatement opportunities in Sub-Saharan Africa. The city's existing informal waste economy employs 30,000+ waste pickers whose integration into formal systems can deliver immediate social and climate co-benefits. With Kenya's strong climate policy framework and GCF accreditation, the project has a clear pathway to blended financing.",
    political: `<div style="background:var(--gray-50);border-radius:8px;padding:16px;"><p style="font-size:14px;color:var(--text-muted);">Governor Johnson Sakaja (2022–2026) has made waste management a flagship policy area. National government under President Ruto supports a bottom-up climate agenda. Kenya was the first African nation to phase out single-use plastics and has a strong regulatory environment for waste innovation.</p></div>`,
    credibility: [
      { label: "Governance score", value: "71/100", sub: "East Africa average: 58/100", color: "var(--green)" },
      { label: "Track record", value: "Developing", sub: "5 intl. projects, 3 completed", color: "var(--amber)" },
      { label: "Financial health", value: "B+", sub: "City bond issued 2022 — oversubscribed", color: "var(--blue)" }
    ],
    risks: [
      { label: "Political risk", level: 45, color: "#378ADD", note: "Medium — devolution creates some uncertainty on cross-government coordination" },
      { label: "Implementation risk", level: 55, color: "#BA7517", note: "Medium — strong local champions but limited PIU capacity" },
      { label: "Currency risk", level: 70, color: "#E24B4A", note: "Medium-high — KES volatility; USD-denominated revenues recommended" },
      { label: "Fiduciary risk", level: 40, color: "#1D9E75", note: "Low-medium — KPMG-audited accounts, active World Bank oversight" }
    ],
    timeline: [
      { phase: "Phase 1: Landfill closure & waste pickers formalisation (2025–2026)", desc: "Dandora landfill remediation, registration of 30,000 waste pickers in cooperatives.", date: "2025–2026" },
      { phase: "Phase 2: MRF construction (2026–2028)", desc: "3 Materials Recovery Facilities processing 1,500 tonnes/day; biogas capture from organic waste.", date: "2026–2028" },
      { phase: "Phase 3: Circular economy activation (2028–2030)", desc: "Compost & recycled materials markets, carbon credit monetisation.", date: "2028–2030" }
    ],
    kpis: [
      { label: "CO₂ reduced", value: "1.8Mt/yr", icon: "ti-leaf" },
      { label: "Waste diverted", value: "70%", icon: "ti-recycle" },
      { label: "Jobs formalised", value: "30,000", icon: "ti-briefcase" },
      { label: "Biogas generated", value: "18MW", icon: "ti-bolt" }
    ],
    contacts: [
      { name: "Esther Wanjiku", role: "Director of Environment, NMS", email: "e.wanjiku@nms.go.ke", phone: "+254 20 222 0000" }
    ],
    tags: ["Waste management", "High impact", "Medium risk"],
    tagColors: ["badge-gray","badge-green","badge-amber"]
  },
  {
    id: 3, name: "Medellín", country: "Colombia", region: "Latin America", flag: "🇨🇴",
    sector: "Nature-based solutions", impact: "High", risk: "Low",
    fundingNeed: "$42M", population: "2.5M", co2Reduction: "0.9Mt CO₂/yr",
    intro: "Medellín, Colombia's second largest city, has undergone one of the world's most celebrated urban transformations — from conflict-ridden city to a global model of social and environmental innovation. The city's Green Corridors project has already lowered urban temperatures by up to 2°C. The next phase targets 36 additional corridors, urban forests, and an integrated nature-based resilience strategy.",
    why: "Medellín's Green Infrastructure 2030 Plan is bankable, science-based, and has the most robust baseline data of any NbS project in Latin America. The city won the Lee Kuan Yew World City Prize for its approach to urban innovation. First-loss capital needs are minimal — the project is designed for blended finance with a strong MRV framework already in place.",
    political: `<div style="background:var(--gray-50);border-radius:8px;padding:16px;"><p style="font-size:14px;color:var(--text-muted);">Mayor Federico Gutiérrez (re-elected 2023) is internationally recognized for urban climate leadership. The Urban Development Corporation (EDU) provides strong institutional backbone. Climate policy has strong opposition-party support.</p></div>`,
    credibility: [
      { label: "Governance score", value: "91/100", sub: "Top 5% of LAC cities", color: "var(--green)" },
      { label: "Track record", value: "Excellent", sub: "Lee Kuan Yew Prize winner 2022", color: "var(--green)" },
      { label: "Financial health", value: "BBB-", sub: "Investment grade sub-sovereign", color: "var(--green)" }
    ],
    risks: [
      { label: "Political risk", level: 18, color: "#1D9E75", note: "Very low — strong institutional continuity and international recognition" },
      { label: "Implementation risk", level: 22, color: "#1D9E75", note: "Low — experienced in-house project team, existing Green Corridors precedent" },
      { label: "Currency risk", level: 55, color: "#BA7517", note: "Medium — COP exposure, partially mitigated by eco-services revenue" },
      { label: "Fiduciary risk", level: 15, color: "#1D9E75", note: "Very low — multiple international audits, GIZ and World Bank oversight" }
    ],
    timeline: [
      { phase: "Phase 1: 36 new green corridors (2025–2026)", desc: "Tree planting, drip irrigation, urban heat monitoring network deployment.", date: "2025–2026" },
      { phase: "Phase 2: Urban forest restoration (2026–2028)", desc: "8 urban forests, 200,000 trees, bird and biodiversity surveys.", date: "2026–2028" },
      { phase: "Phase 3: Blue-green infrastructure (2028–2030)", desc: "Permeable paving, constructed wetlands, flood risk reduction.", date: "2028–2030" }
    ],
    kpis: [
      { label: "CO₂ sequestered", value: "0.9Mt/yr", icon: "ti-leaf" },
      { label: "Temperature drop", value: "2–4°C", icon: "ti-temperature" },
      { label: "Trees planted", value: "200,000", icon: "ti-trees" },
      { label: "Flood risk", value: "-40%", icon: "ti-droplet" }
    ],
    contacts: [
      { name: "Isabella Córdoba", role: "Director, Green Infrastructure", email: "i.cordoba@medellin.gov.co", phone: "+57 4 385 5555" }
    ],
    tags: ["Nature-based solutions", "High impact", "Low risk"],
    tagColors: ["badge-green","badge-green","badge-gray"]
  },
  {
    id: 4, name: "Dhaka", country: "Bangladesh", region: "South & Southeast Asia", flag: "🇧🇩",
    sector: "Urban resilience", impact: "High", risk: "High",
    fundingNeed: "$320M", population: "21M", co2Reduction: "2.1Mt CO₂/yr",
    intro: "Dhaka is one of the world's most climate-vulnerable megacities, facing severe flooding, heat stress, and extreme weather events exacerbated by rapid urbanisation. The Dhaka Resilience & Adaptation Plan 2030 is the most comprehensive climate adaptation strategy ever prepared by a Bangladeshi city, developed with technical support from the Asian Development Bank.",
    why: "Despite its high-risk profile, Dhaka represents a critical and urgent investment opportunity. The city is home to 21 million people whose lives and livelihoods depend on climate adaptation action. The project has ADB's Accredited Entity status and benefits from Bangladesh's long relationship with the international development community. Blended finance structures with sovereign backstop are available.",
    political: `<div style="background:var(--gray-50);border-radius:8px;padding:16px;"><p style="font-size:14px;color:var(--text-muted);">The Government of Bangladesh (GoB) has declared climate resilience a national development priority. DNCC (North City Corporation) Mayor has strong executive mandate. Post-election political risk is medium — recommend phased disbursements tied to milestones.</p></div>`,
    credibility: [
      { label: "Governance score", value: "58/100", sub: "Improving trend: +12pts since 2018", color: "var(--amber)" },
      { label: "Track record", value: "Early stage", sub: "2 intl. projects in execution", color: "var(--amber)" },
      { label: "Financial health", value: "B", sub: "Sovereign-backed; GoB guarantee available", color: "var(--red)" }
    ],
    risks: [
      { label: "Political risk", level: 72, color: "#E24B4A", note: "High — recent political transition; recommend sovereign guarantee requirement" },
      { label: "Implementation risk", level: 65, color: "#BA7517", note: "Medium-high — PIU being established with ADB TA grant support" },
      { label: "Currency risk", level: 75, color: "#E24B4A", note: "High — BDT volatile; USD disbursement structure recommended" },
      { label: "Fiduciary risk", level: 55, color: "#BA7517", note: "Medium — improving controls; independent verification recommended" }
    ],
    timeline: [
      { phase: "Phase 1: Institutional strengthening (2025)", desc: "PIU staffing, procurement systems, community consultation process.", date: "2025" },
      { phase: "Phase 2: Flood infrastructure (2026–2028)", desc: "Retention ponds, drainage upgrades, 120km of flood bund reinforcement.", date: "2026–2028" },
      { phase: "Phase 3: Heat resilience & housing (2028–2030)", desc: "Cool roofs, urban greening, climate-resilient housing for 50,000 households.", date: "2028–2030" }
    ],
    kpis: [
      { label: "People protected", value: "4.5M", icon: "ti-shield" },
      { label: "Flood risk", value: "-55%", icon: "ti-droplet" },
      { label: "Cool roofs", value: "50,000", icon: "ti-home" },
      { label: "Economic losses avoided", value: "$2.1B", icon: "ti-chart-line" }
    ],
    contacts: [
      { name: "Md. Rafiqul Islam", role: "Chief Planning Officer, DNCC", email: "r.islam@dncc.gov.bd", phone: "+880 2 55017777" }
    ],
    tags: ["Urban resilience", "High impact", "High risk"],
    tagColors: ["badge-blue","badge-green","badge-red"]
  },
  {
    id: 5, name: "Cape Town", country: "South Africa", region: "Sub-Saharan Africa", flag: "🇿🇦",
    sector: "Energy transition", impact: "Medium-high", risk: "Low",
    fundingNeed: "$210M", population: "4.6M", co2Reduction: "3.5Mt CO₂/yr",
    intro: "Cape Town is Africa's most ambitious city on energy transition, having pioneered South Africa's first municipal-scale renewable energy procurement programme. The city's Energy 2040 Roadmap targets 100% renewable electricity by 2040 and energy independence from Eskom — a move driven by both climate commitment and supply security concerns.",
    why: "Cape Town offers a rare combination of investment-grade sub-sovereign credit, transparent governance, and a strong regulatory framework. The city's PPP track record, including the successful Blue Dot City Bond and renewable energy auctions, demonstrates bankability. The project pipeline is fully developed and ready for financing.",
    political: `<div style="background:var(--gray-50);border-radius:8px;padding:16px;"><p style="font-size:14px;color:var(--text-muted);">Mayor Geordin Hill-Lewis (2021–present) leads a pro-business administration with strong climate credentials. The DA-led Western Cape government provides favourable provincial policy environment. City of Cape Town has one of South Africa's highest credit ratings.</p></div>`,
    credibility: [
      { label: "Governance score", value: "88/100", sub: "Best-in-class in Sub-Saharan Africa", color: "var(--green)" },
      { label: "Track record", value: "Excellent", sub: "First African city green bond issued", color: "var(--green)" },
      { label: "Financial health", value: "BBB", sub: "Investment grade, ZAR & USD rated", color: "var(--green)" }
    ],
    risks: [
      { label: "Political risk", level: 22, color: "#1D9E75", note: "Low — stable administration, supportive provincial government" },
      { label: "Implementation risk", level: 28, color: "#1D9E75", note: "Low — experienced Energy and Climate Change Office" },
      { label: "Currency risk", level: 62, color: "#BA7517", note: "Medium — ZAR volatility; city has USD revenue streams" },
      { label: "Fiduciary risk", level: 18, color: "#1D9E75", note: "Very low — Deloitte-audited, AA Auditor-General rating" }
    ],
    timeline: [
      { phase: "Phase 1: Grid-scale solar & wind (2025–2026)", desc: "600MW solar PV and 200MW wind procurement via competitive bidding.", date: "2025–2026" },
      { phase: "Phase 2: Battery storage (2027–2028)", desc: "300MWh grid-scale battery storage, demand-response programmes.", date: "2027–2028" },
      { phase: "Phase 3: 100% renewable target (2029–2040)", desc: "Remaining generation transition, distributed rooftop solar, EV charging.", date: "2029–2040" }
    ],
    kpis: [
      { label: "Renewable capacity", value: "800MW", icon: "ti-solar-panel" },
      { label: "CO₂ reduced", value: "3.5Mt/yr", icon: "ti-leaf" },
      { label: "Energy security", value: "+80%", icon: "ti-bolt" },
      { label: "Electricity cost", value: "-22%", icon: "ti-coin" }
    ],
    contacts: [
      { name: "Dr. Lena van der Berg", role: "Director, Energy & Climate", email: "l.vanderberg@capetown.gov.za", phone: "+27 21 400 1111" }
    ],
    tags: ["Energy transition", "Medium-high impact", "Low risk"],
    tagColors: ["badge-amber","badge-green","badge-gray"]
  },
  {
    id: 6, name: "Jakarta", country: "Indonesia", region: "South & Southeast Asia", flag: "🇮🇩",
    sector: "Water & sanitation", impact: "High", risk: "Medium",
    fundingNeed: "$450M", population: "10.5M", co2Reduction: "1.4Mt CO₂/yr",
    intro: "Jakarta is one of the world's most flood-prone capital cities, with parts of the city sinking up to 25cm annually due to groundwater extraction. The Jakarta Water Resilience Programme (JWRP) is a landmark initiative combining coastal defence, groundwater recharge, river rehabilitation, and transition to piped water supply for 3 million residents currently relying on contaminated shallow wells.",
    why: "The JWRP is co-designed with the World Bank and ADB and has secured first-tranche co-financing. Indonesia's newly established Capital City authority creates a unique moment for transformational investment. The project carries central government backing and a strong climate rationale aligned with Indonesia's NDC.",
    political: `<div style="background:var(--gray-50);border-radius:8px;padding:16px;"><p style="font-size:14px;color:var(--text-muted);">Governor Heru Budi Hartono (appointed 2022) has made water resilience the administration's top infrastructure priority. National Ministry of PUPR co-sponsors the programme. The capital relocation to Nusantara creates political urgency for Jakarta's transformation.</p></div>`,
    credibility: [
      { label: "Governance score", value: "66/100", sub: "Above ASEAN median", color: "var(--amber)" },
      { label: "Track record", value: "Good", sub: "8 intl. projects, incl. JICA water", color: "var(--green)" },
      { label: "Financial health", value: "BB+", sub: "National sovereign backstop", color: "var(--amber)" }
    ],
    risks: [
      { label: "Political risk", level: 40, color: "#1D9E75", note: "Medium-low — capital relocation creates urgency and national interest" },
      { label: "Implementation risk", level: 58, color: "#BA7517", note: "Medium — complex multi-agency coordination required" },
      { label: "Currency risk", level: 52, color: "#BA7517", note: "Medium — IDR stable; some USD revenue from industrial water supply" },
      { label: "Fiduciary risk", level: 44, color: "#1D9E75", note: "Medium-low — BPKP audit, World Bank fiduciary support" }
    ],
    timeline: [
      { phase: "Phase 1: Groundwater monitoring & recharge (2025)", desc: "1,200 injection wells, smart metering of groundwater extraction.", date: "2025" },
      { phase: "Phase 2: River rehabilitation (2026–2027)", desc: "Ciliwung River corridor, 13 tributary flood gates, mangrove restoration.", date: "2026–2027" },
      { phase: "Phase 3: Piped water expansion (2027–2029)", desc: "3M residents connected to treated piped water, eliminating shallow well dependency.", date: "2027–2029" }
    ],
    kpis: [
      { label: "Subsidence reduced", value: "-60%", icon: "ti-layers-difference" },
      { label: "Flood protection", value: "3.2M people", icon: "ti-shield" },
      { label: "Clean water access", value: "3M new", icon: "ti-droplet" },
      { label: "Groundwater recovery", value: "+35%", icon: "ti-refresh" }
    ],
    contacts: [
      { name: "Budi Setiawan", role: "Head of Water Resources", email: "b.setiawan@jakarta.go.id", phone: "+62 21 1500140" }
    ],
    tags: ["Water & sanitation", "High impact", "Medium risk"],
    tagColors: ["badge-blue","badge-green","badge-amber"]
  }
] as const;
