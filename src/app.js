const express = require('express');
const { routes } = require('./routes');

// Factory pattern keeps the app importable by tests without binding a port.
const createApp = () => {
  const app = express();

  app.use(express.json());

  // Register every route from the config-map — Open/Closed: extend routes, never modify this file.
  routes.forEach(({ method, path, handler }) => app[method](path, handler));

  return app;
};

module.exports = { createApp };
