const { ROUTES } = require('../constants');
const { healthHandler } = require('./health');
const { versionHandler } = require('./version');

// Config-map of all routes — adding a new route never requires touching app.js.
const routes = [
  { method: 'get', path: ROUTES.HEALTH, handler: healthHandler },
  { method: 'get', path: ROUTES.VERSION, handler: versionHandler },
];

module.exports = { routes };
