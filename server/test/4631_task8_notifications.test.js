const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const { Notification, NotificationType, User } = require('../src/models/4631_index');

let server;
let baseUrl;
let patientToken;
let adminToken;
let patientUser;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  patientUser = await User.findOne({ email: 'patient@healthcare.com' });
  await Notification.deleteMany({ userId: patientUser._id });

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

      // Login as Admin
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
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

test('Task 8 - Patient Notification Inbox, Unread Counter, and Mark as Read', async () => {
  // 1. Create a dummy test notification for patient
  const notif = await Notification.create({
    userId: patientUser._id,
    type: NotificationType.APPOINTMENT_REMINDER,
    message: 'Test reminder message for inbox verification',
    readStatus: false
  });

  // 2. Query unread count
  const countRes = await fetch(`${baseUrl}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const countData = await countRes.json();
  assert.equal(countRes.status, 200);
  assert.ok(countData.data.unreadCount >= 1);

  // 3. Query notifications list
  const listRes = await fetch(`${baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const listData = await listRes.json();
  assert.equal(listRes.status, 200);
  assert.ok(listData.data.some(n => n._id === notif._id.toString()));

  // 4. Mark specific notification as read
  const markRes = await fetch(`${baseUrl}/api/notifications/${notif._id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const markData = await markRes.json();
  assert.equal(markRes.status, 200);
  assert.equal(markData.data.readStatus, true);

  // 5. Mark all as read
  const markAllRes = await fetch(`${baseUrl}/api/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  assert.equal(markAllRes.status, 200);

  // Verify count is now 0
  const finalCountRes = await fetch(`${baseUrl}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const finalCountData = await finalCountRes.json();
  assert.equal(finalCountData.data.unreadCount, 0);
});

test('Task 8 - Admin triggers automated reminder check worker', async () => {
  const triggerRes = await fetch(`${baseUrl}/api/notifications/trigger-reminders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const triggerData = await triggerRes.json();
  assert.equal(triggerRes.status, 200);
  assert.equal(triggerData.success, true);
  assert.ok(triggerData.data.remindersSent !== undefined);
});
