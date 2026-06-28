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
  { code: "SWE", name: "Sweden", flag: "🇸🇪", iso: "se" },
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
 { code: "AUT", name: "Austria", flag: "🇦🇹", iso: "at" },  // replaces SVK
{ code: "JOR", name: "Jordan",  flag: "🇯🇴", iso: "jo" },
  // Group K
  { code: "POR",  name: "Portugal",        flag: "🇵🇹", iso: "pt"     },
  { code: "COD",  name: "DR Congo",        flag: "🇨🇩", iso: "cd"     },
  { code: "UZB",  name: "Uzbekistan",      flag: "🇺🇿", iso: "uz"     },
  { code: "COL",  name: "Colombia",        flag: "🇨🇴", iso: "co"     },
  // Group L
  { code: "ENG",  name: "England",         flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", iso: "gb-eng" },
  { code: "CRO",  name: "Croatia",         flag: "🇭🇷", iso: "hr"     },
  { code: "GHA",  name: "Ghana",           flag: "🇬🇭", iso: "gh"     },
  { code: "PAN", name: "Panama",  flag: "🇵🇦", iso: "pa" },
];
// All 72 group stage matches (each group: 6 matches = 3 matchdays)
export const GROUP_STAGE_MATCHES = [
  // ── GROUP A ──
  { id:"A1", group:"A", home:"MEX", away:"RSA",  date:"Jun 11", venue:"Mexico City" },
  { id:"A2", group:"A", home:"KOR", away:"CZE",  date:"Jun 11", venue:"Zapopan" },
  { id:"A3", group:"A", home:"CZE", away:"RSA",  date:"Jun 18", venue:"Atlanta" },
  { id:"A4", group:"A", home:"MEX", away:"KOR",  date:"Jun 18", venue:"Zapopan" },
  { id:"A5", group:"A", home:"CZE", away:"MEX",  date:"Jun 24", venue:"Mexico City" },
  { id:"A6", group:"A", home:"RSA", away:"KOR",  date:"Jun 24", venue:"Monterrey" },

  // ── GROUP B ──
  { id:"B1", group:"B", home:"CAN", away:"BIH",  date:"Jun 12", venue:"Toronto" },
  { id:"B2", group:"B", home:"QAT", away:"SUI",  date:"Jun 13", venue:"Santa Clara" },
  { id:"B3", group:"B", home:"SUI", away:"BIH",  date:"Jun 18", venue:"Inglewood" },
  { id:"B4", group:"B", home:"CAN", away:"QAT",  date:"Jun 18", venue:"Vancouver" },
  { id:"B5", group:"B", home:"SUI", away:"CAN",  date:"Jun 24", venue:"Vancouver" },
  { id:"B6", group:"B", home:"BIH", away:"QAT",  date:"Jun 24", venue:"Seattle" },

  // ── GROUP C ──
  { id:"C1", group:"C", home:"BRA", away:"MAR",  date:"Jun 13", venue:"New Jersey" },
  { id:"C2", group:"C", home:"HAI", away:"SCO",  date:"Jun 13", venue:"Boston" },
  { id:"C3", group:"C", home:"SCO", away:"MAR",  date:"Jun 19", venue:"Boston" },
  { id:"C4", group:"C", home:"BRA", away:"HAI",  date:"Jun 19", venue:"Philadelphia" },
  { id:"C5", group:"C", home:"SCO", away:"BRA",  date:"Jun 24", venue:"Miami Gardens" },
  { id:"C6", group:"C", home:"MAR", away:"HAI",  date:"Jun 24", venue:"Atlanta" },

  // ── GROUP D ──
  { id:"D1", group:"D", home:"USA", away:"PAR",  date:"Jun 12", venue:"Inglewood" },
  { id:"D2", group:"D", home:"AUS", away:"TUR",  date:"Jun 14", venue:"Vancouver" },
  { id:"D3", group:"D", home:"USA", away:"AUS",  date:"Jun 19", venue:"Seattle" },
  { id:"D4", group:"D", home:"TUR", away:"PAR",  date:"Jun 19", venue:"Santa Clara" },
  { id:"D5", group:"D", home:"TUR", away:"USA",  date:"Jun 25", venue:"Inglewood" },
  { id:"D6", group:"D", home:"PAR", away:"AUS",  date:"Jun 25", venue:"Santa Clara" },

  // ── GROUP E ──
  { id:"E1", group:"E", home:"GER", away:"CUW",  date:"Jun 14", venue:"Houston" },
  { id:"E2", group:"E", home:"CIV", away:"ECU",  date:"Jun 14", venue:"Philadelphia" },
  { id:"E3", group:"E", home:"GER", away:"CIV",  date:"Jun 20", venue:"Toronto" },
  { id:"E4", group:"E", home:"ECU", away:"CUW",  date:"Jun 20", venue:"Kansas City" },
  { id:"E5", group:"E", home:"ECU", away:"GER",  date:"Jun 25", venue:"New Jersey" },
  { id:"E6", group:"E", home:"CUW", away:"CIV",  date:"Jun 25", venue:"Philadelphia" },

  // ── GROUP F ──
  { id:"F1", group:"F", home:"NED", away:"JPN",  date:"Jun 14", venue:"Arlington" },
  { id:"F2", group:"F", home:"SWE", away:"TUN",  date:"Jun 14", venue:"Monterrey" },
  { id:"F3", group:"F", home:"NED", away:"SWE",  date:"Jun 20", venue:"Houston" },
  { id:"F4", group:"F", home:"TUN", away:"JPN",  date:"Jun 21", venue:"Monterrey" },
  { id:"F5", group:"F", home:"TUN", away:"NED",  date:"Jun 25", venue:"Kansas City" },
  { id:"F6", group:"F", home:"JPN", away:"SWE",  date:"Jun 25", venue:"Arlington" },

  // ── GROUP G ──
  { id:"G1", group:"G", home:"BEL", away:"EGY",  date:"Jun 15", venue:"Seattle" },
  { id:"G2", group:"G", home:"IRN", away:"NZL",  date:"Jun 15", venue:"Inglewood" },
  { id:"G3", group:"G", home:"BEL", away:"IRN",  date:"Jun 21", venue:"Inglewood" },
  { id:"G4", group:"G", home:"NZL", away:"EGY",  date:"Jun 21", venue:"Vancouver" },
  { id:"G5", group:"G", home:"NZL", away:"BEL",  date:"Jun 26", venue:"Vancouver" },
  { id:"G6", group:"G", home:"EGY", away:"IRN",  date:"Jun 26", venue:"Seattle" },

  // ── GROUP H ──
  { id:"H1", group:"H", home:"ESP", away:"CPV",  date:"Jun 15", venue:"Atlanta" },
  { id:"H2", group:"H", home:"KSA", away:"URU",  date:"Jun 15", venue:"Miami Gardens" },
  { id:"H3", group:"H", home:"ESP", away:"KSA",  date:"Jun 21", venue:"Atlanta" },
  { id:"H4", group:"H", home:"URU", away:"CPV",  date:"Jun 21", venue:"Miami Gardens" },
  { id:"H5", group:"H", home:"URU", away:"ESP",  date:"Jun 26", venue:"Zapopan" },
  { id:"H6", group:"H", home:"CPV", away:"KSA",  date:"Jun 26", venue:"Houston" },

  // ── GROUP I ──
  { id:"I1", group:"I", home:"FRA", away:"SEN",  date:"Jun 16", venue:"New Jersey" },
  { id:"I2", group:"I", home:"IRQ", away:"NOR",  date:"Jun 16", venue:"Boston" },
  { id:"I3", group:"I", home:"FRA", away:"IRQ",  date:"Jun 22", venue:"Philadelphia" },
  { id:"I4", group:"I", home:"NOR", away:"SEN",  date:"Jun 22", venue:"New Jersey" },
  { id:"I5", group:"I", home:"NOR", away:"FRA",  date:"Jun 26", venue:"Boston" },
  { id:"I6", group:"I", home:"SEN", away:"IRQ",  date:"Jun 26", venue:"Toronto" },

  // ── GROUP J ──
  { id:"J1", group:"J", home:"ARG", away:"ALG",  date:"Jun 16", venue:"Kansas City" },
  { id:"J2", group:"J", home:"AUT", away:"JOR",  date:"Jun 17", venue:"Santa Clara" },
  { id:"J3", group:"J", home:"ARG", away:"AUT",  date:"Jun 22", venue:"Arlington" },
  { id:"J4", group:"J", home:"JOR", away:"ALG",  date:"Jun 22", venue:"Santa Clara" },
  { id:"J5", group:"J", home:"JOR", away:"ARG",  date:"Jun 27", venue:"Houston" },
  { id:"J6", group:"J", home:"ALG", away:"AUT",  date:"Jun 27", venue:"Chicago" },

  // ── GROUP K ──
  { id:"K1", group:"K", home:"POR", away:"COD",  date:"Jun 17", venue:"Houston" },
  { id:"K2", group:"K", home:"UZB", away:"COL",  date:"Jun 17", venue:"Mexico City" },
  { id:"K3", group:"K", home:"POR", away:"UZB",  date:"Jun 23", venue:"Houston" },
  { id:"K4", group:"K", home:"COL", away:"COD",  date:"Jun 23", venue:"Zapopan" },
  { id:"K5", group:"K", home:"COL", away:"POR",  date:"Jun 27", venue:"Miami Gardens" },
  { id:"K6", group:"K", home:"COD", away:"UZB",  date:"Jun 27", venue:"Atlanta" },

  // ── GROUP L ──
  { id:"L1", group:"L", home:"ENG", away:"CRO",  date:"Jun 17", venue:"Arlington" },
  { id:"L2", group:"L", home:"GHA", away:"PAN",  date:"Jun 17", venue:"Toronto" },
  { id:"L3", group:"L", home:"ENG", away:"GHA",  date:"Jun 23", venue:"Boston" },
  { id:"L4", group:"L", home:"PAN", away:"CRO",  date:"Jun 23", venue:"Toronto" },
  { id:"L5", group:"L", home:"PAN", away:"ENG",  date:"Jun 27", venue:"New Jersey" },
  { id:"L6", group:"L", home:"CRO", away:"GHA",  date:"Jun 27", venue:"Philadelphia" },
];
export const getTeam = (code) => WC_TEAMS.find((t) => t.code === code) || { code, name: code, flag: "🏳️" };
export const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
