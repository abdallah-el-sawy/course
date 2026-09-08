const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, stopServer, url } = require('./helpers');

test.before(async () => { await startServer(); });
test.after(async () => { await stopServer(); });

test('creates a valid review and recalculates rating', async () => {
  const res = await fetch(url('/api/reviews'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: 1, patientName: 'Review Tester', rating: 5, comment: 'Great visit overall.' })
  });
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.review.rating, 5);
  assert.equal(typeof body.data.rating.average, 'number');
});

test('rejects rating below 1', async () => {
  const res = await fetch(url('/api/reviews'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: 1, patientName: 'Test', rating: 0, comment: 'Too low.' })
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test('rejects rating above 5', async () => {
  const res = await fetch(url('/api/reviews'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: 1, patientName: 'Test', rating: 6, comment: 'Too high.' })
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test('rejects empty comment', async () => {
  const res = await fetch(url('/api/reviews'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: 1, patientName: 'Test', rating: 5, comment: '' })
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test('correctly calculates average rating', async () => {
  const before = await (await fetch(url('/api/doctors/1'))).json();
  const beforeCount = before.data.reviewCount;

  await fetch(url('/api/reviews'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: 1, patientName: 'Calc Tester', rating: 1, comment: 'For average calc test.' })
  });

  const after = await (await fetch(url('/api/doctors/1'))).json();
  assert.equal(after.data.reviewCount, beforeCount + 1);
});
