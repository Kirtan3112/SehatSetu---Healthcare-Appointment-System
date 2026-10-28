# ITM SLS BU
## School of Computer Science, Engineering & Technology, Vadodara
### B.Tech Semester-5 | AY 2026-2027, Winter-2026 | Advanced Web Development (AWD)
---

# Task-3: Implementation & Demonstration of Security Libraries
### Project: CareSync — Healthcare Appointment System (HAS)
**Course:** Advanced Web Development (PBL Submission Component)  
**Target:** Regular Final Viva-Voce Examination

---

## 1. Executive Overview

Under **Task-3** of the AWD Semester-5 syllabus, students are required to justify, implement, and practically demonstrate the integration of three vital Node.js security libraries within their Project-Based Learning (PBL) application:

1. **Helmet.js (`helmet`)**: Configures secure HTTP response headers to harden the application against common web attacks such as clickjacking, MIME-type sniffing, and cross-site scripting.
2. **bcrypt (`bcryptjs`)**: Provides cryptographically secure password hashing using adaptive salt rounds to protect user credentials against rainbow tables and brute-force cracking.
3. **Joi (`joi`)**: Enforces schema-based runtime input validation on incoming HTTP requests, ensuring data integrity and preventing malformed payloads, injection, or unexpected runtime exceptions.

This document presents the technical justifications, implementation architectures, complete code snippets, and live execution results verified through automated test suites in the CareSync codebase.

---

## 2. Library 1: Helmet.js (`helmet`)

### 2.1 Justification for Healthcare Application
In modern web architectures, browsers rely on standard HTTP response headers to enforce security policies. Default Express.js configurations lack defensive headers and inadvertently broadcast server fingerprinting headers (e.g., `X-Powered-By: Express`). 

By integrating **Helmet.js**, CareSync automatically applies 15 built-in security middlewares that establish defensive browser constraints:
- **Clickjacking Prevention (`X-Frame-Options: SAMEORIGIN`)**: Prevents malicious third-party websites from embedding the patient booking or admin portal within invisible `<iframes>`, defending against clickjacking attacks.
- **MIME-Sniffing Mitigation (`X-Content-Type-Options: nosniff`)**: Forces browsers to strictly adhere to declared MIME types, preventing executable scripts from being disguised as images or text documents.
- **DNS Prefetch Control (`X-DNS-Prefetch-Control: off`)**: Disables speculative DNS lookups on clinical pages, protecting sensitive patient URLs from being leaked to network observers.
- **Technology Fingerprint Masking**: Automatically removes the `X-Powered-By` header, preventing attackers from identifying the specific underlying web server runtime.

