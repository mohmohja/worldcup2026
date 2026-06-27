import fs from "fs";

const API_KEY = process.env.KICKOFF_API_KEY;
if (!API_KEY) throw new Error("Missing KICKOFF_API_KEY");

const fallbackReal = {
  "mode": "real",
  "generatedAt": "2026-06-27T17:20:00+04:00",
  "source": "Conservative fallback + API refresh",
  "qualifiedTeams": [
    "Mexico",
    "South Africa",
    "Switzerland",
    "Canada",
    "Bosnia & Herzegovina",
    "Brazil",
    "Morocco",
    "United States",
    "Australia",
    "Paraguay",
    "Germany",
    "Ivory Coast",
    "Ecuador",
    "Netherlands",
    "Japan",
    "Sweden",
    "Belgium",
    "Egypt",
    "Spain",
    "Cape Verde",
    "France",
    "Norway",
    "Senegal",
    "Argentina",
    "Colombia",
    "Portugal",
    "England",
    "Ghana"
  ],
  "rounds": [
    {
      "key": "r32",
      "name": "Round of 32",
      "matches": [
        {
          "id": "MATCH 74",
          "date": "JUN 29",
          "home": "Germany",
          "away": "Paraguay"
        },
        {
          "id": "MATCH 77",
          "date": "JUN 30",
          "home": "France",
          "away": "Sweden"
        },
        {
          "id": "MATCH 73",
          "date": "JUN 28",
          "home": "South Africa",
          "away": "Canada"
        },
        {
          "id": "MATCH 75",
          "date": "JUN 29",
          "home": "Netherlands",
          "away": "Morocco"
        },
        {
          "id": "MATCH 83",
          "date": "JUL 2",
          "home": "2K",
          "away": "2L",
          "note": "Provisional slot. Fill from API when Group K/L runner-up positions are confirmed."
        },
        {
          "id": "MATCH 84",
          "date": "JUL 2",
          "home": "Spain",
          "away": "2J",
          "note": "Provisional slot. Fill from API when Group J runner-up is confirmed."
        },
        {
          "id": "MATCH 81",
          "date": "JUL 1",
          "home": "United States",
          "away": "Bosnia & Herzegovina"
        },
        {
          "id": "MATCH 82",
          "date": "JUL 1",
          "home": "1G",
          "away": "3A/E/H/I/J",
          "note": "Provisional slot. Fill from API when matchup is confirmed."
        },
        {
          "id": "MATCH 76",
          "date": "JUN 29",
          "home": "Brazil",
          "away": "Japan"
        },
        {
          "id": "MATCH 78",
          "date": "JUN 30",
          "home": "Ivory Coast",
          "away": "Norway"
        },
        {
          "id": "MATCH 79",
          "date": "JUN 30",
          "home": "Mexico",
          "away": "3C/E/F/H/I",
          "note": "Provisional slot. Fill from API when matchup is confirmed."
        },
        {
          "id": "MATCH 80",
          "date": "JUL 1",
          "home": "1L",
          "away": "3E/H/I/J/K",
          "note": "Provisional slot. Fill from API when matchup is confirmed."
        },
        {
          "id": "MATCH 86",
          "date": "JUL 3",
          "home": "Argentina",
          "away": "Cape Verde"
        },
        {
          "id": "MATCH 88",
          "date": "JUL 3",
          "home": "Australia",
          "away": "Egypt"
        },
        {
          "id": "MATCH 85",
          "date": "JUL 2",
          "home": "Switzerland",
          "away": "3E/F/G/I/J",
          "note": "Provisional slot. Fill from API when matchup is confirmed."
        },
        {
          "id": "MATCH 87",
          "date": "JUL 3",
          "home": "1K",
          "away": "3D/E/I/J/L",
          "note": "Provisional slot. Fill from API when matchup is confirmed."
        }
      ]
    },
    {
      "key": "r16",
      "name": "Round of 16",
      "matches": [
        {
          "id": "MATCH 89",
          "date": "JUL 4",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 90",
          "date": "JUL 4",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 93",
          "date": "JUL 6",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 94",
          "date": "JUL 6",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 91",
          "date": "JUL 5",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 92",
          "date": "JUL 5",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 95",
          "date": "JUL 7",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 96",
          "date": "JUL 7",
          "home": "TBD",
          "away": "TBD"
        }
      ]
    },
    {
      "key": "qf",
      "name": "Quarterfinal",
      "matches": [
        {
          "id": "MATCH 97",
          "date": "JUL 9",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 98",
          "date": "JUL 10",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 99",
          "date": "JUL 11",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 100",
          "date": "JUL 11",
          "home": "TBD",
          "away": "TBD"
        }
      ]
    },
    {
      "key": "sf",
      "name": "Semifinal",
      "matches": [
        {
          "id": "MATCH 101",
          "date": "JUL 14",
          "home": "TBD",
          "away": "TBD"
        },
        {
          "id": "MATCH 102",
          "date": "JUL 15",
          "home": "TBD",
          "away": "TBD"
        }
      ]
    },
    {
      "key": "final",
      "name": "Final",
      "matches": [
        {
          "id": "MATCH 104",
          "date": "JUL 19",
          "home": "TBD",
          "away": "TBD",
          "venue": "MetLife Stadium, NJ"
        },
        {
          "id": "MATCH 103",
          "date": "JUL 18",
          "home": "TBD",
          "away": "TBD",
          "venue": "3rd Place"
        }
      ]
    }
  ],
  "champion": "TBD"
};
const fallbackPrediction = {
  "mode": "prediction",
  "generatedAt": "2026-06-27T17:20:00+04:00",
  "source": "Optional prediction mode",
  "qualifiedTeams": [
    "Mexico",
    "South Africa",
    "Switzerland",
    "Canada",
    "Bosnia & Herzegovina",
    "Brazil",
    "Morocco",
    "United States",
    "Australia",
    "Paraguay",
    "Germany",
    "Ivory Coast",
    "Ecuador",
    "Netherlands",
    "Japan",
    "Sweden",
    "Belgium",
    "Egypt",
    "Spain",
    "Cape Verde",
    "France",
    "Norway",
    "Senegal",
    "Argentina",
    "Colombia",
    "Portugal",
    "England",
    "Ghana"
  ],
  "rounds": [
    {
      "key": "r32",
      "name": "Round of 32",
      "matches": [
        {
          "id": "MATCH 74",
          "date": "JUN 29",
          "home": "Germany",
          "away": "Paraguay",
          "winner": "Germany",
          "predicted": true
        },
        {
          "id": "MATCH 77",
          "date": "JUN 30",
          "home": "France",
          "away": "Sweden",
          "winner": "France",
          "predicted": true
        },
        {
          "id": "MATCH 73",
          "date": "JUN 28",
          "home": "South Africa",
          "away": "Canada",
          "winner": "Canada",
          "predicted": true
        },
        {
          "id": "MATCH 75",
          "date": "JUN 29",
          "home": "Netherlands",
          "away": "Morocco",
          "winner": "Netherlands",
          "predicted": true
        },
        {
          "id": "MATCH 83",
          "date": "JUL 2",
          "home": "Portugal",
          "away": "Ghana",
          "winner": "Portugal",
          "predicted": true
        },
        {
          "id": "MATCH 84",
          "date": "JUL 2",
          "home": "Spain",
          "away": "Austria",
          "winner": "Spain",
          "predicted": true
        },
        {
          "id": "MATCH 81",
          "date": "JUL 1",
          "home": "United States",
          "away": "Bosnia & Herzegovina",
          "winner": "United States",
          "predicted": true
        },
        {
          "id": "MATCH 82",
          "date": "JUL 1",
          "home": "Belgium",
          "away": "South Korea",
          "winner": "Belgium",
          "predicted": true
        },
        {
          "id": "MATCH 76",
          "date": "JUN 29",
          "home": "Brazil",
          "away": "Japan",
          "winner": "Brazil",
          "predicted": true
        },
        {
          "id": "MATCH 78",
          "date": "JUN 30",
          "home": "Ivory Coast",
          "away": "Norway",
          "winner": "Norway",
          "predicted": true
        },
        {
          "id": "MATCH 79",
          "date": "JUN 30",
          "home": "Mexico",
          "away": "Ecuador",
          "winner": "Mexico",
          "predicted": true
        },
        {
          "id": "MATCH 80",
          "date": "JUL 1",
          "home": "England",
          "away": "Senegal",
          "winner": "England",
          "predicted": true
        },
        {
          "id": "MATCH 86",
          "date": "JUL 3",
          "home": "Argentina",
          "away": "Cape Verde",
          "winner": "Argentina",
          "predicted": true
        },
        {
          "id": "MATCH 88",
          "date": "JUL 3",
          "home": "Australia",
          "away": "Egypt",
          "winner": "Australia",
          "predicted": true
        },
        {
          "id": "MATCH 85",
          "date": "JUL 2",
          "home": "Switzerland",
          "away": "Iran",
          "winner": "Switzerland",
          "predicted": true
        },
        {
          "id": "MATCH 87",
          "date": "JUL 3",
          "home": "Colombia",
          "away": "Croatia",
          "winner": "Colombia",
          "predicted": true
        }
      ]
    },
    {
      "key": "r16",
      "name": "Round of 16",
      "matches": [
        {
          "id": "MATCH 89",
          "date": "JUL 4",
          "home": "Germany",
          "away": "France",
          "winner": "France",
          "predicted": true
        },
        {
          "id": "MATCH 90",
          "date": "JUL 4",
          "home": "Canada",
          "away": "Netherlands",
          "winner": "Netherlands",
          "predicted": true
        },
        {
          "id": "MATCH 93",
          "date": "JUL 6",
          "home": "Portugal",
          "away": "Spain",
          "winner": "Spain",
          "predicted": true
        },
        {
          "id": "MATCH 94",
          "date": "JUL 6",
          "home": "United States",
          "away": "Belgium",
          "winner": "Belgium",
          "predicted": true
        },
        {
          "id": "MATCH 91",
          "date": "JUL 5",
          "home": "Brazil",
          "away": "Norway",
          "winner": "Brazil",
          "predicted": true
        },
        {
          "id": "MATCH 92",
          "date": "JUL 5",
          "home": "Mexico",
          "away": "England",
          "winner": "England",
          "predicted": true
        },
        {
          "id": "MATCH 95",
          "date": "JUL 7",
          "home": "Argentina",
          "away": "Australia",
          "winner": "Argentina",
          "predicted": true
        },
        {
          "id": "MATCH 96",
          "date": "JUL 7",
          "home": "Switzerland",
          "away": "Colombia",
          "winner": "Colombia",
          "predicted": true
        }
      ]
    },
    {
      "key": "qf",
      "name": "Quarterfinal",
      "matches": [
        {
          "id": "MATCH 97",
          "date": "JUL 9",
          "home": "France",
          "away": "Netherlands",
          "winner": "France",
          "predicted": true
        },
        {
          "id": "MATCH 98",
          "date": "JUL 10",
          "home": "Brazil",
          "away": "England",
          "winner": "Brazil",
          "predicted": true
        },
        {
          "id": "MATCH 99",
          "date": "JUL 11",
          "home": "Spain",
          "away": "Belgium",
          "winner": "Spain",
          "predicted": true
        },
        {
          "id": "MATCH 100",
          "date": "JUL 11",
          "home": "Argentina",
          "away": "Colombia",
          "winner": "Argentina",
          "predicted": true
        }
      ]
    },
    {
      "key": "sf",
      "name": "Semifinal",
      "matches": [
        {
          "id": "MATCH 101",
          "date": "JUL 14",
          "home": "France",
          "away": "Brazil",
          "winner": "France",
          "predicted": true
        },
        {
          "id": "MATCH 102",
          "date": "JUL 15",
          "home": "Spain",
          "away": "Argentina",
          "winner": "Spain",
          "predicted": true
        }
      ]
    },
    {
      "key": "final",
      "name": "Final",
      "matches": [
        {
          "id": "MATCH 104",
          "date": "JUL 19",
          "home": "France",
          "away": "Spain",
          "winner": "France",
          "predicted": true,
          "venue": "MetLife Stadium, NJ"
        },
        {
          "id": "MATCH 103",
          "date": "JUL 18",
          "home": "Brazil",
          "away": "Argentina",
          "winner": "Argentina",
          "predicted": true,
          "venue": "3rd Place"
        }
      ]
    }
  ],
  "champion": "France"
};

