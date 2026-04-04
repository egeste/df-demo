'use strict';

const express = require('express');

// Read version once at startup — avoids repeated I/O on every request
const { version } = require('../package.json');

const PORT = process.env.PORT || 3000;

const app = express();

// Config-map pattern: each entry declares a route without duplicating
// registration boilerplate, and adding new endpoints requires only a
// new map entry rather than scattered app.get() calls.
const ROUTES = {
  '/health': (_req, res) => res.json({ status: 'ok' }),
  '/version': (_req, res) => res.json({ version }),
};

Object.entries(ROUTES).forEach(([path, handler]) => {
  app.get(path, handler);
});

// Only start the server when this file is run directly, not when imported
// by tests — keeps the app exportable and port-conflict-free during testing.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
