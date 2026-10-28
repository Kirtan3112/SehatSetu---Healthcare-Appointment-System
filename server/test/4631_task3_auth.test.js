const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const { User, Doctor } = require('../src/models/4631_index');

let server;
let baseUrl;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await User.deleteMany({ email: /test-auth-runner/ });
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

test('Task 3 - Patient Registration & Login Flow', async () => {
  const patientEmail = `test-auth-runner-patient-${Date.now()}@example.com`;

  // 1. Register Patient
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Tester',
      email: patientEmail,
      password: 'StrongPassword123',
      role: 'PATIENT',
      phone: '+1 234 567 890'
    })
  });
  const regData = await regRes.json();
  assert.equal(regRes.status, 201);
  assert.equal(regData.success, true);
  assert.ok(regData.data.token);
  assert.equal(regData.data.user.role, 'PATIENT');
  assert.equal(regData.data.user.email, patientEmail);

  // 2. Login Patient
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: patientEmail,
      password: 'StrongPassword123'
    })
  });
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.equal(loginData.success, true);
  const token = loginData.data.token;
  assert.ok(token);

  // 3. Access Protected Route /api/auth/me with Token
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  assert.equal(meRes.status, 200);
  assert.equal(meData.data.user.email, patientEmail);

  // 4. Update Profile
  const updateRes = await fetch(`${baseUrl}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Alice Updated',
      phone: '+1 987 654 321'
    })
  });
  const updateData = await updateRes.json();
  assert.equal(updateRes.status, 200);
  assert.equal(updateData.data.user.name, 'Alice Updated');
});

test('Task 3 - Prohibit direct ADMIN registration', async () => {
  const adminEmail = `test-auth-runner-fakeadmin-${Date.now()}@example.com`;
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Fake Admin',
      email: adminEmail,
      password: 'AdminPassword123',
      role: 'ADMIN'
    })
  });
  const data = await res.json();
  assert.equal(res.status, 403);
  assert.equal(data.success, false);
  assert.equal(data.error.code, 'FORBIDDEN_ROLE');
});

test('Task 3 - Doctor Registration creates pending Doctor profile', async () => {
  const doctorEmail = `test-auth-runner-doc-${Date.now()}@example.com`;
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Kevin Test',
      email: doctorEmail,
      password: 'DoctorPassword123',
      role: 'DOCTOR',
      qualification: 'MBBS, MS General Surgery',
      experience: 7,
      fee: 100,
      bio: 'Expert laparoscopic surgeon'
    })
  });
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.data.user.role, 'DOCTOR');
  assert.ok(data.data.user.doctorProfile);
  assert.equal(data.data.user.doctorProfile.approved, false, 'Doctor must require Admin approval');
});
