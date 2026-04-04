'use strict';

const express = require('express');

// Read version once at startup — avoids repeated I/O on every request
const { version } = require('../package.json');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const PORT = process.env.PORT || 3000;

const app = express();

// Parse JSON request bodies before any route handler sees them
app.use(express.json());

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

// Mount all domain routers (items, etc.) under their declared prefixes
app.use('/', routes);

// Shared error handler — must be registered after all routes so Express
// recognises it as a 4-arg error middleware and invokes it on next(err).
app.use(errorHandler);

// Only start the server when this file is run directly, not when imported
// by tests — keeps the app exportable and port-conflict-free during testing.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
