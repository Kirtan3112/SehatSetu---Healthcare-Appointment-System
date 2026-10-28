const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const { Doctor, Slot, Appointment } = require('../src/models/4631_index');

let server;
let baseUrl;
let patientToken;
let doctorToken;
let doctorProfile;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  doctorProfile = await Doctor.findOne({ approved: true });

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, async () => {
      baseUrl = `http://localhost:${server.address().port}`;

      // Login as Patient
      const patLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'patient@healthcare.com', password: 'Password@123' })
      });
      const patData = await patLogin.json();
      patientToken = patData.data.token;

      // Login as Doctor
      const docLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'doctor@healthcare.com', password: 'Password@123' })
      });
      const docData = await docLogin.json();
      doctorToken = docData.data.token;

      resolve();
    });
  });
});

const createdSlotIds = [];

test.after(async () => {
  await Slot.deleteMany({ _id: { $in: createdSlotIds } });
  await Appointment.deleteMany({ slotId: { $in: createdSlotIds } });
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

test('Task 7 - Complete Appointment Lifecycle: Book, Reschedule (Atomic Slot Swap), Doctor View & Status Update', async () => {
  const futureDate = new Date();
  futureDate.setUTCDate(futureDate.getUTCDate() + 1000 + Math.floor(Math.random() * 500));
  futureDate.setUTCHours(0, 0, 0, 0);

  // 1. Create two slots (Slot A and Slot B)
  const slotA = await Slot.create({
    doctorId: doctorProfile._id,
    date: futureDate,
    startTime: '10:00',
    endTime: '10:30',
    isBooked: false
  });
  createdSlotIds.push(slotA._id);

  const slotB = await Slot.create({
    doctorId: doctorProfile._id,
    date: futureDate,
    startTime: '11:00',
    endTime: '11:30',
    isBooked: false
  });
  createdSlotIds.push(slotB._id);

  // 2. Patient books Slot A
  const bookRes = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`
    },
    body: JSON.stringify({ slotId: slotA._id.toString(), reason: 'Cardio Checkup' })
  });
  const bookData = await bookRes.json();
  assert.equal(bookRes.status, 201);
  const appointmentId = bookData.data._id;

  // 3. Patient views their appointments
  const myApptsRes = await fetch(`${baseUrl}/api/appointments/my`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const myAppts = await myApptsRes.json();
  assert.equal(myApptsRes.status, 200);
  assert.ok(myAppts.data.some(a => a._id === appointmentId));

  // 4. Reschedule from Slot A to Slot B
  const reschedRes = await fetch(`${baseUrl}/api/appointments/${appointmentId}/reschedule`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`
    },
    body: JSON.stringify({ newSlotId: slotB._id.toString() })
  });
  const reschedData = await reschedRes.json();
  assert.equal(reschedRes.status, 200);

  // Assert Atomic Swap:
  // Slot A must now be FREE (isBooked = false)
  const checkSlotA = await Slot.findById(slotA._id);
  assert.equal(checkSlotA.isBooked, false, 'Old slot must be released upon reschedule');

  // Slot B must now be BOOKED (isBooked = true)
  const checkSlotB = await Slot.findById(slotB._id);
  assert.equal(checkSlotB.isBooked, true, 'New slot must be claimed upon reschedule');

  // 5. Doctor views schedule
  const docScheduleRes = await fetch(`${baseUrl}/api/appointments/doctor-schedule`, {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  const docSchedule = await docScheduleRes.json();
  assert.equal(docScheduleRes.status, 200);
  assert.ok(docSchedule.data.some(a => a._id === appointmentId));

  // 6. Doctor updates status to COMPLETED
  const statusRes = await fetch(`${baseUrl}/api/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${doctorToken}`
    },
    body: JSON.stringify({ status: 'COMPLETED', notes: 'Patient vitals stable.' })
  });
  const statusData = await statusRes.json();
  assert.equal(statusRes.status, 200);
  assert.equal(statusData.data.status, 'COMPLETED');
});

test('Task 7 - Cancellation releases slot back to pool for re-booking', async () => {
  const cancelDate = new Date();
  cancelDate.setUTCDate(cancelDate.getUTCDate() + 1500 + Math.floor(Math.random() * 500));
  cancelDate.setUTCHours(0, 0, 0, 0);

  const slotC = await Slot.create({
    doctorId: doctorProfile._id,
    date: cancelDate,
    startTime: '14:00',
    endTime: '14:30',
    isBooked: false
  });
  createdSlotIds.push(slotC._id);

  // Book it
  const bookRes = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`
    },
    body: JSON.stringify({ slotId: slotC._id.toString(), reason: 'Initial booking' })
  });
  const bookData = await bookRes.json();
  const appointmentId = bookData.data._id;

  // Cancel it
  const cancelRes = await fetch(`${baseUrl}/api/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  assert.equal(cancelRes.status, 200);

  // Verify slot is released
  const checkSlotC = await Slot.findById(slotC._id);
  assert.equal(checkSlotC.isBooked, false, 'Slot must be released after cancellation');

  // Verify another booking can now claim slotC successfully
  const rebookRes = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`
    },
    body: JSON.stringify({ slotId: slotC._id.toString(), reason: 'Re-booking released slot' })
  });
  assert.equal(rebookRes.status, 201, 'Released slot must be re-bookable');
});
