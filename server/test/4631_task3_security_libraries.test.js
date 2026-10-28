/**
 * Task 3 Demonstration & Verification Test Suite
 * Demonstrates:
 * 1. Helmet.js: HTTP security headers configuration
 * 2. bcrypt: Secure password hashing and verification
 * 3. Joi: Schema-based user input validation and boundary enforcement
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const mongoose = require('mongoose');
const app = require('../src/4631_app');
const env = require('../src/config/4631_env');
const {
  registerSchema,
  loginSchema,
  bookingSchema,
  updateStatusSchema
} = require('../src/validators/4631_schemas');
const { User, UserRole } = require('../src/models/4631_User');

let server;
let baseUrl;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await User.deleteMany({ email: /task3-test/ });
  await mongoose.connection.close();
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

// ==========================================
// 1. HELMET.JS DEMONSTRATION TESTS
// ==========================================
test('Task 3 [Helmet.js] - Correctly sets OWASP security HTTP headers on responses', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  
  assert.equal(res.status, 200);

  // 1. Content-Type Options: Prevent MIME-sniffing
  const nosniff = res.headers.get('x-content-type-options');
  assert.equal(nosniff, 'nosniff', 'Helmet must set X-Content-Type-Options to nosniff');

  // 2. Clickjacking protection: X-Frame-Options
  const frameOptions = res.headers.get('x-frame-options');
  assert.equal(frameOptions, 'SAMEORIGIN', 'Helmet must set X-Frame-Options to SAMEORIGIN');

  // 3. DNS Prefetch Control
  const dnsPrefetch = res.headers.get('x-dns-prefetch-control');
  assert.equal(dnsPrefetch, 'off', 'Helmet must disable DNS prefetching');

  // 4. Download options: Prevent auto-execution in IE
  const downloadOptions = res.headers.get('x-download-options');
  assert.equal(downloadOptions, 'noopen', 'Helmet must set X-Download-Options to noopen');

  // 5. Hide X-Powered-By to prevent technology fingerprinting
  const poweredBy = res.headers.get('x-powered-by');
  assert.equal(poweredBy, null, 'Helmet must remove X-Powered-By header to prevent server profiling');

  console.log('[Task 3 Demo] Helmet.js Security Headers Verified Successfully:', {
    'x-content-type-options': nosniff,
    'x-frame-options': frameOptions,
    'x-dns-prefetch-control': dnsPrefetch,
    'x-download-options': downloadOptions,
    'x-powered-by': poweredBy
  });
});

// ==========================================
// 2. BCRYPT DEMONSTRATION TESTS
// ==========================================
test('Task 3 [bcrypt] - Securely hashes passwords with salt and verifies authentication', async () => {
  const plainPassword = 'MedicalSecurePassword@2026';

  // Step 1: Generate hash with 10 salt rounds
  const saltRounds = 10;
  const hash1 = await bcrypt.hash(plainPassword, saltRounds);
  const hash2 = await bcrypt.hash(plainPassword, saltRounds);

  // Assert hashes are non-empty and start with bcrypt version prefix ($2a$ or $2b$)
  assert.ok(hash1.startsWith('$2'), 'Bcrypt hash must begin with $2 prefix');
  assert.ok(hash2.startsWith('$2'), 'Bcrypt hash must begin with $2 prefix');

  // Assert distinct hashes for identical passwords due to random salt generation
  assert.notEqual(hash1, hash2, 'Two hashes of the same password must differ due to unique salts');

  // Step 2: Verification of correct password
  const matchSuccess = await bcrypt.compare(plainPassword, hash1);
  assert.equal(matchSuccess, true, 'bcrypt.compare must return true for matching password');

  // Step 3: Verification rejection for incorrect password
  const matchFailure = await bcrypt.compare('WrongPassword@123', hash1);
  assert.equal(matchFailure, false, 'bcrypt.compare must return false for non-matching password');

  console.log('[Task 3 Demo] bcrypt Hashing & Salt Verification Verified Successfully:', {
    plainPassword,
    hash1Preview: hash1.substring(0, 25) + '...',
    hash2Preview: hash2.substring(0, 25) + '...',
    distinctSalts: hash1 !== hash2,
    validMatch: matchSuccess,
    invalidMatch: matchFailure
  });
});

// ==========================================
// 3. JOI INPUT VALIDATION DEMONSTRATION TESTS
// ==========================================
test('Task 3 [Joi] - Rejects invalid registration payload with 400 and structured error envelope', async () => {
  // Test invalid email and too-short password
  const malformedPayload = {
    name: 'A', // Too short (min 2)
    email: 'not-a-valid-email', // Invalid email
    password: '123' // Too short (min 6)
  };

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(malformedPayload)
  });

  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(body.error.details), 'Joi error must return structured error details array');

  console.log('[Task 3 Demo] Joi Input Validation Rejection Verified Successfully:', {
    httpStatus: res.status,
    errorCode: body.error.code,
    messages: body.error.details
  });
});

test('Task 3 [Joi] - Allows valid registration payload to process cleanly', async () => {
  const validPayload = {
    name: 'Dr. Jane Task3',
    email: `task3-test-${Date.now()}@healthcare.com`,
    password: 'SecurePassword@123',
    role: UserRole.DOCTOR,
    qualification: 'MD Cardiology',
    experience: 8,
    fee: 650
  };

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload)
  });

  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.success, true);
  assert.ok(body.data.token, 'Registration must return valid JWT token');
  assert.equal(body.data.user.email, validPayload.email.toLowerCase());
  assert.equal(body.data.user.passwordHash, undefined, 'passwordHash must never be exposed');

  console.log('[Task 3 Demo] Joi Input Validation Acceptance Verified Successfully:', {
    httpStatus: res.status,
    userEmail: body.data.user.email,
    role: body.data.user.role
  });
});

test('Task 3 [Joi] - Rejects invalid booking payload with malformed ObjectId', async () => {
  const { error } = bookingSchema.validate({
    slotId: 'invalid-non-hex-id',
    reason: 'Routine checkup'
  });

  assert.ok(error, 'Joi schema must reject non-24-hex ObjectId');
  assert.match(error.message, /valid 24-character hexadecimal MongoDB ObjectId/);

  console.log('[Task 3 Demo] Joi ObjectId Schema Validation Verified:', {
    rejectedId: 'invalid-non-hex-id',
    errorMessage: error.message
  });
});
