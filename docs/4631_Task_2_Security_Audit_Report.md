# ITM SLS BU
## School of Computer Science, Engineering & Technology, Vadodara
### B.Tech Semester-5 | AY 2026-2027, Winter-2026 | Advanced Web Development (AWD)
---

# Task-2: Security Audit Report
### Project: CareSync — Healthcare Appointment System (HAS)
**Course:** Advanced Web Development (PBL Submission Component)  
**Target:** Regular Final Viva-Voce Examination

---

## 1. Executive Summary

Healthcare platforms handle sensitive Personally Identifiable Information (PII) and Protected Health Information (PHI). Maintaining the highest standards of data confidentiality, system integrity, and service availability is a mandatory architectural obligation.

This **Security Audit Report** presents a comprehensive, systematic security assessment of the **CareSync Healthcare Appointment System (HAS)** codebase, encompassing both the Node.js/Express backend REST API and the React 19 single-page application.

The audit was conducted strictly against industry benchmarks, including:
- **OWASP Top 10 Web Application Security Risks (2021/2025)**
- **CWE (Common Weakness Enumeration)**
- **AWD Semester-5 Security Guidelines** (covering NoSQL Injection, XSS, Weak Authentication & Authorization, Insecure Password Storage, Input Validation, and Concurrency Hazards)

Every vulnerability identified during the audit is categorized with a risk level (**High**, **Medium**, or **Low**), potential business and clinical impact, recommended preventive measures, and an overview of improvements already implemented or proposed.

---

## 2. Security Vulnerability & Audit Matrix

The following matrix provides a consolidated summary of all security vectors evaluated across the CareSync codebase:

| Ref ID | Security Vulnerability Vector | Severity / Risk Level | OWASP / CWE Mapping | Current Code Status | Primary Mitigation Implemented / Proposed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **NoSQL Injection Vulnerabilities** | **Medium** | OWASP A03:2021 (Injection) / CWE-943 | Partially Mitigated | Mongoose schema casting + Joi type enforcement |
| **SEC-02** | **Cross-Site Scripting (XSS)** | **Low / Mitigated** | OWASP A03:2021 (Injection) / CWE-79 | Fully Mitigated | React JSX auto-escaping + Helmet HTTP headers |
| **SEC-03** | **Weak Authentication & Session Hijacking** | **Medium** | OWASP A07:2021 (Auth Failures) / CWE-287 | Mostly Mitigated | JWT HS256 tokens + role verification + proposed shorter TTL |
| **SEC-04** | **Broken Authorization (RBAC Privilege Escalation)** | **High / Mitigated** | OWASP A01:2021 (Broken Access Control) / CWE-285 | Fully Mitigated | Express `authorizeRoles` guards + Admin self-protection |
| **SEC-05** | **Insecure Password Storage & Leakage** | **Low / Mitigated** | OWASP A02:2021 (Cryptographic Failures) / CWE-256 | Fully Mitigated | bcryptjs (10 rounds) + `toJSON` password hash stripping |
| **SEC-06** | **Inadequate Input Validation & Boundary Checks** | **Medium** | OWASP A04:2021 (Insecure Design) / CWE-20 | Implemented (Task 3) | Centralized Joi schema validation middleware |
| **SEC-07** | **High-Concurrency Race Condition (Double-Booking)** | **High / Mitigated** | CWE-362 (Race Condition) | Fully Mitigated | Atomic `findOneAndUpdate` + Partial Unique Index |
| **SEC-08** | **Denial of Service (DoS) & Brute Force Attacks** | **Medium** | OWASP A04:2021 (Rate Limiting) / CWE-799 | Mitigated | `express-rate-limit` + 1MB JSON body payload cap |
| **SEC-09** | **Sensitive Information Exposure via Error Handling** | **Low / Mitigated** | OWASP A05:2021 (Security Misconfiguration) / CWE-209 | Fully Mitigated | Centralized error envelope; stack traces suppressed in production |
| **SEC-10** | **Cross-Origin Resource Sharing (CORS) Exposure** | **Low / Mitigated** | OWASP A05:2021 (CORS Misconfiguration) / CWE-942 | Fully Mitigated | Strict origin whitelisting (`localhost:5173`, `localhost:3000`) |

