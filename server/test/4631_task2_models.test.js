const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const {
  User,
  UserRole,
  Department,
  Specialization,
  Doctor,
  Availability,
  Slot,
  Appointment,
  AppointmentStatus,
  Notification,
  NotificationType,
  AuditLog
} = require('../src/models/4631_index');
const env = require('../src/config/4631_env');

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }
  // Ensure indexes are built
  await Promise.all([
    User.syncIndexes(),
    Department.syncIndexes(),
    Specialization.syncIndexes(),
    Doctor.syncIndexes(),
    Availability.syncIndexes(),
    Slot.syncIndexes(),
    Appointment.syncIndexes()
  ]);
});

test.after(async () => {
  // Clean up test documents
  await User.deleteMany({ email: /test-task2/ });
  await Department.deleteMany({ name: /Test Dept Task2/ });
  await Specialization.deleteMany({ name: /Test Spec Task2/ });
  await mongoose.connection.close();
});

test('Task 2 - User model enforces unique email and hides passwordHash in JSON', async () => {
  const email = `test-task2-${Date.now()}@example.com`;
  const user = await User.create({
    name: 'Test Patient',
    email,
    passwordHash: 'hashed_password_123',
    role: UserRole.PATIENT
  });

  assert.ok(user._id);
  const jsonUser = user.toJSON();
  assert.equal(jsonUser.passwordHash, undefined, 'passwordHash must be omitted from JSON');

  // Attempt duplicate user creation
  let duplicateFailed = false;
  try {
    await User.create({
      name: 'Duplicate Patient',
      email,
      passwordHash: 'another_pass',
      role: UserRole.PATIENT
    });
  } catch (err) {
    duplicateFailed = true;
    assert.equal(err.code, 11000, 'Duplicate email must trigger MongoDB 11000 error');
  }
  assert.ok(duplicateFailed, 'Duplicate email should have been rejected');
});

test('Task 2 - Slot model enforces compound unique index (doctorId, date, startTime)', async () => {
  const dummyDoctorId = new mongoose.Types.ObjectId();
  const date = new Date('2026-10-20T00:00:00.000Z');

  const slot1 = await Slot.create({
    doctorId: dummyDoctorId,
    date,
    startTime: '10:00',
    endTime: '10:30',
    isBooked: false
  });
  assert.ok(slot1._id);

  let duplicateSlotFailed = false;
  try {
    await Slot.create({
      doctorId: dummyDoctorId,
      date,
      startTime: '10:00',
      endTime: '10:30',
      isBooked: false
    });
  } catch (err) {
    duplicateSlotFailed = true;
    assert.equal(err.code, 11000);
  }
  assert.ok(duplicateSlotFailed, 'Slot duplicate constraint failed');

  await Slot.findByIdAndDelete(slot1._id);
});

test('Task 2 - Appointment model enforces partial unique index on slotId for active bookings', async () => {
  const dummyPatient1 = new mongoose.Types.ObjectId();
  const dummyPatient2 = new mongoose.Types.ObjectId();
  const dummyDoctor = new mongoose.Types.ObjectId();
  const dummySlot = new mongoose.Types.ObjectId();

  const appt1 = await Appointment.create({
    patientId: dummyPatient1,
    doctorId: dummyDoctor,
    slotId: dummySlot,
    status: AppointmentStatus.CONFIRMED,
    reason: 'First booking'
  });
  assert.ok(appt1._id);

  let conflictCaught = false;
  try {
    await Appointment.create({
      patientId: dummyPatient2,
      doctorId: dummyDoctor,
      slotId: dummySlot,
      status: AppointmentStatus.CONFIRMED,
      reason: 'Concurrent booking attempt'
    });
  } catch (err) {
    conflictCaught = true;
    assert.equal(err.code, 11000);
  }
  assert.ok(conflictCaught, 'Active appointment on same slot must trigger unique index conflict');

  await Appointment.findByIdAndDelete(appt1._id);
});
