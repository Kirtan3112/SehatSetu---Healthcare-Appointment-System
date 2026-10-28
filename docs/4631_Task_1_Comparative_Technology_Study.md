# ITM SLS BU
## School of Computer Science, Engineering & Technology, Vadodara
### B.Tech Semester-5 | AY 2026-2027, Winter-2026 | Advanced Web Development (AWD)
---

# Task-1: Comparative Technology Study
### Project: CareSync — Healthcare Appointment System (HAS)
**Course:** Advanced Web Development (PBL Submission Component)  
**Target:** Regular Final Viva-Voce Examination

---

## Executive Summary
This document provides an in-depth **Comparative Technology Study** as mandated under **Task-1** of the AWD Semester-5 evaluation. Four foundational architectural choices implemented within the **CareSync Healthcare Appointment System (HAS)** are critically evaluated against industry-standard alternatives:

1. **API Architecture:** RESTful API vs. GraphQL
2. **Database Engine:** MongoDB (Document NoSQL) vs. MySQL (Relational SQL)
3. **Frontend Framework:** React 19 vs. Angular
4. **Authentication & Authorization Strategy:** JWT (Stateless Bearer Tokens) vs. Session-Based Authentication

Each study encompasses architectural introductions, key features, side-by-side comparative matrices, advantages and limitations, suitable application use cases, and an empirical justification for its adoption in the CareSync project.

---

## 1. Study 1: RESTful API vs. GraphQL

### 1.1 Introduction
- **REST (Representational State Transfer):** An architectural style formulated by Roy Fielding in 2000, operating over HTTP using standard methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). Resources are identified via distinct Uniform Resource Identifiers (URIs) (e.g., `/api/appointments`, `/api/doctors`, `/api/slots`). Data is typically exchanged using JSON, and communication is governed by standard HTTP status codes (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `403 Forbidden`, `409 Conflict`).
- **GraphQL:** An open-source data query and manipulation language developed internally by Meta in 2012 and released publicly in 2015. It exposes a single HTTP POST endpoint (`/graphql`) where clients specify the exact schema structure of the requested payload, mitigating over-fetching and under-fetching.

### 1.2 Side-by-Side Comparative Matrix

| Evaluation Dimension | RESTful API (Express.js) | GraphQL (Apollo Server) |
| :--- | :--- | :--- |
| **Endpoint Topology** | Multiple distinct resource endpoints (`/api/auth`, `/api/appointments`) | Single endpoint (typically `POST /graphql`) |
| **Data Fetching Precision** | Fixed server response shape; prone to over-fetching or under-fetching | Client queries exact fields; zero over-fetching |
| **Network Caching** | Native HTTP-level caching using ETags, `Cache-Control`, and CDN edge proxies | Complex client-side caching (requires normalized Apollo InMemoryCache) |
| **Status Codes & Semantics** | Rich HTTP semantics (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `429`) | Almost always returns `200 OK`, even for errors (errors contained in payload array) |
| **Concurrency & Idempotency** | Standard idempotency headers, standard conflict responses (`409 Conflict`) | Mutations require custom error handling schemas and complex lock mechanisms |
| **Security & Rate Limiting** | Endpoint-specific rate limiting (`express-rate-limit`), simple WAF inspection | Requires query depth/complexity analysis to prevent recursive DoS queries |
| **Learning Curve & Tooling** | Ubiquitous, standard tooling (Postman, curl, native browser fetch) | Requires schema definition language (SDL), resolver management, and client libraries |

### 1.3 Advantages and Limitations

#### RESTful API
- **Advantages:**
  - Standardized HTTP semantics enable transparent monitoring, debugging, and edge caching.
  - Granular security controls: Route-level middleware can easily enforce role-based access control (RBAC) and rate-limiting per endpoint.
  - Predictable failure domains: If the doctor schedule endpoint fails, booking and user auth remain unaffected.
  - Native file upload and multipart stream support.
- **Limitations:**
  - Potential over-fetching when client only needs a few fields (e.g., doctor name and fee).
  - Can lead to multiple round-trips (under-fetching) if endpoints are not properly consolidated.

#### GraphQL
- **Advantages:**
  - Single network roundtrip can assemble complex relational trees (e.g., Doctor + Department + Specialization + Slots in one query).
  - Strictly typed schema with automatic documentation and client code generation.
  - Ideal for heterogeneous frontends (smartphones, smartwatches, desktops) with varying bandwidth constraints.
