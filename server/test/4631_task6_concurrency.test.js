const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const { User, Doctor, Slot, Appointment } = require('../src/models/4631_index');
const { generateToken } = require('../src/utils/4631_token');

let server;
let baseUrl;
let doctorProfile;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  doctorProfile = await Doctor.findOne({ approved: true });
  assert.ok(doctorProfile, 'Need at least one approved doctor for booking test');

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

const createdSlotIds = [];

test.after(async () => {
  await User.deleteMany({ email: /test-concurrency-runner/ });
  await Slot.deleteMany({ _id: { $in: createdSlotIds } });
  await Appointment.deleteMany({ slotId: { $in: createdSlotIds } });
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

test('Task 6 - Happy Path: Patient books slot and receives 201 Created', async () => {
  // 1. Create a future slot with random unique day offset
  const futureDate = new Date();
  futureDate.setUTCDate(futureDate.getUTCDate() + 100 + Math.floor(Math.random() * 500));
  futureDate.setUTCHours(0, 0, 0, 0);

  const slot = await Slot.create({
    doctorId: doctorProfile._id,
    date: futureDate,
    startTime: '11:00',
    endTime: '11:30',
    isBooked: false
  });
  createdSlotIds.push(slot._id);

  // 2. Create Patient
  const patient = await User.create({
    name: 'Concurrency Patient A',
    email: `test-concurrency-runner-a-${Date.now()}@example.com`,
    passwordHash: 'dummy_hash',
    role: 'PATIENT'
  });
  const token = generateToken({ userId: patient._id, role: patient.role, email: patient.email });

  // 3. Send Booking Request
  const res = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      slotId: slot._id.toString(),
      reason: 'General checkup'
    })
  });
  const data = await res.json();

  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'CONFIRMED');

  // Verify slot state in DB
  const updatedSlot = await Slot.findById(slot._id);
  assert.equal(updatedSlot.isBooked, true);

  // 4. Attempt to book same slot again -> Expect 409 Conflict
  const secondAttempt = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      slotId: slot._id.toString(),
      reason: 'Second booking attempt'
    })
  });
  const secondData = await secondAttempt.json();

  assert.equal(secondAttempt.status, 409);
  assert.equal(secondData.success, false);
  assert.equal(secondData.error.code, 'SLOT_ALREADY_BOOKED');
});

test('Task 6 - HIGH-CONCURRENCY RACE CONDITION TEST: 10 simultaneous requests for 1 slot', async () => {
  // 1. Create a fresh target slot
  const testDate = new Date();
  testDate.setUTCDate(testDate.getUTCDate() + 600 + Math.floor(Math.random() * 500));
  testDate.setUTCHours(0, 0, 0, 0);

  const targetSlot = await Slot.create({
    doctorId: doctorProfile._id,
    date: testDate,
    startTime: '15:00',
    endTime: '15:30',
    isBooked: false
  });
  createdSlotIds.push(targetSlot._id);

  // 2. Prepare 10 distinct patient tokens
  const patientTokens = [];
  for (let i = 0; i < 10; i++) {
    const patientUser = await User.create({
      name: `Racer Patient ${i}`,
      email: `test-concurrency-runner-racer-${Date.now()}-${i}@example.com`,
      passwordHash: 'dummy_hash',
      role: 'PATIENT'
    });
    patientTokens.push(generateToken({ userId: patientUser._id, role: patientUser.role, email: patientUser.email }));
  }

  // 3. Fire all 10 requests concurrently using Promise.all
  console.log('[Test] Firing 10 simultaneous concurrent requests for slot:', targetSlot._id.toString());
  const responses = await Promise.all(
    patientTokens.map(token => {
      return fetch(`${baseUrl}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          slotId: targetSlot._id.toString(),
          reason: 'Concurrent contention test'
        })
      });
    })
  );

  const statuses = responses.map(r => r.status);
  console.log('[Test] Concurrency response statuses:', statuses);

  const successes = statuses.filter(s => s === 201);
  const conflicts = statuses.filter(s => s === 409);

  // EXACTLY 1 winner and EXACTLY 9 losers
  assert.equal(successes.length, 1, 'Exactly one concurrent request must succeed with 201 Created');
  assert.equal(conflicts.length, 9, 'All other 9 requests must be rejected with 409 Conflict');

  // Verify DB state
  const finalSlot = await Slot.findById(targetSlot._id);
  assert.equal(finalSlot.isBooked, true);

  const apptCount = await Appointment.countDocuments({ slotId: targetSlot._id });
  assert.equal(apptCount, 1, 'Exactly one appointment must exist in MongoDB for this slot');
});