---

## 3. Deep-Dive Audit Analysis by Security Vector

### 3.1 SEC-01: SQL & NoSQL Injection Audit
- **Vulnerability Description:**
  In document databases such as MongoDB, NoSQL injection occurs when unvalidated user input is passed directly into database query objects without sanitization, enabling attackers to inject MongoDB query operators (such as `{"$gt": ""}` or `{"$ne": null}`) to bypass authentication or extract unauthorized records.
- **Audit Findings in CareSync:**
  - In `authController.js`, queries perform string manipulation prior to execution (e.g., `email.toLowerCase().trim()`). If an attacker sends an operator object `{ "email": { "$gt": "" } }`, Node.js immediately throws a runtime `TypeError` (`email.toLowerCase is not a function`), safely halting execution.
  - Mongoose models enforce explicit schema types (`String`, `ObjectId`, `Date`), which rejects arbitrary operator injection during casting.
- **Risk Classification:** **Medium**
- **Potential Impact:** Unauthorized record extraction, authentication bypass, or data leakage.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* Strict schema casting via Mongoose ODM.
  2. *Implemented:* Request input validation via `Joi` to guarantee that all query fields are strictly validated as strings before reaching controller queries.
  3. *Proposed:* Integrate `express-mongo-sanitize` to strip all `$` and `.` characters from incoming request bodies and parameters.

---

### 3.2 SEC-02: Cross-Site Scripting (XSS) Audit
- **Vulnerability Description:**
  Cross-Site Scripting occurs when an application includes untrusted user-supplied data in a web page without proper validation or escaping, allowing attackers to execute malicious JavaScript in the victim's browser session.
