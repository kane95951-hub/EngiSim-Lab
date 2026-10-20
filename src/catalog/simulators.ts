import type { DomainInfo, SimulatorMeta } from './types'

// Registre central : source de vérité du catalogue.
// Règle : un outil ne passe à « available » qu'après validation de la checklist de SPEC.md §10.
// Les outils « planned » n'ouvrent sur aucun simulateur et ne produisent aucun résultat.

export const DOMAINS: DomainInfo[] = [
  { id: 'geochemistry', name: { fr: 'Géochimie pétrolière', en: 'Petroleum geochemistry' } },
  { id: 'geology', name: { fr: 'Géologie et géosciences', en: 'Geology and geosciences' } },
  { id: 'seismic-geophysics', name: { fr: 'Sismique et géophysique', en: 'Seismic and geophysics' } },
  { id: 'petrophysics', name: { fr: 'Pétrophysique', en: 'Petrophysics' } },
  { id: 'reservoir', name: { fr: 'Ingénierie de réservoir', en: 'Reservoir engineering' } },
  {
    id: 'drilling-production',
    name: { fr: 'Forage et production pétrolière', en: 'Drilling and petroleum production' },
  },
  { id: 'geomechanics', name: { fr: 'Géomécanique', en: 'Geomechanics' } },
  {
    id: 'fluid-mechanics',
    name: { fr: 'Mécanique des fluides et hydraulique', en: 'Fluid mechanics and hydraulics' },
  },
  {
    id: 'thermodynamics',
    name: { fr: 'Thermodynamique et propriétés des fluides', en: 'Thermodynamics and fluid properties' },
  },
  { id: 'civil-structures', name: { fr: 'Génie civil et structures', en: 'Civil engineering and structures' } },
  { id: 'materials', name: { fr: 'Génie des matériaux', en: 'Materials engineering' } },
  { id: 'renewables', name: { fr: 'Énergies renouvelables', en: 'Renewable energy' } },
  { id: 'process', name: { fr: 'Génie des procédés', en: 'Process engineering' } },
  { id: 'environment-co2', name: { fr: 'Environnement et CO₂', en: 'Environment and CO₂' } },
  {
    id: 'math-data',
    name: {
      fr: 'Mathématiques, calcul numérique et analyse de données',
      en: 'Mathematics, numerical computing and data analysis',
    },
  },
]

