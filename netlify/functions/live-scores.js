// Netlify Function: KickoffAPI proxy with friendly fallback
//
// Fixes vs previous version:
// 1. KickoffAPI's documented /fixtures endpoint does NOT take a `round`
//    query param, and `live=all` requires a paid plan. We now fetch by
//    date range (`from`/`to`) which works on the free tier, and filter
//    rounds client-side from whatever `round` field comes back on each
//    fixture.
// 2. The League ID for "World Cup" was hardcoded as 1 (a guess). We now
//    resolve it dynamically via /leagues?search=World Cup and cache it,
//    so we don't silently query the wrong competition.
// 3. KickoffAPI's fixture shape is not fully consistent in the public
//    docs/examples (one shows nested teams.home/teams.away + goals.home,
//    another flat homeTeam.name/homeTeam.goals). We now normalize both.
const CACHE_MS = Number(process.env.KICKOFF_CACHE_MS || 15 * 60 * 1000);
const KICKOFF_API_KEY = process.env.KICKOFF_API_KEY || "ft_worldcup_61fb89bf7167112d84041f4bec439d343cdf6d0b";
const BASE = "https://api.kickoffapi.com/api/v1";

let cache = { expiresAt: 0, body: null };
let leagueIdCache = { id: null, expiresAt: 0 };

exports.handler = async function (event) {
  const params = event?.queryStringParameters || {};
  const force = params.force === "1";
  const debug = params.debug === "1";

  if (!force && !debug && cache.body && Date.now() < cache.expiresAt) {
    return json(200, { ...cache.body, cached: true });
  }

  const keyInfo = {
    present: Boolean(KICKOFF_API_KEY),
    length: KICKOFF_API_KEY.length,
    preview: KICKOFF_API_KEY ? `${KICKOFF_API_KEY.slice(0, 4)}...${KICKOFF_API_KEY.slice(-4)}` : "missing",
    looksLikeFootballdataKey: KICKOFF_API_KEY.startsWith("ft_")
  };

  if (!KICKOFF_API_KEY) {
    return fallback("Saved bracket loaded. Add KICKOFF_API_KEY in Netlify to enable API refresh.", keyInfo, [], debug);
  }
  if (KICKOFF_API_KEY.startsWith("ft_")) {
    return fallback("Saved bracket loaded. KICKOFF_API_KEY contains a Footballdata key, not a KickoffAPI key.", keyInfo, [], debug);
  }

  const attempts = [];

  // Step 1: resolve the World Cup league id (cached for an hour) instead of guessing.
  let leagueId;
  try {
    leagueId = await resolveWorldCupLeagueId(attempts);
  } catch (e) {
    attempts.push({ step: "resolveLeague", error: e.message });
  }

  // Step 2: pull fixtures across the tournament window using documented
  // params only (league, season, from, to). No `round`, no `live=all`.
  const from = "2026-06-11"; // tournament start
  const to = "2026-07-19"; // tournament end
  const qs = new URLSearchParams({ season: "2026", from, to });
  if (leagueId) qs.set("league", String(leagueId));

  const url = `${BASE}/fixtures?${qs.toString()}`;

  try {
    const res = await fetchJson(url);
    attempts.push({
      url,
      status: res.status,
      ok: res.ok,
      results: res.payload?.results ?? (Array.isArray(res.payload?.response) ? res.payload.response.length : undefined),
      hasResponseArray: Array.isArray(res.payload?.response),
      upstreamMessage: res.payload?.message || res.payload?.error || res.payload?.warning || undefined
    });

    if (res.status === 401) {
      return fallback("Saved bracket loaded. KickoffAPI key is invalid or missing permission.", keyInfo, attempts, debug);
    }
    if (res.status === 403) {
      return fallback("Saved bracket loaded. KickoffAPI key works but this endpoint/league is not available on your plan, so data.js is used.", keyInfo, attempts, debug);
    }

    if (res.ok && Array.isArray(res.payload?.response) && res.payload.response.length > 0) {
      const normalized = res.payload.response.map(normalizeFixture).filter(Boolean);
      const body = {
        provider: "kickoffapi",
        message: "Live API data refreshed.",
        sourceUrl: url,
        leagueId: leagueId ?? null,
        attempts: debug ? attempts : undefined,
        keyInfo: debug ? keyInfo : undefined,
        // app.js's mergeFootballResponse expects the API-FOOTBALL-style nested
        // shape (fixture.date, teams.home.name, goals.home, league.round) — we
        // emit that here so the rest of the front-end pipeline keeps working.
        response: normalized
      };
      cache = { expiresAt: Date.now() + CACHE_MS, body };
      return json(200, body);
    }
  } catch (e) {
    attempts.push({ url, status: "FETCH_FAILED", error: e.message });
  }

  return fallback("Saved bracket loaded. No new API updates found.", keyInfo, attempts, debug);
};

