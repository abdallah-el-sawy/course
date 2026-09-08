const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, stopServer, url } = require('./helpers');

let appointmentId;

test.before(async () => {
  await startServer();
  const date = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    while (d.getUTCDay() === 5) d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const res = await fetch(url('/api/appointments'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: 1, patientName: 'Survey Setup', patientPhone: '+201000000009', date, time: '12:00' })
  });
  const body = await res.json();
  appointmentId = body.data.id;
});

test.after(async () => { await stopServer(); });

test('accepts a valid survey', async () => {
  const res = await fetch(url('/api/surveys'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appointmentId,
      patientName: 'Survey Tester',
      satisfaction: 5,
      communication: 5,
      waitingTime: 4,
      wouldRecommend: true,
      comments: 'Great overall.'
    })
  });
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.wouldRecommend, true);
});

test('rejects invalid rating scale value', async () => {
  const res = await fetch(url('/api/surveys'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appointmentId,
      patientName: 'Survey Tester',
      satisfaction: 9,
      communication: 5,
      waitingTime: 4,
      wouldRecommend: true
    })
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});
