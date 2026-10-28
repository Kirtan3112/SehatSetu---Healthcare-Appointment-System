const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/4631_app');
const http = require('http');

let server;
let baseUrl;

test.before(async () => {
  return new Promise((resolve) => {
    // Start temporary test server on random port
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

test('Task 1 - Health endpoint returns 200 with standard response envelope', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data);
  assert.equal(data.data.status, 'HEALTHY');
  assert.equal(data.data.service, 'Healthcare Appointment System API');
});

test('Task 1 - 404 handler returns standard error envelope', async () => {
  const res = await fetch(`${baseUrl}/api/unknown-non-existent-route`);
  const data = await res.json();

  assert.equal(res.status, 404);
  assert.equal(data.success, false);
  assert.ok(data.error);
  assert.equal(data.error.code, 'ROUTE_NOT_FOUND');
  assert.match(data.error.message, /Cannot GET \/api\/unknown-non-existent-route/);
});