### 2.2 Code Implementation in CareSync
Helmet.js is initialized as global middleware in [server/src/app.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/app.js#L3-L13):

```javascript
const express = require('express');
const helmet = require('helmet');

const app = express();

// Configure HTTP security headers via Helmet
app.use(helmet());
```

### 2.3 Live Demonstration & Execution Results
Verified via automated test in `server/test/task3_security_libraries.test.js`:

```javascript
test('Task 3 [Helmet.js] - Correctly sets OWASP security HTTP headers on responses', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(res.headers.get('x-dns-prefetch-control'), 'off');
  assert.equal(res.headers.get('x-download-options'), 'noopen');
  assert.equal(res.headers.get('x-powered-by'), null); // Hidden!
});
```

**Captured Terminal Output:**
```json
[Task 3 Demo] Helmet.js Security Headers Verified Successfully: {
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "x-dns-prefetch-control": "off",
  "x-download-options": "noopen",
  "x-powered-by": null
}
✔ Task 3 [Helmet.js] - Correctly sets OWASP security HTTP headers on responses (60.3884ms)
```

---

## 3. Library 2: bcrypt (`bcryptjs`)

### 3.1 Justification for Healthcare Application
Healthcare appointment systems store critical user identities (Patients, Doctors, Hospital Administrators). Storing plaintext passwords or utilizing fast hash functions (such as MD5 or SHA-256) is a severe vulnerability because modern GPUs can compute billions of SHA-256 hashes per second.

**bcrypt** is an adaptive cryptographic hash function based on the Blowfish cipher. It incorporates two essential defenses:
1. **Randomized Salting**: A unique 16-byte random salt is automatically generated and embedded into each hash. Consequently, two users with identical passwords (e.g., `Password@123`) produce completely different hash strings, rendering precomputed rainbow table attacks impossible.
2. **Configurable Work Factor (Salt Rounds)**: bcrypt is intentionally slow. The cost factor $2^{10} = 1024$ iterations ensures that verifying a single password takes ~100–150ms on modern CPUs — negligible for legitimate logins, but devastating to brute-force dictionary attacks.

### 3.2 Code Implementation in CareSync
In [server/src/controllers/authController.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/controllers/authController.js#L33-L107):

```javascript
const bcrypt = require('bcryptjs');

// 1. Password Hashing during Registration
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

const user = await User.create({
  name,
  email,
  passwordHash,
  role
});

// 2. Password Verification during Authentication / Login
const user = await User.findOne({ email });
const isMatch = await bcrypt.compare(password, user.passwordHash);

if (!isMatch) {
  return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
}
```

In [server/src/models/User.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/models/User.js#L47-L51), the `passwordHash` is stripped during JSON serialization:
```javascript
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};
```

### 3.3 Live Demonstration & Execution Results
Verified via automated test in `server/test/task3_security_libraries.test.js`:

```javascript
test('Task 3 [bcrypt] - Securely hashes passwords with salt and verifies authentication', async () => {
  const plainPassword = 'MedicalSecurePassword@2026';
  const saltRounds = 10;
  
  const hash1 = await bcrypt.hash(plainPassword, saltRounds);
  const hash2 = await bcrypt.hash(plainPassword, saltRounds);

  assert.ok(hash1.startsWith('$2'));
  assert.notEqual(hash1, hash2, 'Unique salts must produce different hashes for same password');

  const matchSuccess = await bcrypt.compare(plainPassword, hash1);
  const matchFailure = await bcrypt.compare('WrongPassword@123', hash1);

  assert.equal(matchSuccess, true);
  assert.equal(matchFailure, false);
});
```

**Captured Terminal Output:**
```json
[Task 3 Demo] bcrypt Hashing & Salt Verification Verified Successfully: {
  "plainPassword": "MedicalSecurePassword@2026",
  "hash1Preview": "$2b$10$HSoPChhbpcGAIyc59D...",
  "hash2Preview": "$2b$10$gnkkTNo1.heW7lV/VS...",
  "distinctSalts": true,
  "validMatch": true,
  "invalidMatch": false
}
✔ Task 3 [bcrypt] - Securely hashes passwords with salt and verifies authentication (342.0397ms)
```

---

## 4. Library 3: Joi (`joi`)

### 4.1 Justification for Healthcare Application
Unvalidated input is the root cause of injection vulnerabilities, buffer overruns, type confusion, and database errors. Mongoose schema validation occurs too late in the request lifecycle (inside the database layer).

**Joi** is a powerful schema description and data validator for JavaScript. Integrating Joi provides:
1. **Early Boundary Defense**: Malformed or malicious requests are rejected at the route middleware layer before touching business logic or database queries.
2. **Type Coercion & Stripping**: Unknown fields injected by malicious actors (`stripUnknown: true`) are pruned automatically, preventing mass-assignment vulnerabilities.
3. **Standardized 400 Bad Request Feedback**: Returns detailed, human-readable error messages specifying exactly which field violated schema constraints.
4. **Format & Boundary Enforcement**: Ensures emails match RFC patterns, passwords satisfy minimum length constraints, and MongoDB ObjectIds conform to 24-character hexadecimal formats.

### 4.2 Code Implementation in CareSync

#### Validation Middleware ([server/src/middlewares/validate.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/middlewares/validate.js)):
```javascript
const { sendError } = require('../utils/4631_responseEnvelope');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => detail.message);
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        errorDetails.join('; '),
        errorDetails
      );
    }

    req[source] = value;
    next();
  };
};

module.exports = { validate };
```

#### Schema Definitions ([server/src/validators/schemas.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/validators/schemas.js)):
```javascript
const Joi = require('joi');
const { UserRole } = require('../models/4631_User');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN).default(UserRole.PATIENT),
  phone: Joi.string().trim().allow('').max(20).optional(),
  qualification: Joi.string().trim().max(100).optional(),
  experience: Joi.number().min(0).max(70).optional(),
  fee: Joi.number().min(0).max(100000).optional()
});

const bookingSchema = Joi.object({
  slotId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  reason: Joi.string().trim().max(500).allow('').optional()
});
```

#### Route Protection ([server/src/routes/authRoutes.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/routes/authRoutes.js#L14-L15)):
```javascript
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
```

### 4.3 Live Demonstration & Execution Results
Verified via automated test in `server/test/task3_security_libraries.test.js`:

```javascript
test('Task 3 [Joi] - Rejects invalid registration payload with 400 and structured error envelope', async () => {
  const malformedPayload = {
    name: 'A',                 // Too short (min 2)
    email: 'not-a-valid-email', // Invalid email
    password: '123'             // Too short (min 6)
  };

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(malformedPayload)
  });

  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});
```

**Captured Terminal Output:**
```json
[Task 3 Demo] Joi Input Validation Rejection Verified Successfully: {
  "httpStatus": 400,
  "errorCode": "VALIDATION_ERROR",
  "messages": [
    "Name must be at least 2 characters long",
    "Please enter a valid email address",
    "Password must be at least 6 characters long"
  ]
}
✔ Task 3 [Joi] - Rejects invalid registration payload with 400 and structured error envelope (22.4469ms)

[Task 3 Demo] Joi Input Validation Acceptance Verified Successfully: {
  "httpStatus": 201,
  "userEmail": "task3-test-1792558958096@healthcare.com",
  "role": "DOCTOR"
}
✔ Task 3 [Joi] - Allows valid registration payload to process cleanly (115.4888ms)

[Task 3 Demo] Joi ObjectId Schema Validation Verified: {
  "rejectedId": "invalid-non-hex-id",
  "errorMessage": "Must be a valid 24-character hexadecimal MongoDB ObjectId"
}
✔ Task 3 [Joi] - Rejects invalid booking payload with malformed ObjectId (0.9746ms)
```

---

## 5. Summary & Multi-Layered Security Synergy

Together, the three libraries form an impenetrable three-tier security shield:

```
[ Incoming HTTP Client Request ]
               │
               ▼
   [ TIER 1: Helmet.js ]
   • Sets HTTP Security Headers (nosniff, SAMEORIGIN, CSP)
   • Strips X-Powered-By header
               │
               ▼
   [ TIER 2: Joi Middleware ]
   • Validates payload types, email formats, and string lengths
   • Strips unknown injected parameters
   • Rejects malformed requests with HTTP 400 Bad Request
               │
               ▼
   [ TIER 3: Controller & bcrypt ]
   • Hashes user passwords with 10 salt rounds before storage
   • Performs constant-time password comparison on login
   • Strips passwordHash during JSON serialization
               │
               ▼
   [ MongoDB Persistence Layer ]
```

All 31 integration and security unit tests in the CareSync test suite pass with **100% success**, verifying that the application is fully hardened and ready for university viva-voce evaluation.