const endpoints = [
  "https://api.kickoffapi.com/api/v1/fixtures?league=1&season=2026",
  "https://api.kickoffapi.com/api/v1/fixtures?league=World%20Cup&season=2026",
  "https://api.kickoffapi.com/api/v1/fixtures?season=2026",
  "https://api.kickoffapi.com/api/v1/fixtures?live=all"
];

let fixtures = [];
let usedEndpoint = null;
const attempts = [];

for (const url of endpoints) {
  try {
    const res = await fetch(url, { headers: { "x-api-key": API_KEY, "accept": "application/json" } });
    const json = await res.json().catch(() => ({}));
    attempts.push({ url, status: res.status, results: json.results ?? (Array.isArray(json.response) ? json.response.length : 0) });
    if (res.ok && Array.isArray(json.response) && json.response.length) {
      fixtures = json.response;
      usedEndpoint = url;
      break;
    }
  } catch (err) {
    attempts.push({ url, error: err.message });
  }
}

const real = buildRealData(fixtures, fallbackReal, usedEndpoint, attempts);
const prediction = fallbackPrediction;
const output = `// Auto-generated by scripts/update-data-js.mjs. Manual edits may be overwritten.\nwindow.REAL_BRACKET_DATA = ${JSON.stringify(real, null, 2)};\n\nwindow.PREDICTION_BRACKET_DATA = ${JSON.stringify(prediction, null, 2)};\n`;
fs.writeFileSync("data.js", output, "utf8");
console.log(`data.js updated. Fixtures: ${fixtures.length}. Endpoint: ${usedEndpoint || "fallback only"}`);