async function resolveWorldCupLeagueId(attempts) {
  if (leagueIdCache.id && Date.now() < leagueIdCache.expiresAt) return leagueIdCache.id;
  const url = `${BASE}/leagues?search=World%20Cup`;
  const res = await fetchJson(url);
  attempts.push({ url, status: res.status, ok: res.ok, results: res.payload?.results });
  const list = Array.isArray(res.payload?.response) ? res.payload.response : [];
  // Prefer an exact/contains "World Cup" match that's a Cup type, not e.g. "World Cup Qualifiers".
  const match =
    list.find((l) => /^world cup$/i.test(l.name || "")) ||
    list.find((l) => /world cup/i.test(l.name || "") && !/qualif/i.test(l.name || "")) ||
    list[0];
  if (match?.id) {
    leagueIdCache = { id: match.id, expiresAt: Date.now() + 60 * 60 * 1000 };
    return match.id;
  }
  return null;
}

// Normalize KickoffAPI's fixture object — which may come back in either a
// nested shape (fixture.id/date, teams.home.name, goals.home, league.round)
// or a flatter shape (id, date, statusShort, homeTeam.name, homeTeam.goals)
// — into the single nested shape app.js's mergeFootballResponse already
// understands, so we don't have to touch the front-end merge logic.
function normalizeFixture(f) {
  if (!f) return null;
  const isNested = !!(f.fixture || f.teams || f.goals);

  if (isNested) {
    return {
      fixture: {
        id: f.fixture?.id ?? f.id,
        date: f.fixture?.date ?? f.date,
        status: { short: f.fixture?.status?.short ?? f.statusShort ?? "" },
        venue: f.fixture?.venue
      },
      league: { round: f.league?.round ?? f.round ?? "" },
      teams: {
        home: { name: f.teams?.home?.name ?? f.homeTeam?.name, winner: f.teams?.home?.winner ?? null },
        away: { name: f.teams?.away?.name ?? f.awayTeam?.name, winner: f.teams?.away?.winner ?? null }
      },
      goals: {
        home: f.goals?.home ?? f.homeTeam?.goals ?? null,
        away: f.goals?.away ?? f.awayTeam?.goals ?? null
      }
    };
  }

  // Flat shape: id, date, statusShort, homeTeam:{name,goals}, awayTeam:{name,goals}, round
  const homeGoals = f.homeTeam?.goals ?? null;
  const awayGoals = f.awayTeam?.goals ?? null;
  const statusShort = f.statusShort || "";
  let winnerHome = null;
  let winnerAway = null;
  if (statusShort === "FT" && homeGoals != null && awayGoals != null) {
    if (homeGoals > awayGoals) winnerHome = true;
    if (awayGoals > homeGoals) winnerAway = true;
  }

  return {
    fixture: { id: f.id, date: f.date, status: { short: statusShort }, venue: f.venue ? { name: f.venue } : undefined },
    league: { round: f.round || "" },
    teams: {
      home: { name: f.homeTeam?.name, winner: winnerHome },
      away: { name: f.awayTeam?.name, winner: winnerAway }
    },
    goals: { home: homeGoals, away: awayGoals }
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "x-api-key": KICKOFF_API_KEY, accept: "application/json" } });
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text.slice(0, 500) };
  }
  return { status: res.status, ok: res.ok, payload };
}

function fallback(message, keyInfo, attempts, debug) {
  return json(200, {
    provider: "datajs-fallback",
    message,
    warning: message,
    keyInfo: debug ? keyInfo : undefined,
    attempts: debug ? attempts : undefined,
    response: []
  });
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "access-control-allow-origin": "*",
      "content-type": "application/json",
      "cache-control": "public, max-age=60"
    },
    body: JSON.stringify(body, null, 2)
  };
}
