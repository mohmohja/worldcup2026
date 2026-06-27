// Netlify Function: Footballdata.io proxy for World Cup 2026 bracket
// Recommended: set FOOTBALLDATA_API_KEY in Netlify Environment Variables.
const FOOTBALLDATA_API_KEY = process.env.FOOTBALLDATA_API_KEY || "ft_worldcup_61fb89bf7167112d84041f4bec439d343cdf6d0b";
const FOOTBALLDATA_LEAGUE_ID = process.env.FOOTBALLDATA_LEAGUE_ID || "50";

exports.handler = async function () {
  if (!FOOTBALLDATA_API_KEY) {
    return json(500, { error: "Missing FOOTBALLDATA_API_KEY environment variable" });
  }

  // Primary fix: use footballdata.io as the host, not api.footballdata.io.
  // The docs/API explorer show endpoints under footballdata.io with paths such as /fixtures/live.
  const bases = [
    "https://footballdata.io/api/v1",
    "https://footballdata.io"
  ];

  const paths = [
    `/fixtures/live?league_id=${FOOTBALLDATA_LEAGUE_ID}`,
    `/fixtures/today?league_id=${FOOTBALLDATA_LEAGUE_ID}`,
    `/fixtures/upcoming?league_id=${FOOTBALLDATA_LEAGUE_ID}`,
    `/matches?league_id=${FOOTBALLDATA_LEAGUE_ID}`
  ];

  const attempts = [];

  for (const base of bases) {
    for (const path of paths) {
      const url = base + path;
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${FOOTBALLDATA_API_KEY}`,
            Accept: "application/json",
            "User-Agent": "worldcup2026-bracket/1.0"
          }
        });

        const text = await res.text();
        let raw;
        try { raw = JSON.parse(text); } catch { raw = { raw: text }; }

        attempts.push({ url, status: res.status });

        if (res.status === 401 || res.status === 403) {
          return json(res.status, {
            error: "Footballdata.io rejected the API request",
            status: res.status,
            endpoint: url,
            upstream: raw,
            attempts
          });
        }

        if (!res.ok) continue;

        return json(200, normalizeFootballdata(raw, url, attempts));
      } catch (e) {
        attempts.push({ url, error: e.message });
      }
    }
  }

  return json(502, {
    error: "All Footballdata.io endpoint attempts failed",
    attempts
  });
};

function normalizeFootballdata(raw, endpoint, attempts) {
  const matches = extractMatches(raw);

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
    attempts,
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