- **Limitations:**
  - HTTP-level caching and CDN integration are cumbersome.
  - Security vulnerability to malicious recursive queries (e.g., querying `user -> appointments -> user -> appointments...`) causing denial of service.
  - Returns `200 OK` for application errors, confounding HTTP proxies and standard error monitors.

### 1.4 Suitable Real-World Use Cases
- **REST API:** Mission-critical transactional engines, healthcare records, financial booking systems, public RESTful web services, and microservice architectures with strict edge security.
- **GraphQL:** Social media aggregators, news feeds, complex e-commerce product catalogs where client devices demand variable data shapes.

### 1.5 CareSync Project Justification
In **CareSync**, appointments and discrete time slots represent a high-concurrency transactional boundary. REST was chosen because:
1. **Concurrency Conflict Semantics:** Under race conditions (where multiple patients attempt to book the same slot), CareSync returns an HTTP `409 Conflict` status code, directly adhering to RFC 7231 specifications.
2. **Granular RBAC En route:** Patient endpoints (`/api/appointments`), Doctor endpoints (`/api/availability`), and Admin endpoints (`/api/admin/*`) are guarded by discrete Express middleware functions returning HTTP `403 Forbidden` for unauthorized actors.
3. **Transparent Rate Limiting:** A global and route-specific rate limiter ([app.js:L33-42](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/app.js#L33-L42)) inspects incoming paths directly without needing AST query parsing.
4. **Standard Envelope Pattern:** Uniform response packaging (`{ success: true, data, message }` or `{ success: false, error }`) ensures predictable client parsing across all UI components.

---

## 2. Study 2: MongoDB (NoSQL) vs. MySQL (Relational SQL)

### 2.1 Introduction
- **MongoDB:** A leading open-source, document-oriented NoSQL database that persists data in flexible, binary JSON (BSON) structures. In the MERN stack, MongoDB is paired with Mongoose Object Data Modeling (ODM) to provide schema validation, compound indexing, and lifecycle hooks while retaining horizontal scalability and dynamic typing.
- **MySQL:** An established open-source Relational Database Management System (RDBMS) developed by Oracle. It organizes data into rigid two-dimensional tables with rows and columns, strictly enforces schema constraints via Data Definition Language (DDL), and relies on Structured Query Language (SQL) and multi-table `JOIN` operations.

### 2.2 Side-by-Side Comparative Matrix

| Evaluation Dimension | MongoDB (Document NoSQL) | MySQL (Relational SQL) |
| :--- | :--- | :--- |
| **Data Storage Format** | BSON (Binary JSON) documents organized in collections | Tables consisting of fixed columns and typed rows |
| **Schema Paradigm** | Dynamic, schema-less at engine level; enforced by application ODM (Mongoose) | Rigid, predefined DDL schema; requires migrations (`ALTER TABLE`) |
| **Relationships & Joins** | Document embedding or normalized references (`ObjectId` + `$lookup` / `.populate()`) | Relational foreign keys (`FK`) with ANSI SQL `JOIN` clauses |
| **Atomicity & Locking** | Atomic single-document operations (`findOneAndUpdate`, compare-and-set); multi-document ACID transactions available | Table and row-level locking (InnoDB engine) with full multi-table ACID transactions |
| **Indexing Capabilities** | Single field, compound indexes, partial filter indexes, TTL indexes, geospatial indexes | B-tree indexes, unique constraints, clustered primary keys |
| **JavaScript / JSON Synergy** | 100% native JSON/JavaScript alignment; zero object-relational impedance mismatch | Requires Object-Relational Mapping (ORM) layer (e.g., Sequelize, Prisma) |
| **Horizontal Scalability** | Native sharding and replica set clustering out of the box | Historically vertical; horizontal sharding is architecturally complex |

### 2.3 Advantages and Limitations

#### MongoDB
- **Advantages:**
  - **Native JSON Alignment:** Node.js backend operates directly on JSON/BSON objects, removing the overhead of SQL mapping.
  - **Flexible Clinical Modeling:** Doctor profiles, clinical qualifications, bio, and multi-day weekly availability schedules fit naturally into semi-structured documents.
  - **Single-Operation Atomic Guarantees:** Atomic `findOneAndUpdate` enables compare-and-set slot reservations without manual database lock management.
  - **Partial Unique Indexes:** Enables advanced uniqueness constraints conditioned on document states (e.g., active bookings only).
- **Limitations:**
  - Memory consumption can be higher than optimized relational tables.
  - Complex multi-collection reporting requires aggregation pipelines (`$match`, `$lookup`, `$group`) which can be slower than native relational joins if not properly indexed.

#### MySQL
- **Advantages:**
  - Strict mathematical relational integrity enforced at the database engine level.
  - Mature ecosystem for reporting, OLAP queries, and complex accounting transactions.
  - Lower data redundancy due to strict normalization (3NF/BCNF).
- **Limitations:**
  - Schema evolutions (adding doctor fields, new role configurations) require table locks or complex migration tooling.
  - Impedance mismatch between relational tabular data and JavaScript object hierarchies.
  - High contention on row locks during burst concurrency.

### 2.4 Suitable Real-World Use Cases
- **MongoDB:** Real-time web applications, scheduling systems, content catalogs, dynamic healthcare profiles, microservices, and mobile backends.
- **MySQL:** Legacy enterprise ERP systems, core banking ledgers, accounting systems with deeply normalized data models.

### 2.5 CareSync Project Justification
In **CareSync**, MongoDB was selected for the following architectural reasons:
1. **Atomic Compare-and-Set Slot Claiming:** To completely eliminate double-booking under race conditions, CareSync executes:
   ```javascript
   const slot = await Slot.findOneAndUpdate(
     { _id: slotId, isBooked: false },
     { $set: { isBooked: true } },
     { new: true }
   );
   ```
   MongoDB executes this atomically in a single operation, avoiding lock contention overhead.
2. **Partial Unique Indexing on Active Appointments:**
   CareSync requires that a discrete time slot cannot have two simultaneous active appointments (`CONFIRMED` or `PENDING`). However, if an appointment is `CANCELLED` or `RESCHEDULED`, that slot must be available to be booked again while preserving historical audit logs. In MySQL, enforcing a unique constraint on active statuses while ignoring cancelled records requires triggers or complex generated columns. In MongoDB, CareSync implements:
   ```javascript
   appointmentSchema.index(
     { slotId: 1 },
     { unique: true, partialFilterExpression: { status: { $in: ['PENDING', 'CONFIRMED'] } } }
   );
   ```
3. **Compound Slot Uniqueness:**
   The `Slot` collection enforces uniqueness across `(doctorId, date, startTime)` to prevent redundant availability generation.

---

## 3. Study 3: React 19 vs. Angular

### 3.1 Introduction
- **React (v19):** An open-source declarative, component-driven JavaScript library for building user interfaces, maintained by Meta and a global open-source community. React emphasizes functional components, Hooks (`useState`, `useEffect`, `useCallback`), unidirectional data flow, and an efficient Virtual DOM reconciler.
- **Angular:** A comprehensive, opinionated TypeScript-based application framework developed by Google. Angular ships with a complete "batteries-included" ecosystem, including dependency injection, RxJS reactive streams, two-way data binding, built-in routing, and a dedicated CLI.

### 3.2 Side-by-Side Comparative Matrix

| Evaluation Dimension | React 19 (Vite) | Angular (v18+) |
| :--- | :--- | :--- |
| **Core Architecture** | UI Library focused strictly on the view layer | Comprehensive monolithic MVC / MVVM Framework |
| **Language Paradigm** | JavaScript / TypeScript with JSX (JavaScript XML) | Strict TypeScript with HTML templates and metadata decorators |
| **Data Binding** | Unidirectional data flow (predictable state down, events up) | Two-way data binding (`[(ngModel)]`) and unidirectional signals |
| **DOM Reconciliation** | Virtual DOM diffing with Fiber reconciliation | Incremental DOM with Zone.js (or modern Zoneless Signals) |
| **Tooling & Build Speed** | Lightning-fast build times powered by Vite (ESBuild / Rollup) | Angular CLI with Webpack / esbuild; larger configuration overhead |
| **Bundle Footprint** | Lightweight initial bundle size (~45 KB core runtime) | Heavier framework runtime (~130 KB+ baseline overhead) |
| **State Management** | Native React Hooks, Context API, or lightweight stores (Zustand) | Services with RxJS Observables, NgRx, or modern Signals |
| **Learning Curve** | Gentle; emphasizes standard JavaScript patterns | Steep; requires mastering RxJS, Dependency Injection, and Decorators |

### 3.3 Advantages and Limitations

#### React
- **Advantages:**
  - **Component Composition:** Clean separation of concerns into small, reusable UI units (e.g., `SlotPicker`, `DoctorCard`, `RoleSwitcher`).
  - **Sub-Second Hot Module Replacement (HMR):** Paired with Vite, developer feedback loop is virtually instantaneous.
  - **Flexibility & Freedom:** Allows developers to adopt lightweight custom styling (Vanilla CSS) without framework-imposed styling wrappers.
  - **Unidirectional Predictability:** State transitions are explicit, making debugging appointment selection and role changes straightforward.
- **Limitations:**
  - Requires developers to assemble auxiliary libraries (routing, state management) manually.
  - Improper hook dependency management can result in unnecessary component re-renders.

#### Angular
- **Advantages:**
  - Highly standardized architecture; every Angular project follows identical file and module conventions.
  - Built-in form validation, HTTP client, and enterprise dependency injection container.
  - Strong TypeScript typing throughout the framework core.
- **Limitations:**
  - Excessive boilerplate and ceremony for small to mid-sized applications.
  - Heavy runtime footprint and steeper learning curve for team members.
  - Complex RxJS observable debugging (subscription leaks, marble testing).

### 3.4 Suitable Real-World Use Cases
- **React:** Modern single-page web applications (SPAs), SaaS dashboards, interactive consumer and healthcare portals, mobile applications via React Native.
- **Angular:** Large-scale enterprise intranets, government or banking monoliths with massive distributed engineering teams demanding strict uniformity.

### 3.5 CareSync Project Justification
For **CareSync**, React 19 (scaffolded via Vite) was selected because:
1. **Interactive Multi-Role Experience:** The interface requires instant persona switching between Patient, Doctor, and Admin views without full-page reloads. React's state management seamlessly re-renders only the changed dashboard widgets.
2. **Dynamic Slot Generation Grid:** Patients require an interactive, visual grid of 14-day appointment slots that dynamically update when filters (department, specialty, date) change. React's declarative state model renders this efficiently.
3. **Vanilla CSS Design System:** CareSync utilizes a custom, modern design system featuring glassmorphism, responsive cards, and micro-animations. React allows direct attachment of CSS classes without the CSS encapsulation friction found in Angular Shadow DOM / Emulated encapsulation.
4. **Fast Prototyping and Low Latency:** Vite delivers instant server start and millisecond build times, critical for agile development cycles.

---

## 4. Study 4: JWT-Based Authentication vs. Session-Based Authentication

### 4.1 Introduction
- **JWT (JSON Web Token) Authentication:** A stateless authentication standard (RFC 7519) wherein credentials are exchanged for a digitally signed compact token containing claims (`userId`, `role`, `email`). The token is returned to the client and transmitted on subsequent requests via the `Authorization: Bearer <token>` header. The server verifies token authenticity cryptographically using a private secret without querying a session store.
- **Session-Based Authentication:** A stateful authentication mechanism where upon user login, the server generates a unique session identifier, stores session data in server memory or a centralized cache (such as Redis), and sends the session ID to the client inside an HTTP-only cookie. On every request, the server inspects the cookie and queries its memory/cache to validate the session.

### 4.2 Side-by-Side Comparative Matrix

| Evaluation Dimension | JWT-Based Authentication | Session-Based Authentication |
| :--- | :--- | :--- |
| **Statefulness** | Completely stateless; server retains zero session memory | Stateful; server must maintain active session records |
| **Verification Overhead** | Cryptographic signature verification (`HMAC-SHA256`) in CPU memory | Cache/Database lookup for session record on every single HTTP request |
| **Horizontal Scalability** | Infinite horizontal scaling; any server instance can verify token without shared state | Requires distributed cache (Redis) or sticky sessions on load balancers |
| **Storage Location** | Client memory, `localStorage`, or authorization header | Browser HTTP-Only, Secure cookie |
| **CORS & Decoupled Clients** | Trivially supports decoupled domains and native mobile apps via Bearer header | Requires meticulous CORS configuration (`credentials: true`, `SameSite`, `Domain`) |
| **Revocation Control** | Difficult to instantly revoke before token expiry (requires token blacklist or versioning) | Instantaneous revocation; server simply deletes session from cache |
| **Payload Size** | Larger (100–500 bytes containing payload claims and signature) | Very small (short 32-character random session ID string) |
| **CSRF Vulnerability** | Immune to CSRF when sent via `Authorization` header | Vulnerable to CSRF; requires anti-CSRF tokens |

### 4.3 Advantages and Limitations

#### JWT-Based Authentication
- **Advantages:**
  - **Zero Database Overhead:** User ID and Role claims are embedded directly in the token. Role-based access control (RBAC) middleware checks permissions instantly without a database roundtrip.
  - **Decoupled Architecture Friendly:** Seamless communication between React (running on `localhost:5173`) and Express REST API (running on `localhost:5000`) without cookie-domain synchronization issues.
  - **Mobile and Multi-Client Ready:** The same token format functions identically across React Web, React Native, or third-party automated API integrations.
- **Limitations:**
  - Inherent token invalidation challenge: If a user is compromised, token remains valid until expiration unless a blacklist is maintained.
  - Sensitive information should never be stored unencrypted in the payload (claims are Base64Url encoded, not encrypted).

#### Session-Based Authentication
- **Advantages:**
  - Immediate revocation: Admin can instantly invalidate any user session by flushing the Redis session key.
  - Small cookie footprint transmitted over the wire.
- **Limitations:**
  - Architectural bottleneck: High-traffic applications incur significant Redis/database overhead verifying sessions on every single request.
  - Horizontal scaling complexity: Requires centralized cache infrastructure.
  - Cross-domain cookie sharing issues between modern single-page apps and API subdomains.

### 4.4 Suitable Real-World Use Cases
- **JWT-Based Authentication:** Modern decoupled web applications (React + Node/Express), mobile applications, microservice architectures, single sign-on (SSO) gateways.
- **Session-Based Authentication:** Monolithic server-rendered web applications (traditional Django, Ruby on Rails, Express with EJS/Pug templates) hosted under a single root domain.

### 4.5 CareSync Project Justification
In **CareSync**, JWT-based authentication was selected for the following reasons:
1. **Stateless Role-Based Access Control (RBAC):**
   CareSync defines three distinct user personas: `PATIENT`, `DOCTOR`, and `ADMIN`. The JWT payload contains:
   ```json
   {
     "userId": "67b7f43a9d123e4567890abc",
     "role": "DOCTOR",
     "email": "doctor@healthcare.com"
   }
   ```
   When a request hits protected routes (e.g., doctor availability or admin user toggling), the [auth.js](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/middlewares/auth.js#L26-L35) middleware verifies the signature and validates `req.user.role` in sub-millisecond CPU memory time without triggering a MongoDB lookup.
2. **Seamless Decoupled Frontend Communication:**
   The Vite React client communicates with the Express API across distinct ports. Transmitting the JWT via `Authorization: Bearer <token>` bypasses third-party cookie restrictions and CSRF vulnerabilities entirely.
3. **Instant Demo Switching:**
   For academic evaluation and viva demonstration, the 1-click Quick Demo Switcher instantly issues role-specific tokens, allowing examiners to observe role enforcement instantaneously.

---

## 5. Summary Conclusion & Architectural Synergy

The four technologies evaluated in this study form a cohesive, synergistic architectural stack for the **CareSync Healthcare Appointment System**:

```
+-------------------------------------------------------------+
|                     React 19 Frontend                       |
|   (Interactive Slot Picker, Role Switcher, Responsive UX)   |
+-------------------------------------------------------------+
                              |
                     HTTPS / REST API
           (Bearer JWT Authentication in Headers)
                              |
                              v
+-------------------------------------------------------------+
|                    Express REST API                         |
|   (Strict RBAC Middleware, Helmet Security, Rate Limiter)   |
+-------------------------------------------------------------+
                              |
                    Mongoose ODM Driver
                              |
                              v
+-------------------------------------------------------------+
|                     MongoDB Database                        |
|  (Atomic findOneAndUpdate, Compound & Partial Unique Index) |
+-------------------------------------------------------------+
```

1. **Predictability:** RESTful API combined with JWT Bearer authentication delivers secure, stateless, and observable communication.
2. **Data Integrity:** MongoDB's atomic slot operations and partial unique indexes mathematically prevent double-booking at the database layer.
3. **User Experience:** React 19 provides reactive, component-driven UI with instant state updates for doctor schedules and booking feedback.
4. **Academic Compliance:** All choices directly reflect the project requirements, architecture diagrams, and technical feasibility specifications outlined in the Semester-5 AWD curriculum.
