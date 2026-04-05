'use strict';

const request = require('supertest');
const app = require('../index');
const store = require('../routes/items/store');
const { ERRORS } = require('../routes/items/constants');

// UUID v4 pattern — used to verify auto-generated item ids
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Reset in-memory store before each test so no state leaks between cases.
beforeEach(() => store.reset());

// ---------------------------------------------------------------------------
// GET /items
// ---------------------------------------------------------------------------

describe('GET /items', () => {
  it('returns 200 and an empty array when the store is empty', async () => {
    const res = await request(app).get('/items');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 200 and all stored items when the store is populated', async () => {
    store.create({ name: 'Alpha' });
    store.create({ name: 'Beta', description: 'a description' });

    const res = await request(app).get('/items');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Alpha');
    expect(res.body[1].name).toBe('Beta');
  });
});

// ---------------------------------------------------------------------------
// GET /items/:id
// ---------------------------------------------------------------------------

describe('GET /items/:id', () => {
  it('returns 200 and the full item shape for a known id', async () => {
    const created = store.create({ name: 'Gamma', description: 'gamma desc' });

    const res = await request(app).get(`/items/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.id);
    expect(res.body.name).toBe('Gamma');
    expect(res.body.description).toBe('gamma desc');
    expect(res.body.createdAt).toBeDefined();
  });

  it('returns 404 with an error body for an unknown id', async () => {
    const res = await request(app).get('/items/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: ERRORS.NOT_FOUND });
  });
});

// ---------------------------------------------------------------------------
// POST /items
// ---------------------------------------------------------------------------

describe('POST /items', () => {
  it('returns 201 and the created item on a valid request', async () => {
    const res = await request(app)
      .post('/items')
      .send({ name: 'Delta', description: 'a thing' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Delta');
    expect(res.body.description).toBe('a thing');
    expect(res.body.id).toMatch(UUID_V4);
    expect(res.body.createdAt).toBeDefined();
  });

  it('defaults description to empty string when omitted', async () => {
    const res = await request(app)
      .post('/items')
      .send({ name: 'Epsilon' });

    expect(res.status).toBe(201);
    expect(res.body.description).toBe('');
  });

  it('returns 400 with an error body when name is missing', async () => {
    const res = await request(app)
      .post('/items')
      .send({ description: 'no name here' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: ERRORS.NAME_REQUIRED });
  });

  it('returns 400 with an error body when the body is entirely empty', async () => {
    const res = await request(app)
      .post('/items')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: ERRORS.NAME_REQUIRED });
  });
});

// ---------------------------------------------------------------------------
// PUT /items/:id
// ---------------------------------------------------------------------------

describe('PUT /items/:id', () => {
  it('returns 200 and the updated item when id and name are valid', async () => {
    const created = store.create({ name: 'Zeta', description: 'old desc' });

    const res = await request(app)
      .put(`/items/${created.id}`)
      .send({ name: 'Zeta Updated', description: 'new desc' });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.id);
    expect(res.body.name).toBe('Zeta Updated');
    expect(res.body.description).toBe('new desc');
  });

  it('returns 400 with an error body when name is missing', async () => {
    const created = store.create({ name: 'Eta' });

    const res = await request(app)
      .put(`/items/${created.id}`)
      .send({ description: 'forgot name' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: ERRORS.NAME_REQUIRED });
  });

  it('returns 404 with an error body for an unknown id', async () => {
    const res = await request(app)
      .put('/items/ghost-id')
      .send({ name: 'Does Not Matter' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: ERRORS.NOT_FOUND });
  });
});

// ---------------------------------------------------------------------------
// DELETE /items/:id
// ---------------------------------------------------------------------------

describe('DELETE /items/:id', () => {
  it('returns 204 with no body and removes the item so a subsequent GET returns 404', async () => {
    const created = store.create({ name: 'Theta' });

    const deleteRes = await request(app).delete(`/items/${created.id}`);
    expect(deleteRes.status).toBe(204);
    expect(deleteRes.body).toEqual({});

    // Confirm the item is gone
    const getRes = await request(app).get(`/items/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  it('returns 404 with an error body for an unknown id', async () => {
    const res = await request(app).delete('/items/ghost-id');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: ERRORS.NOT_FOUND });
  });
});