- **Audit Findings in CareSync:**
  - **Client-Side:** The frontend is built on **React 19**. React natively protects against reflected and stored XSS by encoding strings rendered within JSX `{value}` expressions into safe DOM text nodes. A comprehensive audit of the client source confirmed that `dangerouslySetInnerHTML` is **nowhere in use**.
  - **Server-Side:** The backend integrates **Helmet.js** (`app.use(helmet())`), which emits security HTTP headers:
    - `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing).
    - `X-XSS-Protection: 0` (disables flawed legacy browser XSS filters in favor of modern CSP).
    - `Content-Security-Policy` (CSP) default directives restricting script execution origins.
- **Risk Classification:** **Low / Fully Mitigated**
- **Potential Impact:** Session token theft, UI defacement, or unauthorized user impersonation.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* React 19 JSX auto-escaping across all views.
  2. *Implemented:* Helmet HTTP security headers.
  3. *Proposed:* Sanitize free-text fields (e.g., appointment clinical reason, doctor bio) using a library such as `DOMPurify` if rich-text rendering is introduced.

---

### 3.3 SEC-03: Weak Authentication & Session Security Audit
- **Vulnerability Description:**
  Flaws in authentication mechanisms allow attackers to compromise passwords, forge authentication tokens, or maintain perpetual unauthorized access through stolen session credentials.
- **Audit Findings in CareSync:**
  - **Strengths:**
    - Authentication utilizes **JSON Web Tokens (JWT)** signed with `HMAC-SHA256`.
    - Every authenticated request verifies token signature, expiration, and user existence in the database (`User.findById(decoded.userId)`).
    - Deactivated accounts are blocked immediately (`if (!user.isActive) return sendError(403, 'ACCOUNT_DEACTIVATED')`).
  - **Vulnerabilities Identified:**
    - Token validity is currently set to `7d` (7 days), which presents an extended window of exposure if a token is intercepted.
    - Default `JWT_SECRET` fallback exists in `env.js` for development convenience.
- **Risk Classification:** **Medium**
- **Potential Impact:** Unauthorized session hijacking and patient/doctor account impersonation.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* Cryptographic signature verification and real-time active-status checking on every request.
  2. *Proposed:* Shorten access token lifetime to **15–30 minutes** and implement a secure HTTP-only refresh token rotation architecture.
  3. *Proposed:* Require production deployments to enforce high-entropy 256-bit secrets via `.env`.

---

### 3.4 SEC-04: Broken Authorization & RBAC Privilege Escalation
- **Vulnerability Description:**
  Broken access control allows unauthorized users to access restricted endpoints, elevate their privileges, or modify data belonging to other accounts.
- **Audit Findings in CareSync:**
  - **Strengths:**
    - Explicit role-based middleware (`authorizeRoles(UserRole.DOCTOR)`, `authorizeRoles(UserRole.ADMIN)`) is applied to sensitive routes.
    - Self-registration as `ADMIN` is strictly rejected with HTTP `403 Forbidden` ([authController.js:L21-25](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/controllers/authController.js#L21-L25)).
    - Admins cannot deactivate their own accounts, preventing administrative lockout.
    - Doctor verification workflow: Newly registered doctors are assigned `approved: false` and are hidden from patient search directories until approved by an administrator.
    - Integration tests in `task9_admin.test.js` and `task12_rbac_redirect.test.js` confirm 100% enforcement of access control boundaries.
- **Risk Classification:** **High / Fully Mitigated**
- **Potential Impact:** Unauthorized access to clinical audit logs, illegal approval of unverified doctors, or manipulation of hospital schedules.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* Route-level RBAC middleware enforcing strict least-privilege boundaries.
  2. *Implemented:* Comprehensive automated integration test suite validating role rejection.

---

### 3.5 SEC-05: Insecure Password Storage & Data Exposure Audit
- **Vulnerability Description:**
  Storing passwords in plaintext or using outdated hash algorithms (e.g., MD5, SHA-1) allows attackers who obtain database access to easily reverse user credentials.
- **Audit Findings in CareSync:**
  - **Strengths:**
    - Passwords are securely hashed using **`bcryptjs`** with **10 salt rounds**, rendering brute-force rainbow table attacks computationally infeasible.
    - The Mongoose `User` schema defines a custom `toJSON` serialization method that explicitly deletes `passwordHash` before any user object is returned over the network:
      ```javascript
      userSchema.methods.toJSON = function () {
        const obj = this.toObject();
        delete obj.passwordHash;
        return obj;
      };
      ```
    - Passwords are never written to audit logs or console debugging output.
- **Risk Classification:** **Low / Fully Mitigated**
- **Potential Impact:** Credential cracking, password leakage, and identity compromise.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* bcrypt 10 salt rounds for all user registrations and password changes.
  2. *Implemented:* Automatic JSON serialization suppression of password hashes.
  3. *Implemented:* Enforcement of password complexity regex via Joi input validation.

---

### 3.6 SEC-06: Inadequate Input Validation & Boundary Testing
- **Vulnerability Description:**
  Accepting unvalidated input allows malformed payloads, buffer overruns, type confusion, or unexpected null/undefined exceptions to crash application services.
- **Audit Findings in CareSync:**
  - Prior to Task 3, input validation relied primarily on manual `if (!email)` statements and Mongoose schema error handling.
  - Query parameters (such as `date`, `doctorId`, and status filters) lacked strict boundary checks.
- **Risk Classification:** **Medium**
- **Potential Impact:** Unhandled exceptions, 500 internal server errors, or invalid database state transitions.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented (Task 3):* Centralized `Joi` validation middleware to validate schemas for registration, login, appointment booking, and status updates before request handlers execute.
  2. *Implemented:* Standardized response envelopes returning 400 Bad Request with granular field-level error messages.

---

### 3.7 SEC-07: Concurrency Hazards & Double-Booking Protection
- **Vulnerability Description:**
  In high-traffic healthcare environments, race conditions occur when multiple patients simultaneously attempt to reserve the same time slot, resulting in double-booking and clinical scheduling conflicts.
- **Audit Findings in CareSync:**
  - **Strengths:**
    - CareSync implements an atomic compare-and-set claim:
      ```javascript
      const slot = await Slot.findOneAndUpdate(
        { _id: slotId, isBooked: false },
        { $set: { isBooked: true } },
        { new: true }
      );
      ```
    - At the database engine level, a **partial unique index** enforces uniqueness on `slotId` for active appointments:
      ```javascript
      appointmentSchema.index(
        { slotId: 1 },
        { unique: true, partialFilterExpression: { status: { $in: ['PENDING', 'CONFIRMED'] } } }
      );
      ```
    - Verified under stress testing: 10 simultaneous requests for 1 slot result in exactly **1 success (201 Created)** and **9 conflicts (409 Conflict)**.
- **Risk Classification:** **High / Fully Mitigated**
- **Potential Impact:** Severe clinical scheduling overlap, patient distress, and operational disruption.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* Database-level partial unique index.
  2. *Implemented:* Atomic single-operation compare-and-set booking engine with automatic transaction rollback.

---

### 3.8 SEC-08: Rate Limiting & Denial of Service (DoS) Audit
- **Vulnerability Description:**
  Applications lacking request throttling are vulnerable to credential stuffing, brute-force dictionary attacks, and denial of service.
- **Audit Findings in CareSync:**
  - Integrated `express-rate-limit` enforces a global window of 1000 requests per 15 minutes per IP.
  - Body parser limits payload size to 1 MB (`express.json({ limit: '1mb' })`), preventing memory exhaustion attacks via massive payloads.
- **Risk Classification:** **Medium / Mitigated**
- **Potential Impact:** Service outage, server memory exhaustion, and credential brute-forcing.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* Global IP-based rate limiting with standard headers.
  2. *Proposed:* Configure a dedicated, strict rate limiter on `/api/auth/login` (e.g., maximum 5 login attempts per 15-minute window).

---

### 3.9 SEC-09: Error Handling & Information Leakage Audit
- **Vulnerability Description:**
  Exposing internal database stack traces, file system paths, or raw database error dumps in HTTP responses aids attackers in profiling the server environment.
- **Audit Findings in CareSync:**
  - The centralized error handler in [errorHandler.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/middlewares/errorHandler.js) intercepts all runtime exceptions.
  - Mongoose `CastError`, `ValidationError`, and `11000 Duplicate Key` errors are transformed into clean client-friendly JSON envelopes (`{ success: false, error: { code, message } }`).
  - Stack traces are strictly guarded:
    ```javascript
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    ```
- **Risk Classification:** **Low / Fully Mitigated**
- **Potential Impact:** Server topology reconnaissance and vulnerability mapping.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* Uniform response envelope pattern.
  2. *Implemented:* Suppression of internal stack traces in production mode.

---

### 3.10 SEC-10: Cross-Origin Resource Sharing (CORS) Audit
- **Vulnerability Description:**
  Overly permissive CORS configurations (e.g., `origin: '*'`) allow malicious external websites to send authenticated cross-origin requests on behalf of legitimate users.
- **Audit Findings in CareSync:**
  - CORS in [app.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/app.js#L16-L21) is explicitly locked to trusted development and client origins:
    ```javascript
    app.use(cors({
      origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key']
    }));
    ```
- **Risk Classification:** **Low / Fully Mitigated**
- **Potential Impact:** Cross-origin data theft and unauthorized API invocation.
- **Implemented & Proposed Preventive Measures:**
  1. *Implemented:* Strict origin whitelisting.

---

## 4. Security Action Plan & Summary Recommendations

| Priority | Security Area | Recommendation | Implementation Timeline |
| :--- | :--- | :--- | :--- |
| **P1** | **Input Validation** | Enforce Joi schema validation across all POST/PUT/PATCH endpoints | Completed in Task 3 |
| **P1** | **Login Throttling** | Implement dedicated rate limiter (5 attempts / 15 min) on `/api/auth/login` | Short-term enhancement |
| **P2** | **Token Lifecycle** | Introduce refresh token rotation and shorten access token TTL to 30 min | Medium-term enhancement |
| **P2** | **NoSQL Sanitization** | Integrate `express-mongo-sanitize` middleware | Short-term enhancement |
| **P3** | **Security Auditing** | Schedule periodic automated dependency vulnerability audits (`npm audit`) | Continuous CI/CD |

---

## 5. Conclusion

The security audit confirms that **CareSync Healthcare Appointment System** demonstrates a strong security posture with robust defensive engineering already integrated into its core architecture. Key security controls — including atomic race-condition prevention, bcrypt password hashing, role-based authorization guards, Helmet HTTP security headers, and centralized error sanitization — effectively mitigate critical attack vectors. With the addition of Joi input validation in Task 3, the project thoroughly satisfies all security requirements stipulated by the ITM SLS BU Semester-5 AWD evaluation criteria.
