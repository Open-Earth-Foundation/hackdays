export type LocalSource = {
  id: string;
  name: string;
  type: "official" | "community";
  url: string;
  note: string;
};

export type LocalCitizenAction = {
  label: string;
  timeRequired: string;
  impactType: string;
};

export type LocalEngagementRecommendation = {
  id: string;
  cityId: "porto-alegre";
  title: string;
  priority: "Very high" | "High" | "Medium";
  theme: "Resilience" | "Greening" | "Energy" | "Mobility";
  whyItMatters: string;
  firstActions: LocalCitizenAction[];
  sources: LocalSource[];
};

export const portoAlegreEngagementRecommendations: LocalEngagementRecommendation[] = [
  {
    id: "poa-flood-resilience",
    cityId: "porto-alegre",
    title: "Help shape flood-resilience investments",
    priority: "Very high",
    theme: "Resilience",
    whyItMatters:
      "CityCatalyst CCRA marks flooding as a very high risk signal for Porto Alegre's infrastructure and public health. The civic step is not just awareness: residents can use official planning, grievance, and budgeting channels to ask where drainage and recovery investments go first.",
    firstActions: [
      {
        label: "Use POA+Drena Resiliente materials to track drainage project engagement and accountability.",
        timeRequired: "20 min",
        impactType: "Project accountability",
      },
      {
        label: "Bring flood-risk priorities into the participatory budget or a council conversation.",
        timeRequired: "1-2 hours",
        impactType: "Budget influence",
      },
    ],
    sources: [
      {
        id: "poa-defesa-civil",
        name: "Defesa Civil de Porto Alegre",
        type: "official",
        url: "https://prefeitura.poa.br/defesa-civil",
        note: "Official disaster risk and emergency response channel.",
      },
      {
        id: "poa-drena-resiliente-pepi",
        name: "POA+Drena Resiliente stakeholder engagement plan",
        type: "official",
        url: "https://prefeitura.poa.br/sites/default/files/usu_doc/sites/smpg/PEPI-Arroio%20Moinho_rev.03.26.pdf",
        note: "Stakeholder engagement plan for resilient urban drainage investments.",
      },
      {
        id: "poa-op",
        name: "Orcamento Participativo",
        type: "official",
        url: "https://prefeitura.poa.br/smgov/orcamento-participativo",
        note: "Participatory budgeting pathway for regional and thematic priorities.",
      },
    ],
  },
  {
    id: "poa-landslide-prevention",
    cityId: "porto-alegre",
    title: "Support landslide prevention in exposed areas",
    priority: "Very high",
    theme: "Resilience",
    whyItMatters:
      "CityCatalyst CCRA also identifies landslides as a very high risk for infrastructure and public health. Residents need a clear route from risk maps and local observations to prevention decisions.",
    firstActions: [
      {
        label: "Report slope instability, drainage blockages, or risk conditions through official channels.",
        timeRequired: "10-20 min",
        impactType: "Risk reduction",
      },
      {
        label: "Ask planning bodies how landslide prevention maps and investments are prioritized.",
        timeRequired: "30-60 min",
        impactType: "Transparency",
      },
    ],
    sources: [
      {
        id: "poa-defesa-civil",
        name: "Defesa Civil de Porto Alegre",
        type: "official",
        url: "https://prefeitura.poa.br/defesa-civil",
        note: "Official channel for disaster risk and civil defense guidance.",
      },
      {
        id: "poa-cmdua",
        name: "Conselho Municipal de Desenvolvimento Urbano Ambiental",
        type: "official",
        url: "https://prefeitura.poa.br/smamus/planejamento-urbano/cmdua",
        note: "Urban-environmental council linked to planning and land-use decisions.",
      },
    ],
  },
  {
    id: "poa-heat-green-infrastructure",
    cityId: "porto-alegre",
    title: "Expand shade, trees, and cooling spaces",
    priority: "High",
    theme: "Greening",
    whyItMatters:
      "Heatwave risk appears in Porto Alegre's CCRA profile, and green infrastructure is one of the clearest places where local knowledge matters. Residents can nominate hot spots, defend tree care, and push for shade where it is most needed.",
    firstActions: [
      {
        label: "Nominate streets, bus stops, schools, or plazas that need shade and cooling.",
        timeRequired: "10-15 min",
        impactType: "Local knowledge",
      },
      {
        label: "Use environmental council or community advocacy channels to support equitable tree care.",
        timeRequired: "30-60 min",
        impactType: "Policy influence",
      },
    ],
    sources: [
      {
        id: "poa-tree-care",
        name: "Planning and care for trees",
        type: "official",
        url: "https://prefeitura.poa.br/smamus/planejamento-e-cuidado-com-arvores",
        note: "Official urban tree maintenance and care information.",
      },
      {
        id: "poa-comam",
        name: "Conselho Municipal do Meio Ambiente",
        type: "official",
        url: "https://prefeitura.poa.br/catalogo-conselhos/comam",
        note: "Municipal environment council for environmental policy and oversight.",
      },
      {
        id: "agapan",
        name: "AGAPAN",
        type: "community",
        url: "https://www.agapan.org.br/",
        note: "Environmental advocacy organization in Rio Grande do Sul.",
      },
    ],
  },
  {
    id: "poa-residential-energy",
    cityId: "porto-alegre",
    title: "Make homes more energy efficient",
    priority: "Medium",
    theme: "Energy",
    whyItMatters:
      "The Porto Alegre snapshot includes residential fuel and electricity emissions examples from SEEG and EPE. Efficiency upgrades can connect mitigation to comfort, heat resilience, and affordability.",
    firstActions: [
      {
        label: "Ask for retrofit incentives that prioritize low-income and heat-exposed households.",
        timeRequired: "30-60 min",
        impactType: "Equity",
      },
      {
        label: "Use the climate action plan as a source when advocating for building-efficiency programs.",
        timeRequired: "15-30 min",
        impactType: "Mitigation",
      },
    ],
    sources: [
      {
        id: "poa-climate-action-plan",
        name: "Porto Alegre Climate Action Plan",
        type: "official",
        url: "https://prefeitura.poa.br/smamus/plano-de-acao-climatica",
        note: "Official climate planning source for mitigation and adaptation priorities.",
      },
      {
        id: "poa-op",
        name: "Orcamento Participativo",
        type: "official",
        url: "https://prefeitura.poa.br/smgov/orcamento-participativo",
        note: "Participatory budgeting channel for local investment priorities.",
      },
    ],
  },
  {
    id: "poa-active-mobility",
    cityId: "porto-alegre",
    title: "Support safer walking, cycling, and public-space access",
    priority: "Medium",
    theme: "Mobility",
    whyItMatters:
      "The climate action catalogue includes active mobility as a mitigation pathway. For residents, the concrete route is mobility policy, safe-streets advocacy, and local cycling support.",
    firstActions: [
      {
        label: "Comment on street redesigns, bike lanes, transit access, and pedestrian safety.",
        timeRequired: "15-30 min",
        impactType: "Transport policy",
      },
      {
        label: "Join a local mobility group or cycling support network.",
        timeRequired: "Ongoing",
        impactType: "Collective action",
      },
    ],
    sources: [
      {
        id: "poa-commu",
        name: "Conselho Municipal de Mobilidade Urbana",
        type: "official",
        url: "https://prefeitura.poa.br/catalogo-conselhos/commu",
        note: "Consultative council for urban mobility policy.",
      },
      {
        id: "poa-mobirio",
        name: "MobiRio",
        type: "community",
        url: "https://www.facebook.com/associacaomobirio/?locale=pt_BR",
        note: "Local mobility and cycling advocacy group; current contact details should be validated.",
      },
      {
        id: "bike-anjo",
        name: "Bike Anjo",
        type: "community",
        url: "https://bikeanjo.org/",
        note: "Volunteer cycling network; local chapter/activity should be checked before production use.",
      },
    ],
  },
];
