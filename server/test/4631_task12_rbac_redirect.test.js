const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const { User, Doctor, Department } = require('../src/models/4631_index');

let server;
let baseUrl;
let adminToken;
let deptId;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  const dept = await Department.findOne();
  deptId = dept ? dept._id : null;

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, async () => {
      baseUrl = `http://localhost:${server.address().port}`;

      // Admin login
      const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@healthcare.com', password: 'Admin@123' })
      });
      const adminData = await adminLogin.json();
      adminToken = adminData.data.token;

      resolve();
    });
  });
});

test.after(async () => {
  await User.deleteMany({ email: /test-rbac-suite/ });
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

test('RBAC Test 1 - Patient Registration, Token Issuance, and Strict Privilege Enforcement', async () => {
  const patientEmail = `test-rbac-suite-pat-${Date.now()}@example.com`;

  // 1. Register Patient
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Emma Watson',
      email: patientEmail,
      password: 'PatientPassword123',
      role: 'PATIENT',
      phone: '+1 555-0988'
    })
  });
  const regData = await regRes.json();
  assert.equal(regRes.status, 201);
  assert.equal(regData.data.user.role, 'PATIENT');
  const patientToken = regData.data.token;
  assert.ok(patientToken);

  // 2. Patient can access their appointment history
  const myApptsRes = await fetch(`${baseUrl}/api/appointments/my`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  assert.equal(myApptsRes.status, 200, 'Patient must be allowed to access /api/appointments/my');

  // 3. Patient is BLOCKED from Doctor schedule
  const docScheduleRes = await fetch(`${baseUrl}/api/appointments/doctor-schedule`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  assert.equal(docScheduleRes.status, 403, 'Patient must be forbidden from Doctor schedule');

  // 4. Patient is BLOCKED from Admin metrics
  const adminMetricsRes = await fetch(`${baseUrl}/api/admin/metrics`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  assert.equal(adminMetricsRes.status, 403, 'Patient must be forbidden from Admin metrics');
});

test('RBAC Test 2 - Doctor Registration with Clinical Fields, Pending State, and Doctor Privileges', async () => {
  const docEmail = `test-rbac-suite-doc-${Date.now()}@example.com`;

  // 1. Register Doctor
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Gregory House',
      email: docEmail,
      password: 'DoctorPassword123',
      role: 'DOCTOR',
      phone: '+1 555-0777',
      departmentId: deptId,
      qualification: 'MD Diagnostics, Johns Hopkins',
      experience: 15,
      fee: 250,
      bio: 'Department head of diagnostic medicine'
    })
  });
  const regData = await regRes.json();
  assert.equal(regRes.status, 201);
  assert.equal(regData.data.user.role, 'DOCTOR');
  assert.ok(regData.data.user.doctorProfile);
  assert.equal(regData.data.user.doctorProfile.approved, false, 'New doctor accounts must start unapproved');
  const docToken = regData.data.token;
  const doctorProfileId = regData.data.user.doctorProfile._id;

  // 2. Doctor can access their schedule
  const docScheduleRes = await fetch(`${baseUrl}/api/appointments/doctor-schedule`, {
    headers: { Authorization: `Bearer ${docToken}` }
  });
  assert.equal(docScheduleRes.status, 200, 'Doctor must be allowed to access /api/appointments/doctor-schedule');

  // 3. Doctor is BLOCKED from booking as a patient
  const bookAttempt = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docToken}`
    },
    body: JSON.stringify({ slotId: new mongoose.Types.ObjectId() })
  });
  assert.equal(bookAttempt.status, 403, 'Doctor must be forbidden from patient booking endpoint');

  // 4. Doctor is BLOCKED from Admin management
  const adminAttempt = await fetch(`${baseUrl}/api/admin/users`, {
    headers: { Authorization: `Bearer ${docToken}` }
  });
  assert.equal(adminAttempt.status, 403, 'Doctor must be forbidden from Admin users list');

  // 5. Admin approves the Doctor
  const approveRes = await fetch(`${baseUrl}/api/doctors/${doctorProfileId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const approveData = await approveRes.json();
  assert.equal(approveRes.status, 200);
  assert.equal(approveData.data.approved, true, 'Admin approval must activate doctor');
});

test('RBAC Test 3 - Account Deactivation blocks both Login and Token Authorization', async () => {
  const blockEmail = `test-rbac-suite-blocked-${Date.now()}@example.com`;

  // Register user
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Blocked User',
      email: blockEmail,
      password: 'UserPassword123',
      role: 'PATIENT'
    })
  });
  const regData = await regRes.json();
  const userId = regData.data.user._id;
  const userToken = regData.data.token;

  // Admin deactivates this account
  const deactRes = await fetch(`${baseUrl}/api/admin/users/${userId}/toggle-status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(deactRes.status, 200);

  // Attempt login with deactivated credentials -> 403 ACCOUNT_DEACTIVATED
  const loginAttempt = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: blockEmail, password: 'UserPassword123' })
  });
  const loginData = await loginAttempt.json();
  assert.equal(loginAttempt.status, 403);
  assert.equal(loginData.error.code, 'ACCOUNT_DEACTIVATED');

  // Existing token on protected endpoint -> 403 ACCOUNT_DEACTIVATED
  const protectedAttempt = await fetch(`${baseUrl}/api/appointments/my`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const protectedData = await protectedAttempt.json();
  assert.equal(protectedAttempt.status, 403);
  assert.equal(protectedData.error.code, 'ACCOUNT_DEACTIVATED');
});
