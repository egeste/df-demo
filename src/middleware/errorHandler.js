'use strict';

// Four-argument signature is Express's convention for error-handling middleware.
// Must be registered last so it can catch errors forwarded by next(err) from
// any route or middleware registered before it.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
