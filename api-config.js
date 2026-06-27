window.API_CONFIG = {
  // IMPORTANT:
  // Keep provider as "proxy" because the current app.js checks for provider === "proxy".
  // The proxy function below now connects to TheStatsAPI.
  provider: "proxy",
  refreshSeconds: 60,

  // Legacy object kept only so older app.js versions do not break.
  // The real key is used server-side in netlify/functions/live-scores.js.
  apiFootball: {
    enabled: false,
    baseUrl: "https://v3.football.api-sports.io",
    apiKey: "DO_NOT_USE_BROWSER_KEY",
    league: 1,
    season: 2026
  }
};
