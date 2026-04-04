// Version is resolved once at module load — no per-request I/O needed.
const { version } = require('../../package.json');

const versionHandler = (_req, res) => res.json({ version });

module.exports = { versionHandler };
