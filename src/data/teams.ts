export type Confederation = 'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'CONCACAF' | 'OFC'

export interface TeamIdentity {
  code: string
  name: string
  shortName: string
  primary: string
  accent: string
  confederation: Confederation
  group: string
}

export const CONF_SHAPE: Record<Confederation, string> = {
  UEFA: 'hexagon',
  CONMEBOL: 'diamond',
  CAF: 'circle',
  AFC: 'square',
  CONCACAF: 'pentagon',
  OFC: 'ring',
}

// ── All 48 FIFA World Cup 2026 teams ─────────────────────────────────────────
// Groups sourced from the official draw (Dec 2024)
// Group A: Mexico, South Africa, South Korea, Czechia
// Group B: Canada, Bosnia-Herzegovina, Qatar, Switzerland
// Group C: Brazil, Haiti, Morocco, Scotland
// Group D: USA, Paraguay, Australia, Türkiye
// Group E: Germany, Curaçao, Ivory Coast, Ecuador
// Group F: Netherlands, Japan, Sweden, Tunisia
// Group G: Belgium, Egypt, Iran, New Zealand
// Group H: Spain, Cape Verde, Saudi Arabia, Uruguay
// Group I: France, Iraq, Norway, Senegal
// Group J: Argentina, Algeria, Austria, Jordan
// Group K: Colombia, DR Congo, Portugal, Uzbekistan
// Group L: Croatia, England, Ghana, Panama

