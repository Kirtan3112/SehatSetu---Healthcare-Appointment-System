const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const { Doctor, Slot } = require('../src/models/4631_index');

let server;
let baseUrl;
let doctorToken;
let doctorProfileId;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, async () => {
      baseUrl = `http://localhost:${server.address().port}`;

      // Login as Doctor
      const docLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'doctor@healthcare.com', password: 'Password@123' })
      });
      const docData = await docLogin.json();
      doctorToken = docData.data.token;
      doctorProfileId = docData.data.user.doctorProfile._id;

      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

test('Task 5 - Query available slots publicly', async () => {
  const res = await fetch(`${baseUrl}/api/slots?doctorId=${doctorProfileId}`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
  // Verify unbooked
  data.data.forEach(slot => {
    assert.equal(slot.isBooked, false);
  });
});

test('Task 5 - Doctor configures weekly availability and generates slots idempotently', async () => {
  // 1. Configure schedule (e.g. Wednesday dayOfWeek=3, 13:00 to 15:00, 30 min slots)
  const availRes = await fetch(`${baseUrl}/api/availability/${doctorProfileId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${doctorToken}`
    },
    body: JSON.stringify({
      schedule: [
        { dayOfWeek: 3, startTime: '13:00', endTime: '15:00', slotDuration: 30 }
      ]
    })
  });
  const availData = await availRes.json();
  assert.equal(availRes.status, 200);

  // 2. Trigger slot generation for next 7 days
  const startDate = new Date();
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const genRes1 = await fetch(`${baseUrl}/api/availability/${doctorProfileId}/generate-slots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${doctorToken}`
    },
    body: JSON.stringify({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
  });
  const genData1 = await genRes1.json();
  assert.equal(genRes1.status, 200);
  assert.ok(genData1.data.total >= 0);

  // 3. Trigger slot generation AGAIN over same range to verify idempotency (0 duplicate errors, preserves records)
  const genRes2 = await fetch(`${baseUrl}/api/availability/${doctorProfileId}/generate-slots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${doctorToken}`
    },
    body: JSON.stringify({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
  });
  const genData2 = await genRes2.json();
  assert.equal(genRes2.status, 200);
  assert.equal(genData2.data.created, 0, 'Re-running generation over same range should create 0 new slots');
});
