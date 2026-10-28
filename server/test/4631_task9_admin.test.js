const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const { User } = require('../src/models/4631_index');

let server;
let baseUrl;
let adminToken;
let patientToken;
let adminUser;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  adminUser = await User.findOne({ email: 'admin@healthcare.com' });

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
      const patLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'patient@healthcare.com', password: 'Password@123' })
      });
      const patData = await patLogin.json();
      patientToken = patData.data.token;

      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

test('Task 9 - RBAC security: Patient blocked from admin routes', async () => {
  const res = await fetch(`${baseUrl}/api/admin/metrics`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  assert.equal(res.status, 403);
});

test('Task 9 - Admin can view system metrics and analytics', async () => {
  const res = await fetch(`${baseUrl}/api/admin/metrics`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.users);
  assert.ok(data.data.catalog);
  assert.ok(data.data.appointments);
  assert.ok(data.data.appointments.byStatus);
  assert.ok(Array.isArray(data.data.recentLogs));
});

test('Task 9 - Admin can manage users and toggle active status', async () => {
  // Create a temporary user to toggle
  const tempUser = await User.create({
    name: 'Temporary User',
    email: `temp-admin-test-${Date.now()}@example.com`,
    passwordHash: 'dummy_hash',
    role: 'PATIENT',
    isActive: true
  });

  // Toggle to inactive
  const toggleRes1 = await fetch(`${baseUrl}/api/admin/users/${tempUser._id}/toggle-status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const toggleData1 = await toggleRes1.json();
  assert.equal(toggleRes1.status, 200);
  assert.equal(toggleData1.data.isActive, false);

  // Toggle back to active
  const toggleRes2 = await fetch(`${baseUrl}/api/admin/users/${tempUser._id}/toggle-status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const toggleData2 = await toggleRes2.json();
  assert.equal(toggleRes2.status, 200);
  assert.equal(toggleData2.data.isActive, true);

  // Attempt to toggle self -> Expect 400
  const selfToggle = await fetch(`${baseUrl}/api/admin/users/${adminUser._id}/toggle-status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(selfToggle.status, 400);

  await User.findByIdAndDelete(tempUser._id);
});

test('Task 9 - Admin can view audit logs', async () => {
  const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
  assert.ok(data.data[0].action);
  assert.ok(data.data[0].target);
});