function buildRealData(fixtures, fallback, usedEndpoint, attempts) {
  const next = structuredClone(fallback);
  next.generatedAt = new Date().toISOString();
  next.source = usedEndpoint ? `KickoffAPI snapshot: ${usedEndpoint}` : "Fallback snapshot: KickoffAPI returned no usable full fixtures";
  next.apiAttempts = attempts;

  const apiMatches = normalizeKickoffFixtures(fixtures);
  if (!apiMatches.length) return next;

  // Replace only when API gives actual team names. Keep seed placeholders otherwise.
  for (const round of next.rounds) {
    const apiRound = apiMatches.filter((m) => m.key === round.key);
    if (!apiRound.length) continue;

    for (const apiMatch of apiRound) {
      const idx = findMatchingIndex(round.matches, apiMatch);
      if (idx >= 0) round.matches[idx] = { ...round.matches[idx], ...apiMatch.match };
    }
  }

  // Rebuild qualified teams from actual named teams + fallback confirmed list.
  const teams = new Set(next.qualifiedTeams || []);
  next.rounds.forEach((r) => r.matches.forEach((m) => [m.home, m.away].forEach((t) => {
    if (t && t !== "TBD" && !looksLikeSeed(t)) teams.add(t);
  })));
  next.qualifiedTeams = [...teams];
  return next;
}

