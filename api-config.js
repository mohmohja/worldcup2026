window.API_CONFIG = {
  // app.js calls /.netlify/functions/live-scores when provider is "proxy".
  provider: "proxy",
  refreshSeconds: 60,

  // API key is NOT used in browser. It is used server-side in Netlify Function.
  apiFootball: {
    enabled: false,
    baseUrl: "",
    apiKey: "DO_NOT_PUT_KEY_HERE",
    league: 50,
    season: 2026
  }
};
