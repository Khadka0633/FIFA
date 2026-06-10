// ============================================================
// OFFICIAL FIFA WORLD CUP 2026 GROUPS & MATCHES
// Source: Official FIFA Draw, December 5, 2025
// 12 Groups of 4 teams = 72 group stage matches
// ============================================================

export const WC_TEAMS = [
  // Group A
  { code: "MEX",  name: "Mexico",          flag: "🇲🇽", iso: "mx"     },
  { code: "RSA",  name: "South Africa",    flag: "🇿🇦", iso: "za"     },
  { code: "KOR",  name: "South Korea",     flag: "🇰🇷", iso: "kr"     },
  { code: "CZE",  name: "Czechia",         flag: "🇨🇿", iso: "cz"     },
  // Group B
  { code: "CAN",  name: "Canada",          flag: "🇨🇦", iso: "ca"     },
  { code: "QAT",  name: "Qatar",           flag: "🇶🇦", iso: "qa"     },
  { code: "SUI",  name: "Switzerland",     flag: "🇨🇭", iso: "ch"     },
  { code: "BIH",  name: "Bosnia & Herz.",  flag: "🇧🇦", iso: "ba"     },
  // Group C
  { code: "BRA",  name: "Brazil",          flag: "🇧🇷", iso: "br"     },
  { code: "MAR",  name: "Morocco",         flag: "🇲🇦", iso: "ma"     },
  { code: "HAI",  name: "Haiti",           flag: "🇭🇹", iso: "ht"     },
  { code: "SCO",  name: "Scotland",        flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", iso: "gb-sct" },
  // Group D
  { code: "USA",  name: "United States",   flag: "🇺🇸", iso: "us"     },
  { code: "PAR",  name: "Paraguay",        flag: "🇵🇾", iso: "py"     },
  { code: "AUS",  name: "Australia",       flag: "🇦🇺", iso: "au"     },
  { code: "TUR",  name: "Türkiye",         flag: "🇹🇷", iso: "tr"     },
  // Group E
  { code: "GER",  name: "Germany",         flag: "🇩🇪", iso: "de"     },
  { code: "CUW",  name: "Curaçao",         flag: "🇨🇼", iso: "cw"     },
  { code: "CIV",  name: "Côte d'Ivoire",   flag: "🇨🇮", iso: "ci"     },
  { code: "ECU",  name: "Ecuador",         flag: "🇪🇨", iso: "ec"     },
  // Group F
  { code: "NED",  name: "Netherlands",     flag: "🇳🇱", iso: "nl"     },
  { code: "JPN",  name: "Japan",           flag: "🇯🇵", iso: "jp"     },
  { code: "TUN",  name: "Tunisia",         flag: "🇹🇳", iso: "tn"     },
  { code: "UKR",  name: "Ukraine",         flag: "🇺🇦", iso: "ua"     },
  // Group G
  { code: "BEL",  name: "Belgium",         flag: "🇧🇪", iso: "be"     },
  { code: "EGY",  name: "Egypt",           flag: "🇪🇬", iso: "eg"     },
  { code: "IRN",  name: "Iran",            flag: "🇮🇷", iso: "ir"     },
  { code: "NZL",  name: "New Zealand",     flag: "🇳🇿", iso: "nz"     },
  // Group H
  { code: "ESP",  name: "Spain",           flag: "🇪🇸", iso: "es"     },
  { code: "CPV",  name: "Cabo Verde",      flag: "🇨🇻", iso: "cv"     },
  { code: "URU",  name: "Uruguay",         flag: "🇺🇾", iso: "uy"     },
  { code: "KSA",  name: "Saudi Arabia",    flag: "🇸🇦", iso: "sa"     },
  // Group I
  { code: "FRA",  name: "France",          flag: "🇫🇷", iso: "fr"     },
  { code: "SEN",  name: "Senegal",         flag: "🇸🇳", iso: "sn"     },
  { code: "NOR",  name: "Norway",          flag: "🇳🇴", iso: "no"     },
  { code: "IRQ",  name: "Iraq",            flag: "🇮🇶", iso: "iq"     },
  // Group J
  { code: "ARG",  name: "Argentina",       flag: "🇦🇷", iso: "ar"     },
  { code: "ALG",  name: "Algeria",         flag: "🇩🇿", iso: "dz"     },
  { code: "SVK",  name: "Slovakia",        flag: "🇸🇰", iso: "sk"     },
  { code: "PAN",  name: "Panama",          flag: "🇵🇦", iso: "pa"     },
  // Group K
  { code: "POR",  name: "Portugal",        flag: "🇵🇹", iso: "pt"     },
  { code: "COD",  name: "DR Congo",        flag: "🇨🇩", iso: "cd"     },
  { code: "UZB",  name: "Uzbekistan",      flag: "🇺🇿", iso: "uz"     },
  { code: "COL",  name: "Colombia",        flag: "🇨🇴", iso: "co"     },
  // Group L
  { code: "ENG",  name: "England",         flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", iso: "gb-eng" },
  { code: "CRO",  name: "Croatia",         flag: "🇭🇷", iso: "hr"     },
  { code: "GHA",  name: "Ghana",           flag: "🇬🇭", iso: "gh"     },
  { code: "PAN2", name: "Panama",          flag: "🇵🇦", iso: "pa"     },
];
// All 72 group stage matches (each group: 6 matches = 3 matchdays)
export const GROUP_STAGE_MATCHES = [
  // ── GROUP A ────────────────────────────────────────────────
  { id:"A1", group:"A", home:"MEX", away:"RSA",  date:"Jun 11", venue:"Mexico City" },
  { id:"A2", group:"A", home:"KOR", away:"CZE",  date:"Jun 11", venue:"Zapopan" },
  { id:"A3", group:"A", home:"MEX", away:"KOR",  date:"Jun 18", venue:"Zapopan" },
  { id:"A4", group:"A", home:"CZE", away:"RSA",  date:"Jun 18", venue:"Atlanta" },
  { id:"A5", group:"A", home:"MEX", away:"CZE",  date:"Jun 22", venue:"Zapopan" },
  { id:"A6", group:"A", home:"RSA", away:"KOR",  date:"Jun 22", venue:"Atlanta" },

  // ── GROUP B ────────────────────────────────────────────────
  { id:"B1", group:"B", home:"CAN", away:"BIH",  date:"Jun 12", venue:"Toronto" },
  { id:"B2", group:"B", home:"QAT", away:"SUI",  date:"Jun 13", venue:"Santa Clara" },
  { id:"B3", group:"B", home:"CAN", away:"QAT",  date:"Jun 18", venue:"Vancouver" },
  { id:"B4", group:"B", home:"SUI", away:"BIH",  date:"Jun 18", venue:"Santa Clara" },
  { id:"B5", group:"B", home:"CAN", away:"SUI",  date:"Jun 22", venue:"Toronto" },
  { id:"B6", group:"B", home:"BIH", away:"QAT",  date:"Jun 22", venue:"Kansas City" },

  // ── GROUP C ────────────────────────────────────────────────
  { id:"C1", group:"C", home:"BRA", away:"MAR",  date:"Jun 13", venue:"New Jersey" },
  { id:"C2", group:"C", home:"HAI", away:"SCO",  date:"Jun 13", venue:"Boston" },
  { id:"C3", group:"C", home:"BRA", away:"HAI",  date:"Jun 19", venue:"Philadelphia" },
  { id:"C4", group:"C", home:"SCO", away:"MAR",  date:"Jun 19", venue:"Boston" },
  { id:"C5", group:"C", home:"BRA", away:"SCO",  date:"Jun 23", venue:"New York" },
  { id:"C6", group:"C", home:"MAR", away:"HAI",  date:"Jun 23", venue:"Philadelphia" },

  // ── GROUP D ────────────────────────────────────────────────
  { id:"D1", group:"D", home:"USA", away:"PAR",  date:"Jun 12", venue:"Los Angeles" },
  { id:"D2", group:"D", home:"AUS", away:"TUR",  date:"Jun 13", venue:"Houston" },
  { id:"D3", group:"D", home:"USA", away:"AUS",  date:"Jun 19", venue:"Seattle" },
  { id:"D4", group:"D", home:"TUR", away:"PAR",  date:"Jun 19", venue:"Dallas" },
  { id:"D5", group:"D", home:"USA", away:"TUR",  date:"Jun 23", venue:"Atlanta" },
  { id:"D6", group:"D", home:"PAR", away:"AUS",  date:"Jun 23", venue:"Kansas City" },

  // ── GROUP E ────────────────────────────────────────────────
  { id:"E1", group:"E", home:"GER", away:"CUW",  date:"Jun 14", venue:"Philadelphia" },
  { id:"E2", group:"E", home:"CIV", away:"ECU",  date:"Jun 14", venue:"Dallas" },
  { id:"E3", group:"E", home:"GER", away:"CIV",  date:"Jun 20", venue:"New York" },
  { id:"E4", group:"E", home:"ECU", away:"CUW",  date:"Jun 20", venue:"Miami" },
  { id:"E5", group:"E", home:"GER", away:"ECU",  date:"Jun 24", venue:"Chicago" },
  { id:"E6", group:"E", home:"CUW", away:"CIV",  date:"Jun 24", venue:"Houston" },

  // ── GROUP F ────────────────────────────────────────────────
  { id:"F1", group:"F", home:"NED", away:"JPN",  date:"Jun 15", venue:"Seattle" },
  { id:"F2", group:"F", home:"TUN", away:"UKR",  date:"Jun 15", venue:"Miami" },
  { id:"F3", group:"F", home:"NED", away:"TUN",  date:"Jun 20", venue:"Los Angeles" },
  { id:"F4", group:"F", home:"UKR", away:"JPN",  date:"Jun 20", venue:"Chicago" },
  { id:"F5", group:"F", home:"NED", away:"UKR",  date:"Jun 24", venue:"Dallas" },
  { id:"F6", group:"F", home:"JPN", away:"TUN",  date:"Jun 24", venue:"Seattle" },

  // ── GROUP G ────────────────────────────────────────────────
  { id:"G1", group:"G", home:"BEL", away:"EGY",  date:"Jun 15", venue:"Miami" },
  { id:"G2", group:"G", home:"IRN", away:"NZL",  date:"Jun 15", venue:"Kansas City" },
  { id:"G3", group:"G", home:"BEL", away:"IRN",  date:"Jun 21", venue:"Atlanta" },
  { id:"G4", group:"G", home:"NZL", away:"EGY",  date:"Jun 21", venue:"Houston" },
  { id:"G5", group:"G", home:"BEL", away:"NZL",  date:"Jun 25", venue:"Dallas" },
  { id:"G6", group:"G", home:"EGY", away:"IRN",  date:"Jun 25", venue:"Miami" },

  // ── GROUP H ────────────────────────────────────────────────
  { id:"H1", group:"H", home:"ESP", away:"CPV",  date:"Jun 16", venue:"Los Angeles" },
  { id:"H2", group:"H", home:"URU", away:"KSA",  date:"Jun 16", venue:"Boston" },
  { id:"H3", group:"H", home:"ESP", away:"URU",  date:"Jun 21", venue:"Kansas City" },
  { id:"H4", group:"H", home:"KSA", away:"CPV",  date:"Jun 21", venue:"New York" },
  { id:"H5", group:"H", home:"ESP", away:"KSA",  date:"Jun 25", venue:"Los Angeles" },
  { id:"H6", group:"H", home:"CPV", away:"URU",  date:"Jun 25", venue:"Seattle" },

  // ── GROUP I ────────────────────────────────────────────────
  { id:"I1", group:"I", home:"FRA", away:"SEN",  date:"Jun 16", venue:"San Francisco" },
  { id:"I2", group:"I", home:"NOR", away:"IRQ",  date:"Jun 17", venue:"Chicago" },
  { id:"I3", group:"I", home:"FRA", away:"NOR",  date:"Jun 21", venue:"New York" },
  { id:"I4", group:"I", home:"IRQ", away:"SEN",  date:"Jun 21", venue:"Dallas" },
  { id:"I5", group:"I", home:"FRA", away:"IRQ",  date:"Jun 25", venue:"San Francisco" },
  { id:"I6", group:"I", home:"SEN", away:"NOR",  date:"Jun 25", venue:"Houston" },

  // ── GROUP J ────────────────────────────────────────────────
  { id:"J1", group:"J", home:"ARG", away:"ALG",  date:"Jun 16", venue:"Atlanta" },
  { id:"J2", group:"J", home:"SVK", away:"PAN",  date:"Jun 17", venue:"Miami" },
  { id:"J3", group:"J", home:"ARG", away:"SVK",  date:"Jun 22", venue:"Dallas" },
  { id:"J4", group:"J", home:"PAN", away:"ALG",  date:"Jun 22", venue:"Seattle" },
  { id:"J5", group:"J", home:"ARG", away:"PAN",  date:"Jun 26", venue:"Houston" },
  { id:"J6", group:"J", home:"ALG", away:"SVK",  date:"Jun 26", venue:"Chicago" },

  // ── GROUP K ────────────────────────────────────────────────
  { id:"K1", group:"K", home:"POR", away:"COD",  date:"Jun 17", venue:"Houston" },
  { id:"K2", group:"K", home:"UZB", away:"COL",  date:"Jun 17", venue:"Mexico City" },
  { id:"K3", group:"K", home:"POR", away:"UZB",  date:"Jun 22", venue:"Los Angeles" },
  { id:"K4", group:"K", home:"COL", away:"COD",  date:"Jun 22", venue:"Miami" },
  { id:"K5", group:"K", home:"POR", away:"COL",  date:"Jun 26", venue:"Atlanta" },
  { id:"K6", group:"K", home:"COD", away:"UZB",  date:"Jun 26", venue:"Kansas City" },

  // ── GROUP L ────────────────────────────────────────────────
  { id:"L1", group:"L", home:"ENG", away:"CRO",  date:"Jun 17", venue:"Dallas" },
  { id:"L2", group:"L", home:"GHA", away:"PAN2", date:"Jun 17", venue:"Toronto" },
  { id:"L3", group:"L", home:"ENG", away:"GHA",  date:"Jun 22", venue:"New York" },
  { id:"L4", group:"L", home:"PAN2",away:"CRO",  date:"Jun 22", venue:"Boston" },
  { id:"L5", group:"L", home:"ENG", away:"PAN2", date:"Jun 26", venue:"Philadelphia" },
  { id:"L6", group:"L", home:"CRO", away:"GHA",  date:"Jun 26", venue:"Toronto" },
];

export const getTeam = (code) => WC_TEAMS.find((t) => t.code === code) || { code, name: code, flag: "🏳️" };
export const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