export const TEAMS: Record<string, TeamIdentity> = {

  // ── GROUP A ───────────────────────────────────────────────────────────────
  MEX: { code: 'MEX', name: 'Mexico',       shortName: 'Mexico',       primary: '#006847', accent: '#CE1126', confederation: 'CONCACAF', group: 'A' },
  RSA: { code: 'RSA', name: 'South Africa', shortName: 'South Africa', primary: '#007A4D', accent: '#FFB81C', confederation: 'CAF',      group: 'A' },
  KOR: { code: 'KOR', name: 'South Korea',  shortName: 'Korea',        primary: '#003478', accent: '#CD2E3A', confederation: 'AFC',      group: 'A' },
  CZE: { code: 'CZE', name: 'Czechia',      shortName: 'Czechia',      primary: '#D7141A', accent: '#FFFFFF', confederation: 'UEFA',     group: 'A' },

  // ── GROUP B ───────────────────────────────────────────────────────────────
  CAN: { code: 'CAN', name: 'Canada',              shortName: 'Canada',  primary: '#FF0000', accent: '#FFFFFF', confederation: 'CONCACAF', group: 'B' },
  BIH: { code: 'BIH', name: 'Bosnia-Herzegovina',  shortName: 'Bosnia',  primary: '#0032A0', accent: '#FFCC00', confederation: 'UEFA',     group: 'B' },
  QAT: { code: 'QAT', name: 'Qatar',               shortName: 'Qatar',   primary: '#8D1B3D', accent: '#FFFFFF', confederation: 'AFC',      group: 'B' },
  SUI: { code: 'SUI', name: 'Switzerland',          shortName: 'Switzerland', primary: '#FF0000', accent: '#FFFFFF', confederation: 'UEFA', group: 'B' },

  // ── GROUP C ───────────────────────────────────────────────────────────────
  BRA: { code: 'BRA', name: 'Brazil',   shortName: 'Brazil',  primary: '#009C3B', accent: '#FFDF00', confederation: 'CONMEBOL', group: 'C' },
  HAI: { code: 'HAI', name: 'Haiti',    shortName: 'Haiti',   primary: '#00209F', accent: '#D21034', confederation: 'CONCACAF', group: 'C' },
  MAR: { code: 'MAR', name: 'Morocco',  shortName: 'Morocco', primary: '#C1272D', accent: '#006233', confederation: 'CAF',      group: 'C' },
  SCO: { code: 'SCO', name: 'Scotland', shortName: 'Scotland',primary: '#003380', accent: '#FFFFFF', confederation: 'UEFA',     group: 'C' },

  // ── GROUP D ───────────────────────────────────────────────────────────────
  USA: { code: 'USA', name: 'United States', shortName: 'USA',       primary: '#002868', accent: '#BF0A30', confederation: 'CONCACAF', group: 'D' },
  PRY: { code: 'PRY', name: 'Paraguay',      shortName: 'Paraguay',  primary: '#D52B1E', accent: '#009A44', confederation: 'CONMEBOL', group: 'D' },
  AUS: { code: 'AUS', name: 'Australia',     shortName: 'Australia', primary: '#FFCD00', accent: '#00843D', confederation: 'AFC',      group: 'D' },
  TUR: { code: 'TUR', name: 'Türkiye',       shortName: 'Türkiye',   primary: '#E30A17', accent: '#FFFFFF', confederation: 'UEFA',     group: 'D' },

  // ── GROUP E ───────────────────────────────────────────────────────────────
  GER: { code: 'GER', name: 'Germany',     shortName: 'Germany',    primary: '#1A1A1A', accent: '#DD0000', confederation: 'UEFA',     group: 'E' },
  CUW: { code: 'CUW', name: 'Curaçao',     shortName: 'Curaçao',    primary: '#002B7F', accent: '#F8D100', confederation: 'CONCACAF', group: 'E' },
  CIV: { code: 'CIV', name: "Côte d'Ivoire", shortName: 'Ivory Coast', primary: '#F77F00', accent: '#009A44', confederation: 'CAF',  group: 'E' },
  ECU: { code: 'ECU', name: 'Ecuador',     shortName: 'Ecuador',    primary: '#FFD100', accent: '#003087', confederation: 'CONMEBOL', group: 'E' },

  // ── GROUP F ───────────────────────────────────────────────────────────────
  NED: { code: 'NED', name: 'Netherlands', shortName: 'Netherlands', primary: '#FF6200', accent: '#FFFFFF', confederation: 'UEFA',     group: 'F' },
  JPN: { code: 'JPN', name: 'Japan',       shortName: 'Japan',       primary: '#003087', accent: '#BC002D', confederation: 'AFC',      group: 'F' },
  SWE: { code: 'SWE', name: 'Sweden',      shortName: 'Sweden',      primary: '#006AA7', accent: '#FECC02', confederation: 'UEFA',     group: 'F' },
  TUN: { code: 'TUN', name: 'Tunisia',     shortName: 'Tunisia',     primary: '#E70013', accent: '#FFFFFF', confederation: 'CAF',      group: 'F' },

  // ── GROUP G ───────────────────────────────────────────────────────────────
  BEL: { code: 'BEL', name: 'Belgium',     shortName: 'Belgium',     primary: '#2D2D2D', accent: '#EF3340', confederation: 'UEFA',     group: 'G' },
  EGY: { code: 'EGY', name: 'Egypt',       shortName: 'Egypt',       primary: '#CE1126', accent: '#FFFFFF', confederation: 'CAF',      group: 'G' },
  IRN: { code: 'IRN', name: 'Iran',         shortName: 'Iran',        primary: '#239F40', accent: '#DA0000', confederation: 'AFC',      group: 'G' },
  NZL: { code: 'NZL', name: 'New Zealand', shortName: 'New Zealand', primary: '#2B2B2B', accent: '#FFFFFF', confederation: 'OFC',      group: 'G' },

  // ── GROUP H ───────────────────────────────────────────────────────────────
  ESP: { code: 'ESP', name: 'Spain',        shortName: 'Spain',       primary: '#AA151B', accent: '#F1BF00', confederation: 'UEFA',     group: 'H' },
  CPV: { code: 'CPV', name: 'Cape Verde',   shortName: 'Cape Verde',  primary: '#003893', accent: '#CF2027', confederation: 'CAF',      group: 'H' },
  KSA: { code: 'KSA', name: 'Saudi Arabia', shortName: 'Saudi Arabia',primary: '#165C37', accent: '#FFFFFF', confederation: 'AFC',      group: 'H' },
  URU: { code: 'URU', name: 'Uruguay',      shortName: 'Uruguay',     primary: '#5EB6E4', accent: '#FFFFFF', confederation: 'CONMEBOL', group: 'H' },

  // ── GROUP I ───────────────────────────────────────────────────────────────
  FRA: { code: 'FRA', name: 'France',   shortName: 'France',  primary: '#002395', accent: '#ED2939', confederation: 'UEFA',     group: 'I' },
  IRQ: { code: 'IRQ', name: 'Iraq',     shortName: 'Iraq',    primary: '#CF0921', accent: '#000000', confederation: 'AFC',      group: 'I' },
  NOR: { code: 'NOR', name: 'Norway',   shortName: 'Norway',  primary: '#EF2B2D', accent: '#003087', confederation: 'UEFA',     group: 'I' },
  SEN: { code: 'SEN', name: 'Senegal',  shortName: 'Senegal', primary: '#00853F', accent: '#FDEF42', confederation: 'CAF',      group: 'I' },

  // ── GROUP J ───────────────────────────────────────────────────────────────
  ARG: { code: 'ARG', name: 'Argentina', shortName: 'Argentina', primary: '#74ACDF', accent: '#F6B40E', confederation: 'CONMEBOL', group: 'J' },
  ALG: { code: 'ALG', name: 'Algeria',   shortName: 'Algeria',   primary: '#006233', accent: '#FFFFFF', confederation: 'CAF',      group: 'J' },
  AUT: { code: 'AUT', name: 'Austria',   shortName: 'Austria',   primary: '#ED2939', accent: '#FFFFFF', confederation: 'UEFA',     group: 'J' },
  JOR: { code: 'JOR', name: 'Jordan',    shortName: 'Jordan',    primary: '#007A3D', accent: '#CE1126', confederation: 'AFC',      group: 'J' },

  // ── GROUP K ───────────────────────────────────────────────────────────────
  COL: { code: 'COL', name: 'Colombia', shortName: 'Colombia', primary: '#FCD116', accent: '#003087', confederation: 'CONMEBOL', group: 'K' },
  COD: { code: 'COD', name: 'DR Congo', shortName: 'DR Congo', primary: '#007FFF', accent: '#F7D618', confederation: 'CAF',      group: 'K' },
  POR: { code: 'POR', name: 'Portugal', shortName: 'Portugal', primary: '#006600', accent: '#FF0000', confederation: 'UEFA',     group: 'K' },
  UZB: { code: 'UZB', name: 'Uzbekistan', shortName: 'Uzbekistan', primary: '#1EB53A', accent: '#FFFFFF', confederation: 'AFC',  group: 'K' },

  // ── GROUP L ───────────────────────────────────────────────────────────────
  CRO: { code: 'CRO', name: 'Croatia', shortName: 'Croatia', primary: '#FF0000', accent: '#171796', confederation: 'UEFA',     group: 'L' },
  ENG: { code: 'ENG', name: 'England', shortName: 'England', primary: '#CF111A', accent: '#FFFFFF', confederation: 'UEFA',     group: 'L' },
  GHA: { code: 'GHA', name: 'Ghana',   shortName: 'Ghana',   primary: '#006B3F', accent: '#FCD116', confederation: 'CAF',      group: 'L' },
  PAN: { code: 'PAN', name: 'Panama',  shortName: 'Panama',  primary: '#DA121A', accent: '#003580', confederation: 'CONCACAF', group: 'L' },
}

export function getTeam(code: string): TeamIdentity {
  return TEAMS[code] ?? {
    code,
    name: code,
    shortName: code,
    primary: '#444466',
    accent: '#888899',
    confederation: 'UEFA',
    group: '?',
  }
}

export const ALL_TEAMS = Object.values(TEAMS)
