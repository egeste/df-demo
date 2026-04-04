const { STATUS } = require('../constants');

// Liveness check — lets orchestrators know the process is alive.
const healthHandler = (_req, res) => res.json({ status: STATUS.OK });

module.exports = { healthHandler };
