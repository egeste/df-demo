'use strict';

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../index');
const store = require('../routes/items/store');
const { ERRORS } = require('../routes/items/constants');

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

// Wipe the store before each test so state never leaks between cases
beforeEach(() => store.reset());

// --- HTTP helpers -----------------------------------------------------------

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body !== undefined ? JSON.stringify(body) : undefined;
    const options = {
      hostname: '127.0.0.1',
      port: new URL(baseUrl).port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        const responseBody = contentType.includes('application/json') && raw
          ? JSON.parse(raw)
          : raw;
        resolve({ statusCode: res.statusCode, body: responseBody });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const get = (path) => request('GET', path);
const post = (path, body) => request('POST', path, body);
const put = (path, body) => request('PUT', path, body);
const del = (path) => request('DELETE', path);

// --- GET /items -------------------------------------------------------------

test('GET /items returns HTTP 200 and an empty array when no items exist', async () => {
  const { statusCode, body } = await get('/items');
  assert.equal(statusCode, 200);
  assert.deepEqual(body, []);
});

test('GET /items returns all created items', async () => {
  store.create({ name: 'Alpha' });
  store.create({ name: 'Beta', description: 'desc' });

  const { statusCode, body } = await get('/items');
  assert.equal(statusCode, 200);
  assert.equal(body.length, 2);
});

// --- GET /items/:id ---------------------------------------------------------

test('GET /items/:id returns HTTP 200 and the item', async () => {
  const created = store.create({ name: 'Gamma' });

  const { statusCode, body } = await get(`/items/${created.id}`);
  assert.equal(statusCode, 200);
  assert.equal(body.id, created.id);
  assert.equal(body.name, 'Gamma');
});

test('GET /items/:id returns HTTP 404 for an unknown id', async () => {
  const { statusCode, body } = await get('/items/does-not-exist');
  assert.equal(statusCode, 404);
  assert.equal(body.error, ERRORS.NOT_FOUND);
});

// --- POST /items ------------------------------------------------------------

test('POST /items returns HTTP 201 and the new item', async () => {
  const { statusCode, body } = await post('/items', { name: 'Delta', description: 'a thing' });
  assert.equal(statusCode, 201);
  assert.equal(body.name, 'Delta');
  assert.equal(body.description, 'a thing');
  assert.ok(body.id, 'id should be present');
  assert.ok(body.createdAt, 'createdAt should be present');
});

test('POST /items auto-generates a UUID id', async () => {
  const { body } = await post('/items', { name: 'Epsilon' });
  // UUID v4 format
  assert.match(body.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('POST /items returns HTTP 400 when name is missing', async () => {
  const { statusCode, body } = await post('/items', { description: 'no name' });
  assert.equal(statusCode, 400);
  assert.equal(body.error, ERRORS.NAME_REQUIRED);
});

test('POST /items description defaults to empty string when omitted', async () => {
  const { body } = await post('/items', { name: 'Zeta' });
  assert.equal(body.description, '');
});

// --- PUT /items/:id ---------------------------------------------------------

test('PUT /items/:id returns HTTP 200 and the updated item', async () => {
  const created = store.create({ name: 'Eta' });

  const { statusCode, body } = await put(`/items/${created.id}`, { name: 'Eta Updated', description: 'new desc' });
  assert.equal(statusCode, 200);
  assert.equal(body.name, 'Eta Updated');
  assert.equal(body.description, 'new desc');
});

test('PUT /items/:id returns HTTP 400 when name is missing', async () => {
  const created = store.create({ name: 'Theta' });

  const { statusCode, body } = await put(`/items/${created.id}`, { description: 'oops' });
  assert.equal(statusCode, 400);
  assert.equal(body.error, ERRORS.NAME_REQUIRED);
});

test('PUT /items/:id returns HTTP 404 for an unknown id', async () => {
  const { statusCode, body } = await put('/items/ghost', { name: 'x' });
  assert.equal(statusCode, 404);
  assert.equal(body.error, ERRORS.NOT_FOUND);
});

// --- DELETE /items/:id ------------------------------------------------------

test('DELETE /items/:id returns HTTP 204 and removes the item', async () => {
  const created = store.create({ name: 'Iota' });

  const { statusCode } = await del(`/items/${created.id}`);
  assert.equal(statusCode, 204);

  // Confirm removal via GET
  const { statusCode: getStatus } = await get(`/items/${created.id}`);
  assert.equal(getStatus, 404);
});

test('DELETE /items/:id returns HTTP 404 for an unknown id', async () => {
  const { statusCode, body } = await del('/items/ghost');
  assert.equal(statusCode, 404);
  assert.equal(body.error, ERRORS.NOT_FOUND);
});
