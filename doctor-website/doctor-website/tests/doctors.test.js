const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, stopServer, url } = require('./helpers');

test.before(async () => { await startServer(); });
test.after(async () => { await stopServer(); });

test('GET /api/doctors returns a list including the seeded doctor', async () => {
  const res = await fetch(url('/api/doctors'));
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.some((d) => d.id === 1));
});

test('GET /api/doctors/:id returns the doctor with derived rating', async () => {
  const res = await fetch(url('/api/doctors/1'));
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.data.id, 1);
  assert.equal(typeof body.data.rating, 'number');
  assert.equal(typeof body.data.reviewCount, 'number');
});

test('GET /api/doctors/:id with invalid id returns 404', async () => {
  const res = await fetch(url('/api/doctors/9999'));
  const body = await res.json();
  assert.equal(res.status, 404);
  assert.equal(body.success, false);
});
