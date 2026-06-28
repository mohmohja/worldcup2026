// Netlify Function: KickoffAPI proxy with friendly fallback
// If KickoffAPI returns 403, the site will keep using data.js without showing an error-like message.
const CACHE_MS = Number(process.env.KICKOFF_CACHE_MS || 15 * 60 * 1000);
const KICKOFF_API_KEY = process.env.KICKOFF_API_KEY || "";
let cache = { expiresAt: 0, body: null };

exports.handler = async function(event) {
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

  const endpoints = [
    "https://api.kickoffapi.com/api/v1/fixtures?league=1&season=2026",
    "https://api.kickoffapi.com/api/v1/fixtures?league=World%20Cup&season=2026",
    "https://api.kickoffapi.com/api/v1/fixtures?season=2026",
    "https://api.kickoffapi.com/api/v1/fixtures?live=all"
  ];

  const attempts = [];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          "x-api-key": KICKOFF_API_KEY,
          "accept": "application/json"
        }
      });

      const text = await res.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = { raw: text.slice(0, 500) }; }

      attempts.push({
        url,
        status: res.status,
        ok: res.ok,
        results: payload.results ?? (Array.isArray(payload.response) ? payload.response.length : undefined),
        hasResponseArray: Array.isArray(payload.response),
        upstreamMessage: payload.message || payload.error || payload.warning || undefined
      });

      if (res.ok && Array.isArray(payload.response) && payload.response.length > 0) {
        const body = {
          provider: "kickoffapi",
          message: "Live API data refreshed.",
          sourceUrl: url,
          attempts: debug ? attempts : undefined,
          keyInfo: debug ? keyInfo : undefined,
          response: payload.response
        };
        cache = { expiresAt: Date.now() + CACHE_MS, body };
        return json(200, body);
      }
    } catch (e) {
      attempts.push({ url, status: "FETCH_FAILED", error: e.message });
    }
  }

  const has403 = attempts.some(a => a.status === 403);
  const has401 = attempts.some(a => a.status === 401);

  if (has401) {
    return fallback("Saved bracket loaded. KickoffAPI key is invalid or missing permission.", keyInfo, attempts, debug);
  }
  if (has403) {
    return fallback("Saved bracket loaded. KickoffAPI key works but this endpoint is not available on your plan, so data.js is used.", keyInfo, attempts, debug);
  }

  return fallback("Saved bracket loaded. No new API updates found.", keyInfo, attempts, debug);
};

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
