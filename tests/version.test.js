const request = require('supertest');
const { createApp } = require('../src/app');
const { version } = require('../package.json');

describe('GET /version', () => {
  const app = createApp();

  it('returns 200 with the version from package.json', async () => {
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ version });
  });

  it('returns JSON content-type', async () => {
    const res = await request(app).get('/version');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