export const SIMULATORS: SimulatorMeta[] = [
  {
    id: 'rock-eval',
    domain: 'geochemistry',
    name: { fr: 'Interpréteur Rock-Eval', en: 'Rock-Eval interpreter' },
    description: {
      fr: 'Saisie ou import CSV de S1, S2, S3, TOC et Tmax ; calcul de HI, OI et PI avec alertes qualité.',
      en: 'Enter or import S1, S2, S3, TOC and Tmax from CSV; compute HI, OI and PI with data-quality alerts.',
    },
    keywords: ['rock-eval', 'pyrolyse', 'pyrolysis', 'S1', 'S2', 'S3', 'TOC', 'Tmax', 'HI', 'OI', 'PI', 'roche mère', 'source rock'],
    status: 'planned',
  },
  {
    id: 'van-krevelen',
    domain: 'geochemistry',
    name: { fr: 'Diagramme de Van Krevelen modifié', en: 'Modified Van Krevelen diagram' },
    description: {
      fr: 'Nuage de points HI–OI interactif à partir des échantillons Rock-Eval.',
      en: 'Interactive HI–OI scatter plot built from Rock-Eval samples.',
    },
    keywords: ['van krevelen', 'HI', 'OI', 'kérogène', 'kerogen', 'matière organique', 'organic matter'],
    status: 'planned',
  },
  {
    id: 'arrhenius-maturation',
    domain: 'geochemistry',
    name: { fr: 'Maturation d’Arrhenius (pédagogique)', en: 'Arrhenius maturation (educational)' },
    description: {
      fr: 'Cinétique de premier ordre : effet de la température, de Ea et du facteur A sur la conversion.',
      en: 'First-order kinetics: effect of temperature, Ea and the pre-exponential factor A on conversion.',
    },
    keywords: ['arrhenius', 'cinétique', 'kinetics', 'Ea', 'conversion', 'maturation'],
    status: 'planned',
  },
  {
    id: 'source-rock-plots',
    domain: 'geochemistry',
    name: { fr: 'Graphiques de roche mère', en: 'Source rock plots' },
    description: {
      fr: 'Diagrammes S2–TOC, HI–Tmax et PI–Tmax avec alertes qualité.',
      en: 'S2–TOC, HI–Tmax and PI–Tmax plots with data-quality alerts.',
    },
    keywords: ['S2', 'TOC', 'HI', 'Tmax', 'PI', 'roche mère', 'source rock'],
    status: 'planned',
  },
  {
    id: 'burial-maturity-1d',
    domain: 'geochemistry',
    name: { fr: 'Enfouissement et maturité 1D', en: '1D burial and maturity' },
    description: {
      fr: 'Histoire d’enfouissement simple ; hypothèses et calibration explicites.',
      en: 'Simple burial history; explicit assumptions and calibration.',
    },
    keywords: ['enfouissement', 'burial', 'maturité', 'maturity'],
    status: 'planned',
  },
  {
    id: 'geology-seismic-demos',
    domain: 'geology',
    name: { fr: 'Modèles démonstratifs de géologie et de sismique', en: 'Geology and seismic demonstration models' },
    description: {
      fr: 'Petits modèles démonstratifs ; contenu à définir.',
      en: 'Small demonstration models; content to be defined.',
    },
    keywords: ['géologie', 'geology', 'sismique', 'seismic'],
    status: 'planned',
  },
  {
    id: 'porosity-saturation',
    domain: 'petrophysics',
    name: { fr: 'Porosité et saturation en eau', en: 'Porosity and water saturation' },
    description: {
      fr: 'Porosité par volumes ou par densités ; saturation en eau volumétrique, avec contrôle des bornes physiques.',
      en: 'Porosity from volumes or densities; volumetric water saturation, with physical-bounds checks.',
    },
    keywords: ['porosité', 'porosity', 'saturation', 'Sw', 'densité', 'density', 'volume'],
    status: 'planned',
  },
  {
    id: 'archie-saturation',
    domain: 'petrophysics',
    name: { fr: 'Saturation en eau (loi d’Archie)', en: 'Water saturation (Archie)' },
    description: {
      fr: 'Saturation déduite des résistivités ; les paramètres a, m et n sont saisis explicitement.',
      en: 'Saturation derived from resistivities; parameters a, m and n are entered explicitly.',
    },
    keywords: ['archie', 'résistivité', 'resistivity', 'Rw', 'Rt', 'cimentation', 'cementation', 'Sw'],
    status: 'planned',
  },
  {
    id: 'darcy-flow',
    domain: 'petrophysics',
    name: { fr: 'Écoulement de Darcy 1D', en: '1D Darcy flow' },
    description: {
      fr: 'Débit, vitesse de Darcy et profil de pression pour un écoulement monophasique.',
      en: 'Flow rate, Darcy velocity and pressure profile for single-phase flow.',
    },
    keywords: ['darcy', 'perméabilité', 'permeability', 'débit', 'flow rate', 'pression', 'pressure', 'viscosité', 'viscosity'],
    status: 'planned',
  },
  {
    id: 'arps-decline',
    domain: 'reservoir',
    name: { fr: 'Déclin de production d’Arps', en: 'Arps production decline' },
    description: {
      fr: 'Analyse sur mesures importées ; limites de l’extrapolation explicites.',
      en: 'Analysis of imported measurements; explicit limits of extrapolation.',
    },
    keywords: ['arps', 'déclin', 'decline', 'production'],
    status: 'planned',
  },
  {
    id: 'well-tests',
    domain: 'reservoir',
    name: { fr: 'Tests de puits', en: 'Well tests' },
    description: {
      fr: 'Tests de puits en écoulement monophasique ; contenu à définir.',
      en: 'Well tests in single-phase flow; content to be defined.',
    },
    keywords: ['test de puits', 'well test', 'pression', 'pressure'],
    status: 'planned',
  },
  {
    id: 'drilling-hydraulics',
    domain: 'drilling-production',
    name: { fr: 'Hydraulique de forage', en: 'Drilling hydraulics' },
    description: {
      fr: 'Outil lié à la sécurité : validation spécialisée et avertissements renforcés requis avant toute mise à disposition.',
      en: 'Safety-related tool: specialist validation and reinforced warnings are required before release.',
    },
    keywords: ['forage', 'drilling', 'hydraulique', 'hydraulics'],
    status: 'planned',
  },
  {
    id: 'ipr-vlp-lift',
    domain: 'drilling-production',
    name: { fr: 'IPR / VLP et levage artificiel', en: 'IPR / VLP and artificial lift' },
    description: {
      fr: 'Outil lié à la sécurité : validation spécialisée et avertissements renforcés requis avant toute mise à disposition.',
      en: 'Safety-related tool: specialist validation and reinforced warnings are required before release.',
    },
    keywords: ['IPR', 'VLP', 'levage artificiel', 'artificial lift', 'production'],
    status: 'planned',
  },
  {
    id: 'peng-robinson',
    domain: 'thermodynamics',
    name: { fr: 'Équation de Peng–Robinson et diagrammes de phase', en: 'Peng–Robinson equation and phase diagrams' },
    description: {
      fr: 'Propriétés des fluides et diagrammes de phase ; contenu à définir.',
      en: 'Fluid properties and phase diagrams; content to be defined.',
    },
    keywords: ['peng-robinson', 'équation d’état', 'equation of state', 'phase'],
    status: 'planned',
  },
  {
    id: 'reynolds-darcy-weisbach',
    domain: 'fluid-mechanics',
    name: { fr: 'Reynolds et Darcy–Weisbach', en: 'Reynolds and Darcy–Weisbach' },
    description: {
      fr: 'Régime d’écoulement et pertes de charge en conduite.',
      en: 'Flow regime and pressure losses in pipes.',
    },
    keywords: ['reynolds', 'darcy-weisbach', 'conduite', 'pipe', 'perte de charge', 'pressure loss'],
    status: 'planned',
  },
  {
    id: 'beam-bending',
    domain: 'civil-structures',
    name: { fr: 'Poutre : efforts et flèches', en: 'Beam: forces and deflections' },
    description: {
      fr: 'Un seul cas de poutre, seulement avec référence technique et cas de test indépendants. Outil lié à la sécurité.',
      en: 'A single beam case, only with a technical reference and independent test cases. Safety-related tool.',
    },
    keywords: ['poutre', 'beam', 'flèche', 'deflection', 'structure'],
    status: 'planned',
  },
  {
    id: 'stress-strain',
    domain: 'materials',
    name: { fr: 'Contrainte–déformation', en: 'Stress–strain' },
    description: {
      fr: 'Module d’Young et courbe contrainte–déformation ; contenu à définir.',
      en: 'Young’s modulus and stress–strain curve; content to be defined.',
    },
    keywords: ['contrainte', 'stress', 'déformation', 'strain', 'young'],
    status: 'planned',
  },
  {
    id: 'pv-production',
    domain: 'renewables',
    name: { fr: 'Production photovoltaïque', en: 'Photovoltaic production' },
    description: {
      fr: 'Production d’une installation photovoltaïque ; contenu à définir.',
      en: 'Output of a photovoltaic installation; content to be defined.',
    },
    keywords: ['photovoltaïque', 'photovoltaic', 'solaire', 'solar'],
    status: 'planned',
  },
  {
    id: 'mass-energy-balance',
    domain: 'process',
    name: { fr: 'Bilans matière et énergie', en: 'Mass and energy balances' },
    description: {
      fr: 'Bilans simples ; contenu à définir.',
      en: 'Simple balances; content to be defined.',
    },
    keywords: ['bilan', 'balance', 'matière', 'mass', 'énergie', 'energy'],
    status: 'planned',
  },
  {
    id: 'co2-tools',
    domain: 'environment-co2',
    name: { fr: 'Outils environnement et CO₂', en: 'Environment and CO₂ tools' },
    description: {
      fr: 'Contenu à définir.',
      en: 'Content to be defined.',
    },
    keywords: ['CO2', 'environnement', 'environment', 'carbone', 'carbon'],
    status: 'planned',
  },
]
