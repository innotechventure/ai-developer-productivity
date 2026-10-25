// ui/config.js
window.SNIPURL = {
  apiBase: '/api',      // same-origin dev; API endpoints at /api/...
  apiKey: 'dev-key',    // fallback dev key; override via build/env injection
  enableStats: true,    // feature flag for stats variant
};

// Fallback for when config is missing
if (!window.SNIPURL) {
  window.SNIPURL = {
    apiBase: '/api',
    apiKey: 'dev-key',
    enableStats: true,
  };
}