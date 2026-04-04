'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../index');

// Spin up a real HTTP server on a random port so tests never conflict
// with a running instance or with each other.
let server;
let baseUrl;

before(() => new Promise((resolve) => {
  server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
    resolve();
  });
}));

after(() => new Promise((resolve) => {
  server.close(resolve);
}));

// Helper: perform a GET and resolve with { statusCode, body }.
// body is parsed as JSON when Content-Type is application/json;
// otherwise body is returned as a raw string so callers can still
// inspect the status code without crashing on non-JSON responses.
function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        const body = contentType.includes('application/json')
          ? JSON.parse(raw)
          : raw;
        resolve({ statusCode: res.statusCode, body });
      });
    }).on('error', reject);
  });
}

// --- /health -----------------------------------------------------------

test('GET /health returns HTTP 200', async () => {
  const { statusCode } = await get('/health');
  assert.equal(statusCode, 200);
});

test('GET /health body contains status "ok"', async () => {
  const { body } = await get('/health');
  assert.deepEqual(body, { status: 'ok' });
});

// --- /version ----------------------------------------------------------

test('GET /version returns HTTP 200', async () => {
  const { statusCode } = await get('/version');
  assert.equal(statusCode, 200);
});

test('GET /version body contains version matching package.json', async () => {
  const { version } = require('../../package.json');
  const { body } = await get('/version');
  assert.deepEqual(body, { version });
});

test('GET /version version is a non-empty string', async () => {
  const { body } = await get('/version');
  assert.equal(typeof body.version, 'string');
  assert.ok(body.version.length > 0);
});

// --- unknown routes ----------------------------------------------------

test('GET /unknown returns HTTP 404', async () => {
  const { statusCode } = await get('/unknown');
  assert.equal(statusCode, 404);
});
