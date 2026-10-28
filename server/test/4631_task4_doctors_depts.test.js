const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const { Doctor, User } = require('../src/models/4631_index');

let server;
let baseUrl;
let adminToken;
let patientToken;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, async () => {
      baseUrl = `http://localhost:${server.address().port}`;

      // Login as Admin
      const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@healthcare.com', password: 'Admin@123' })
      });
      const adminData = await adminLogin.json();
      adminToken = adminData.data.token;

      // Login as Patient
      const patientLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'patient@healthcare.com', password: 'Password@123' })
      });
      const patientData = await patientLogin.json();
      patientToken = patientData.data.token;

      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

test('Task 4 - Public can list departments and specializations', async () => {
  const deptRes = await fetch(`${baseUrl}/api/departments`);
  const deptData = await deptRes.json();
  assert.equal(deptRes.status, 200);
  assert.ok(Array.isArray(deptData.data));
  assert.ok(deptData.data.length > 0);

  const specRes = await fetch(`${baseUrl}/api/specializations`);
  const specData = await specRes.json();
  assert.equal(specRes.status, 200);
  assert.ok(Array.isArray(specData.data));
  assert.ok(specData.data.length > 0);
});

test('Task 4 - Role-based authorization on Department creation (Patient rejected, Admin allowed)', async () => {
  // Attempt with Patient token
  const patientAttempt = await fetch(`${baseUrl}/api/departments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`
    },
    body: JSON.stringify({ name: 'Unauthorized Dept', description: 'Test' })
  });
  assert.equal(patientAttempt.status, 403);

  // Attempt with Admin token
  const deptName = `Oncology Dept ${Date.now()}`;
  const adminAttempt = await fetch(`${baseUrl}/api/departments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ name: deptName, description: 'Cancer care and oncology' })
  });
  const adminData = await adminAttempt.json();
  assert.equal(adminAttempt.status, 201);
  assert.equal(adminData.data.name, deptName);
});

test('Task 4 - Doctor Search filters by approved status and Admin can approve pending doctor', async () => {
  // Create a dedicated pending doctor for this test
  const tempUser = await User.create({
    name: 'Dr. Pending Verification',
    email: `test-pending-doc-${Date.now()}@example.com`,
    passwordHash: 'dummy_hash',
    role: 'DOCTOR'
  });
  const pendingDoc = await Doctor.create({
    userId: tempUser._id,
    qualification: 'MD Cardiology',
    experience: 6,
    fee: 100,
    approved: false
  });

  // Verify public search does not include this pending doctor
  const searchPublic = await fetch(`${baseUrl}/api/doctors?search=${encodeURIComponent('Pending Verification')}`);
  const searchPublicData = await searchPublic.json();
  assert.equal(searchPublicData.data.length, 0, 'Unapproved doctor should not appear in public search');

  // Admin approves the doctor
  const approveRes = await fetch(`${baseUrl}/api/doctors/${pendingDoc._id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const approveData = await approveRes.json();
  assert.equal(approveRes.status, 200);
  assert.equal(approveData.data.approved, true);

  // Verify the doctor is now visible in search
  const searchAfter = await fetch(`${baseUrl}/api/doctors?search=${encodeURIComponent('Pending Verification')}`);
  const searchAfterData = await searchAfter.json();
  assert.equal(searchAfterData.data.length, 1, 'Approved doctor must now appear in search');
  assert.equal(searchAfterData.data[0]._id, pendingDoc._id.toString());

  await Doctor.findByIdAndDelete(pendingDoc._id);
  await User.findByIdAndDelete(tempUser._id);
});