function normalizeKickoffFixtures(fixtures) {
  return fixtures.map((f) => {
    const round = String(f.league?.round || f.round || "");
    const key = roundKey(round);
    if (!key) return null;

    const home = f.teams?.home?.name || f.home?.name || "TBD";
    const away = f.teams?.away?.name || f.away?.name || "TBD";
    if (looksLikeSeed(home) || looksLikeSeed(away)) return null;

    const matchNo = extractMatchNumber(f);
    const rawDate = f.fixture?.date || f.date || "";
    let winner = null;
    if (f.teams?.home?.winner) winner = home;
    if (f.teams?.away?.winner) winner = away;

    return {
      key,
      matchNumber: matchNo,
      match: {
        id: matchNo ? `MATCH ${matchNo}` : (f.fixture?.id ? `MATCH ${f.fixture.id}` : "MATCH"),
        date: rawDate ? fmtDate(rawDate) : (f.fixture?.status?.short || f.status || ""),
        rawDate,
        status: f.fixture?.status?.short || f.status || "",
        home,
        away,
        homeScore: f.goals?.home ?? null,
        awayScore: f.goals?.away ?? null,
        winner,
        venue: f.fixture?.venue?.name || ""
      }
    };
  }).filter(Boolean);
}

function findMatchingIndex(existing, apiMatch) {
  if (apiMatch.matchNumber) {
    const idx = existing.findIndex((m) => Number(String(m.id || "").match(/\d+/)?.[0]) === apiMatch.matchNumber);
    if (idx >= 0) return idx;
  }
  // fallback: match by one known side if a placeholder is currently present
  return existing.findIndex((m) =>
    normalize(m.home) === normalize(apiMatch.match.home) ||
    normalize(m.away) === normalize(apiMatch.match.away) ||
    normalize(m.home) === normalize(apiMatch.match.away) ||
    normalize(m.away) === normalize(apiMatch.match.home)
  );
}
function roundKey(round) {
  const r = String(round).toLowerCase();
  if (r.includes("round of 32") || r.includes("last 32")) return "r32";
  if (r.includes("round of 16") || r.includes("8th") || r.includes("last 16")) return "r16";
  if (r.includes("quarter")) return "qf";
  if (r.includes("semi")) return "sf";
  if (r.includes("final") || r.includes("3rd") || r.includes("third")) return "final";
  return null;
}
function extractMatchNumber(f) {
  const text = `${f.fixture?.id || ""} ${f.id || ""} ${f.match_id || ""} ${f.fixture?.referee || ""}`;
  const m = text.match(/\b(7[3-9]|8[0-8]|9[0-9]|10[0-4])\b/);
  return m ? Number(m[1]) : null;
}
function fmtDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value || "").toUpperCase();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).toUpperCase();
}
function normalize(s) { return String(s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, ""); }
function looksLikeSeed(v) { return /^(\d+[a-l]|\d+[a-l/]+|[123][a-l](\/|$)|tbd|[123].*)$/i.test(String(v || "").trim()); }
