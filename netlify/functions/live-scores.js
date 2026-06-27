const CACHE_MS = Number(process.env.KICKOFF_CACHE_MS || 15 * 60 * 1000);
const KICKOFF_API_KEY = process.env.KICKOFF_API_KEY || "ft_worldcup_61fb89bf7167112d84041f4bec439d343cdf6d0b";
let cache = { expiresAt: 0, body: null };

exports.handler = async function(event) {
  const force = event?.queryStringParameters?.force === "1";
  if (!force && cache.body && Date.now() < cache.expiresAt) return json(200, { ...cache.body, cached: true });
  if (!KICKOFF_API_KEY) return json(200, { warning: "Missing KICKOFF_API_KEY. Using data.js fallback.", response: [] });

  const endpoints = [
    "https://api.kickoffapi.com/api/v1/fixtures?league=1&season=2026",
    "https://api.kickoffapi.com/api/v1/fixtures?league=World%20Cup&season=2026",
    "https://api.kickoffapi.com/api/v1/fixtures?season=2026",
    "https://api.kickoffapi.com/api/v1/fixtures?live=all"
  ];
  const attempts = [];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: { "x-api-key": KICKOFF_API_KEY, "accept": "application/json" } });
      const payload = await res.json().catch(() => ({}));
      attempts.push({ url, status: res.status, results: payload.results ?? (Array.isArray(payload.response) ? payload.response.length : 0) });
      if (res.ok && Array.isArray(payload.response)) {
        const body = { provider: "kickoffapi", sourceUrl: url, attempts, response: payload.response };
        cache = { expiresAt: Date.now() + CACHE_MS, body };
        return json(200, body);
      }
    } catch (e) { attempts.push({ url, error: e.message }); }
  }
  return json(200, { warning: "KickoffAPI returned no usable fixtures. Using data.js fallback.", attempts, response: [] });
};
function json(statusCode, body) {
  return { statusCode, headers: { "access-control-allow-origin": "*", "content-type": "application/json", "cache-control": "public, max-age=900" }, body: JSON.stringify(body) };
}
