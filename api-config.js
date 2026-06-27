window.API_CONFIG = {
  provider: "proxy", // proxy = Netlify function; off = no live API; api-football-direct = browser direct
  refreshSeconds: 60,
  apiFootball: {
    enabled: false,
    baseUrl: "https://v3.football.api-sports.io",
    apiKey: "PASTE_API_SPORTS_KEY_HERE",
    league: 1,
    season: 2026
  }
};
