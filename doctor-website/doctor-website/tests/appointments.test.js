const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, stopServer, url } = require('./helpers');

test.before(async () => { await startServer(); });
test.after(async () => { await stopServer(); });

// Pick a future Sunday-ish working day far enough out to avoid clashing
// with other tests' bookings. Working days exclude Friday.
function futureWorkingDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  // Nudge forward until it's not a Friday (day 5, UTC-based check matches server logic)
  while (d.getUTCDay() === 5) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
}

test('creates a valid appointment', async () => {
  const date = futureWorkingDate(10);
  const res = await fetch(url('/api/appointments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorId: 1,
      patientName: 'Test Patient',
      patientPhone: '+201000000001',
      date,
      time: '09:00'
    })
  });
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'pending');
});

test('rejects missing patient name', async () => {
  const date = futureWorkingDate(11);
  const res = await fetch(url('/api/appointments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: 1, patientPhone: '+201000000001', date, time: '09:00' })
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test('rejects invalid date format', async () => {
  const res = await fetch(url('/api/appointments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorId: 1, patientName: 'Test', patientPhone: '+201000000001',
      date: 'not-a-date', time: '09:00'
    })
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test('rejects invalid time (outside working hours)', async () => {
  const date = futureWorkingDate(12);
  const res = await fetch(url('/api/appointments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorId: 1, patientName: 'Test', patientPhone: '+201000000001',
      date, time: '23:45'
    })
  });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test('rejects double booking with 409', async () => {
  const date = futureWorkingDate(13);
  const payload = {
    doctorId: 1, patientName: 'First Patient', patientPhone: '+201000000002',
    date, time: '10:00'
  };

  const first = await fetch(url('/api/appointments'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  assert.equal(first.status, 201);

  const second = await fetch(url('/api/appointments'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, patientName: 'Second Patient' })
  });
  const secondBody = await second.json();
  assert.equal(second.status, 409);
  assert.equal(secondBody.success, false);
});

test('rejects appointment for nonexistent doctor', async () => {
  const date = futureWorkingDate(14);
  const res = await fetch(url('/api/appointments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorId: 9999, patientName: 'Test', patientPhone: '+201000000001',
      date, time: '09:00'
    })
  });
  const body = await res.json();
  assert.equal(res.status, 404);
  assert.equal(body.success, false);
});

test('availability excludes already-booked slots', async () => {
  const date = futureWorkingDate(15);
  await fetch(url('/api/appointments'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: 1, patientName: 'Slot Taker', patientPhone: '+201000000003', date, time: '11:00' })
  });

  const res = await fetch(url(`/api/appointments/availability?doctorId=1&date=${date}`));
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(!body.data.availableSlots.includes('11:00'));
});
