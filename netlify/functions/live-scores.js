// Netlify Function: World Cup 2026 data proxy
// 1) Tries Footballdata.io with your key
// 2) If Footballdata.io returns 401/403 or fails, falls back to WorldCupFixtureAPI (no-key fixture API)
const FOOTBALLDATA_API_KEY = process.env.FOOTBALLDATA_API_KEY || "ft_worldcup_61fb89bf7167112d84041f4bec439d343cdf6d0b";
const FOOTBALLDATA_LEAGUE_ID = process.env.FOOTBALLDATA_LEAGUE_ID || "50";

exports.handler = async function () {
  const attempts = [];

  // ---------- Provider 1: Footballdata.io ----------
  if (FOOTBALLDATA_API_KEY) {
    const footballdataUrls = [
      `https://footballdata.io/api/v1/fixtures/live?league_id=${FOOTBALLDATA_LEAGUE_ID}`,
      `https://footballdata.io/api/v1/fixtures/today?league_id=${FOOTBALLDATA_LEAGUE_ID}`,
      `https://footballdata.io/api/v1/fixtures/upcoming?league_id=${FOOTBALLDATA_LEAGUE_ID}`,
      `https://footballdata.io/api/v1/matches?league_id=${FOOTBALLDATA_LEAGUE_ID}`
    ];

    for (const url of footballdataUrls) {
      const result = await tryFetch(url, {
        Authorization: `Bearer ${FOOTBALLDATA_API_KEY}`,
        Accept: "application/json",
        "User-Agent": "worldcup2026-bracket/1.0"
      });

      attempts.push({ provider: "footballdata.io", url, status: result.status, error: result.error });

      if (result.ok) {
        return json(200, normalizeAnyProvider(result.body, url, attempts, "footballdata.io"));
      }

      // IMPORTANT: do not stop on 401/403. Continue to free fallback provider.
    }
  }

  // ---------- Provider 2: WorldCupFixtureAPI fallback, no key ----------
  const fallbackUrls = [
    "https://worldcupfixtureapi.com/api/matches/today",
    "https://worldcupfixtureapi.com/api/matches?stage=knockout",
    "https://worldcupfixtureapi.com/api/matches",
    "https://worldcupfixtureapi.com/api/teams"
  ];

  for (const url of fallbackUrls) {
    const result = await tryFetch(url, { Accept: "application/json" });
    attempts.push({ provider: "worldcupfixtureapi.com", url, status: result.status, error: result.error });

    if (result.ok) {
      return json(200, normalizeAnyProvider(result.body, url, attempts, "worldcupfixtureapi.com"));
    }
  }

  // Return 200, not 401/403, so the page does not show a hard API error.
  // The bracket can still display local fallback teams.
  return json(200, {
    provider: "fallback-local",
    warning: "No external API provider returned usable data. Showing local bracket fallback.",
    attempts,
    count: 0,
    data: []
  });
};

async function tryFetch(url, headers) {
  try {
    const res = await fetch(url, { method: "GET", headers });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }
    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    return { ok: false, status: "FETCH_FAILED", error: e.message };
  }
}

function normalizeAnyProvider(raw, endpoint, attempts, provider) {
  const matches = extractMatches(raw);

  const data = matches.map((m) => {
    const homeName = getFirst(
      m.home_team?.team_name,
      m.home_team?.name,
      m.home?.name,
      m.home?.team_name,
      m.homeTeam?.name,
      m.homeTeam,
      m.localteam?.name,
      m.team_home,
      m.home_name
    );

    const awayName = getFirst(
      m.away_team?.team_name,
      m.away_team?.name,
      m.away?.name,
      m.away?.team_name,
      m.awayTeam?.name,
      m.awayTeam,
      m.visitorteam?.name,
      m.team_away,
      m.away_name
    );

    const homeScore = getFirst(
      m.score?.home,
      m.scores?.home_score,
      m.home_team?.score,
      m.home?.score,
      m.homeScore,
      m.localteam_score
    );

    const awayScore = getFirst(
      m.score?.away,
      m.scores?.away_score,
      m.away_team?.score,
      m.away?.score,
      m.awayScore,
      m.visitorteam_score
    );

    const competition = getFirst(
      m.league?.competition_name,
      m.league?.name,
      m.competition?.name,
      m.competition_name,
      "World Cup"
    );

    return {
      match_id: String(getFirst(m.match_id, m.id, m.fixture_id, m.matchId, "")),
      competition,
      status: getFirst(m.status, m.status_name, m.state, "scheduled"),
      minute: getFirst(m.minute, m.elapsed, m.time?.minute, null),
      home: { name: homeName || "TBD", score: homeScore ?? null },
      away: { name: awayName || "TBD", score: awayScore ?? null },
      source_endpoint: endpoint,
      raw: m
    };
  }).filter((m) => m.home.name !== "TBD" || m.away.name !== "TBD");

  return { provider, endpoint, attempts, count: data.length, data };
}

function extractMatches(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.matches)) return raw.data.matches;
  if (Array.isArray(raw?.matches)) return raw.matches;
  if (Array.isArray(raw?.fixtures)) return raw.fixtures;
  if (Array.isArray(raw?.response)) return raw.response;
  if (Array.isArray(raw?.teams)) return [];
  return [];
}

function getFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...cors(),
      "content-type": "application/json",
      "cache-control": "public, max-age=30"
    },
    body: JSON.stringify(body)
  };
}

function cors() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, authorization"
  };
}
