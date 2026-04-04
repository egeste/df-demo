'use strict';

// Centralised error messages — avoids magic strings scattered across
// handler and test code, and makes copy changes a single-line update.
const ERRORS = {
  NAME_REQUIRED: 'name is required',
  NOT_FOUND: 'Item not found',
};

module.exports = { ERRORS };
