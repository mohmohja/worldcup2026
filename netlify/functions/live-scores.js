// Netlify Function: Footballdata.io World Cup live scores proxy
// Key provided by user. Recommended production setup: set FOOTBALLDATA_API_KEY in Netlify env vars.
const FOOTBALLDATA_API_KEY = process.env.FOOTBALLDATA_API_KEY || "ft_worldcup_61fb89bf7167112d84041f4bec439d343cdf6d0b";

exports.handler = async function () {
  if (!FOOTBALLDATA_API_KEY) {
    return json(500, { error: "Missing FOOTBALLDATA_API_KEY environment variable" });
  }

  // World Cup league_id according to Footballdata.io World Cup API examples.
  const leagueId = process.env.FOOTBALLDATA_LEAGUE_ID || "50";

  // Try live first. If no live matches, your front-end will still display fallback bracket data.
  const endpoints = [
    `https://api.footballdata.io/api/v1/fixtures/live?league_id=${leagueId}`,
    `https://api.footballdata.io/api/v1/fixtures/today?league_id=${leagueId}`,
    `https://api.footballdata.io/api/v1/fixtures/upcoming?league_id=${leagueId}`
  ];

  let lastError = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FOOTBALLDATA_API_KEY}`,
          Accept: "application/json"
        }
      });

      const text = await res.text();
      let raw;
      try { raw = JSON.parse(text); } catch { raw = { raw: text }; }

      // If auth/permission fails, return API error details to browser status/debugging.
      if (res.status === 401 || res.status === 403) {
        return json(res.status, {
          error: "Footballdata.io rejected the API request",
          status: res.status,
          endpoint: url,
          upstream: raw
        });
      }

      if (!res.ok) {
        lastError = { status: res.status, endpoint: url, upstream: raw };
        continue;
      }

      return json(200, normalizeFootballdata(raw, url));
    } catch (e) {
      lastError = { endpoint: url, error: e.message };
    }
  }

  return json(502, {
    error: "All Footballdata.io endpoints failed",
    lastError
  });
};

function normalizeFootballdata(raw, endpoint) {
  const matches = extractMatches(raw);

  // Return a normalized shape compatible with the existing app.js merge function:
  // { data: [{ competition, status, minute, home:{name,score}, away:{name,score} }] }
  const data = matches.map((m) => {
    const homeName =
      m.home_team?.team_name || m.home_team?.name || m.home?.name || m.home?.team_name || m.localteam?.name || "TBD";

    const awayName =
      m.away_team?.team_name || m.away_team?.name || m.away?.name || m.away?.team_name || m.visitorteam?.name || "TBD";

    const homeScore =
      m.score?.home ?? m.scores?.home_score ?? m.home_team?.score ?? m.home?.score ?? m.localteam_score ?? null;

    const awayScore =
      m.score?.away ?? m.scores?.away_score ?? m.away_team?.score ?? m.away?.score ?? m.visitorteam_score ?? null;

    const competition =
      m.league?.competition_name || m.league?.name || m.competition?.name || m.competition_name || "World Cup";

    return {
      match_id: String(m.match_id || m.id || m.fixture_id || ""),
      competition,
      status: m.status || m.status_name || m.state || "scheduled",
      minute: m.minute || m.elapsed || m.time?.minute || null,
      home: { name: homeName, score: homeScore },
      away: { name: awayName, score: awayScore },
      source_endpoint: endpoint,
      raw: m
    };
  });

  return {
    provider: "footballdata.io",
    endpoint,
    count: data.length,
    data
  };
}

function extractMatches(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.matches)) return raw.data.matches;
  if (Array.isArray(raw?.matches)) return raw.matches;
  if (Array.isArray(raw?.response)) return raw.response;
  return [];
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
