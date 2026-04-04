// Central registry of all magic values — keeps them DRY and easy to update.

const PORT = process.env.PORT || 3000;

const ROUTES = {
  HEALTH: '/health',
  VERSION: '/version',
};

const STATUS = {
  OK: 'ok',
};

module.exports = { PORT, ROUTES, STATUS };
