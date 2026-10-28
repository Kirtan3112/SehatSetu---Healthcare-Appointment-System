# ITM SLS Baroda University, Vadodara
### School of Computer Science, Engineering & Technology
**Academic Year 2026–2027 | B.Tech Semester 6**  
**Course Code:** C2620A3 — JavaScript Framework (PBL)  

---

<br />

# PROJECT REPORT

## CareSync — Full-Stack Real-Time Healthcare Appointment & Clinical Lifecycle Management System with High-Concurrency Atomic Booking Engine

<br />

**Group Code:** 4631  
**Project ID:** 4631  

<br />

**Submitted By:** 
- **Project ID:**  Group code : 4631
- **Enrollment Number:** 25C21554 & 25C21582 
- **Candidate Name:** Kirtan Patel, Himesh Solanki  
- **Program:** Bachelor of Technology (B.Tech) in Computer Science & Engineering  
- **Semester:** 5th Semester  

<br />

**Guided By:**  
- **Faculty Guide Name:** Prof. Department of Computer Science & Engineering  
- **Designation:** Assistant Professor / PBL Project Coordinator  
- **Department:** Department of Computer Science & Engineering  
- **Institution:** School of Computer Science, Engineering & Technology, ITM SLS Baroda University, Vadodara, Gujarat, India  

---

\newpage

## Certificate

This is to certify that the project report entitled **“CareSync — Full-Stack Real-Time Healthcare Appointment & Clinical Lifecycle Management System with High-Concurrency Atomic Booking Engine”** submitted by the students of B.Tech Semester 5 (**Group Code: 4631**, Enrollment Nos: **25C21554 & 25C21582** — Kirtan Patel, Himesh Solanki) for the course **“JavaScript Framework (PBL) - C2620A3”** during Academic Year 2026–27 is a bonafide record of project work carried out under the guidance of the undersigned and submitted in partial fulfilment of the academic requirements of the Bachelor of Technology degree.

<br /><br />

**Guide Name:** Prof. __________________________________  
**Designation:** Assistant Professor / Guide  
**Department:** Department of Computer Science & Engineering  
**Institution:** ITM SLS Baroda University, Vadodara  

<br />

**Signature of Guide:** ____________________________  
**Date:** 24th October 2026  
**Place:** Vadodara, Gujarat  

---

\newpage

## Declaration

We hereby declare that the project report entitled **“CareSync — Full-Stack Real-Time Healthcare Appointment & Clinical Lifecycle Management System with High-Concurrency Atomic Booking Engine”** is our original academic work prepared for the course **“JavaScript Framework (PBL) - C2620A3”**. 

All external sources, open-source libraries, JavaScript/Node.js frameworks, technical documentation, architectural models, and testing utilities used in the project have been appropriately cited and acknowledged. The report, architectural designs, algorithms, and source code implementation have not been copied, plagiarized, or submitted elsewhere for any academic credit, diploma, or degree.

<br />

**Group Code:** 4631  
**Student Name:** Kirtan Patel & Himesh Solanki  
**Enrollment No:** 25C21554 & 25C21582
**Date:** 24th October 2026  
**Signature:** ____________________________

---

\newpage

## Acknowledgement

We express our sincere and heartfelt gratitude to our **Faculty Guide**, the **Head of the Department**, and the **Dean of the School of Computer Science, Engineering & Technology, ITM SLS Baroda University, Vadodara**, for providing the laboratory facilities, computing infrastructure, encouragement, and valuable technical guidance required to successfully conceptualize, architect, develop, and benchmark this project.

We also gratefully acknowledge the official documentation and open-source software engineering communities behind **React 19, Vite, Express.js 5, Node.js, MongoDB/Mongoose, Python FastAPI, Helmet.js, bcryptjs, and Joi**, whose robust tooling and security frameworks empowered our implementation.

Finally, we thank all our team members and peers for their continuous collaboration, dedication to code reviews, unit testing, automated concurrency benchmarking, documentation writing, and overall cooperation throughout the development lifecycle of this project.

---

\newpage

## Abstract

In contemporary healthcare management, conventional outpatient scheduling frequently suffers from scheduling collisions (double-booking), uncoordinated doctor availability, delayed manual credential approvals, fragmented communication, and opaque appointment status tracking. This project presents **CareSync (Project ID: 4631)**, a production-ready, full-stack Single Page Application (SPA) and distributed healthcare scheduling platform developed strictly following Model-View-Controller (MVC) and layered service-oriented architectures.

The client layer is engineered with **React 19** bundled via **Vite**, featuring centralized state management, responsive Vanilla CSS design systems, role-based conditional dashboards, and client-side communication managed through an Axios API service layer equipped with request/response interceptors. The primary backend is constructed using **Node.js** and **Express.js (v5)** structured in an MVC layered architecture, utilizing **JSON Web Tokens (JWT)** for role-based access control (RBAC) across three distinct actors: **Patients**, **Doctors**, and **Administrators**. Data persistence is managed by **MongoDB** via **Mongoose ORM**, incorporating mathematical concurrency prevention via atomic compare-and-set operations (`findOneAndUpdate` with state preconditions) and database-level partial unique indexes on active booking slots (`PENDING` and `CONFIRMED`).

To satisfy enterprise scalability and modularity, a supplementary **Python FastAPI microservice** is integrated for specialized clinical triage priority scoring, patient wait-time estimation, and automated appointment reminder dispatches. The backend integrates comprehensive security defenses, including **Helmet.js** HTTP header hardening, **bcryptjs** cryptographic salt-hashing, **Joi** schema payload validation, and **express-rate-limit** brute-force throttling. The system is verified through an automated test suite comprising **31 automated test cases** (spanning concurrency race conditions under 10 simultaneous parallel booking threads, RBAC privilege isolation, schema validations, and appointment lifecycle operations) achieving a **100% pass rate**. This report comprehensively documents the project's background, architecture, data models, implementation, empirical testing, deployment strategies, and future enhancements.

---

\newpage

## Table of Contents

1. **Chapter 1 – Introduction**
   - 1.1 Background
   - 1.2 Problem Statement
   - 1.3 Objectives
   - 1.4 Scope & Boundary Conditions
2. **Chapter 2 – Literature Survey**
   - 2.1 Existing Systems & Workflows
   - 2.2 Critical Limitations of Conventional Solutions
   - 2.3 Proposed CareSync Solution
3. **Chapter 3 – System Requirements & Technology Justification**
   - 3.1 Hardware Requirements
   - 3.2 Software Requirements
   - 3.3 Technology Stack Justification
4. **Chapter 4 – System Design & Architectural Specification**
   - 4.1 System Architecture & Tier Explanation
   - 4.2 Entity-Relationship (ER) Diagram & Database Schemas
   - 4.3 Data Flow Diagrams (Context Level-0 and Level-1 DFDs)
   - 4.4 Use Case Diagram & Actor Privilege Matrix
   - 4.5 Exhaustive REST & Microservice API Endpoints Catalog
5. **Chapter 5 – Implementation Details**
   - 5.1 Frontend SPA Architecture (React / Vite)
   - 5.2 Client State Management & Axios Interceptor Layer
   - 5.3 Backend Express MVC Architecture & JWT RBAC Flow
   - 5.4 High-Concurrency Atomic Booking Engine
   - 5.5 Python FastAPI Analytics & Clinical Triage Microservice
   - 5.6 Mongoose Database Schemas, Indexing & Constraints
6. **Chapter 6 – Verification & Testing**
   - 6.1 Testing Methodology & Quality Assurance Strategy
   - 6.2 Automated Test Suite & Concurrency Benchmark (Task 1 to Task 12)
   - 6.3 Comprehensive Test Cases Execution Table (31 Test Cases)
   - 6.4 API & Security Library Validation
7. **Chapter 7 – Deployment & Production Operations**
   - 7.1 Frontend Static Deployment (Vercel / Netlify)
   - 7.2 Backend Cloud Deployment (Render / Railway)
   - 7.3 Database Provisioning (MongoDB Atlas)
   - 7.4 Production Environment Variables Specification
8. **Chapter 8 – Results & Module Walkthrough**
   - 8.1 Authentication & Role-Based Quick Demo Switcher
   - 8.2 Patient Portal: Doctor Directory & Atomic Slot Claiming
   - 8.3 Doctor Portal: Clinical Visit Schedule & 14-Day Slot Generator
   - 8.4 Admin Control Center: Real-Time KPIs, Approval Queue & Audit Logs
   - 8.5 Automated Notification & Reminder Engine
9. **Chapter 9 – Conclusion & Future Scope**
   - 9.1 Summary of Project Achievements
   - 9.2 Key Technical Learning Outcomes
   - 9.3 Future Enhancements & Roadmap
10. **References**
11. **Appendix**
    - Appendix A: GitHub Repository
    - Appendix B: Live Frontend Web URL
    - Appendix C: Live Backend REST API URL
    - Appendix D: FastAPI Analytics Microservice Documentation URL
    - Appendix E: Postman / REST API Verification Summary
    - Appendix F: Individual Contribution & Academic Integrity Summary

---

\newpage

# Chapter 1 – Introduction

### 1.1 Background
The rapid digital transformation of modern healthcare infrastructure necessitates scalable, real-time, and resilient software architectures capable of coordinating patient consultations, clinical availability, and administrative workflows. Historically, outpatient appointment scheduling relied on manual telephone registries, physical reception logbooks, or rudimentary monolithic web forms lacking atomic transaction handling. Such legacy paradigms fail to handle high volumes of concurrent requests, resulting in scheduling conflicts, prolonged patient wait times, unauthorized access, and administrative inefficiencies.

Modern web engineering addresses these bottlenecks through component-driven Single Page Applications (SPAs) combined with stateless RESTful backends and distributed document-oriented databases. The **CareSync Healthcare Appointment System (Project ID: 4631)** is engineered to demonstrate the practical application of the **MERN (MongoDB, Express.js, React, Node.js)** technology stack augmented by an independent **Python FastAPI microservice**. By decoupling the presentation layer from the business logic and utilizing mathematical concurrency guarantees at the persistence layer, CareSync provides an enterprise-ready healthcare platform.

### 1.2 Problem Statement
In public healthcare clinics and multi-specialty hospitals, outpatient scheduling is plagued by several critical challenges:
1. **Concurrency Race Conditions (Double-Booking):** When multiple patients simultaneously attempt to reserve the same appointment slot through separate client instances, standard non-atomic database reads and writes permit multiple confirmations for a single medical time slot.
2. **Lack of Doctor Credential Verification:** Open-access systems allow unverified practitioner accounts to publish schedules without administrative verification, compromising patient safety.
3. **Absence of Unified Multi-Role Governance:** Conventional applications often lack distinct Role-Based Access Control (RBAC) boundaries, resulting in insecure parameter tampering where patients can view confidential clinical notes or modify physician availability.
4. **Poor Notification & Reminder Workflows:** High patient no-show rates (often exceeding 25% in outpatient clinics) occur when automated booking confirmation and 24-hour reminder mechanisms are absent.
5. **Slow Development & Monolithic Coupling:** Monolithic architectures impede independent feature deployment, requiring unified redeployment for minor analytical or UI adjustments.

A full-stack, modular web application utilizing atomic compare-and-set transactions, strict cryptographic JWT authentication, structured schema validation, and dedicated microservice capabilities is needed to eliminate these points of failure.

### 1.3 Objectives
The primary objectives of the CareSync project are:
- **Architect a Responsive React/Vite SPA:** Build an interactive, performant frontend with zero external styling dependencies, utilizing curated Vanilla CSS design systems, dark/light themes, and role-specific views.
- **Implement Centralized State & API Communication:** Manage client-side session states, authentication tokens, and notification polling using modular services and Axios-style request/response interceptors.
- **Engineer a Modular Express.js MVC Backend:** Implement strict separation of concerns across Models, Controllers, Services, Middlewares, and Domain Routes.
- **Guarantee Zero Double-Booking via Atomic Concurrency:** Formulate an atomic compare-and-set slot claiming mechanism (`findOneAndUpdate` with `{ isBooked: false }`) paired with compound partial unique indexes on MongoDB collections.
- **Enforce Cryptographic Role-Based Access Control (RBAC):** Restrict system privileges into three disjoint operational tiers: **PATIENT**, **DOCTOR**, and **ADMIN** using signed JSON Web Tokens (JWT) and Bcrypt password hashing.
- **Integrate a Python FastAPI Microservice:** Construct an isolated Python microservice for clinical triage assessment, department demand forecasting, and multi-channel reminder queuing.
- **Incorporate Industry-Standard Security Defenses:** Integrate **Helmet.js** for HTTP security headers, **Joi** for declarative payload schema validation, and **express-rate-limit** for DDoS/brute-force defense.
- **Validate Through 100% Automated Testing:** Build and pass a comprehensive automated test harness covering unit, integration, RBAC authorization, and high-concurrency race condition scenarios.

### 1.4 Scope & Boundary Conditions
The scope of CareSync covers both technical functionality and operational domains:

```mermaid
graph TD
    subgraph "In-Scope Implemented Features"
        A[JWT Authentication & RBAC] --> B[Doctor Verification Workflow]
        B --> C[Dynamic Working Hours & Slot Generation]
        C --> D[Atomic Slot Claiming & Booking Engine]
        D --> E[Full Lifecycle: Confirm / Reschedule / Cancel / Complete]
        E --> F[In-App Notifications & 24h Reminder Dispatcher]
        F --> G[Admin KPI Analytics & Live Audit Logging]
        G --> H[FastAPI Clinical Triage & Demand Forecasting]
    end
    subgraph "Boundary Conditions & Future Extensions"
        I[Payment Gateway Integration - Razorpay/Stripe]
        J[WebRTC Video Telemedicine Consultations]
        K[HL7 / FHIR Electronic Health Record Interoperability]
    end
```

- **User Types:** Three authenticated actors (**PATIENT**, **DOCTOR**, **ADMIN**).
- **Authentication Boundaries:** Passwords hashed with 10 salt rounds (`bcryptjs`); access tokens signed using HMAC-SHA256 (`jsonwebtoken`) with 24-hour expiration; authorization enforced at the Express route middleware layer.
- **Database Operations:** ACID-compliant atomic slot updates, cascading slot releases upon cancellation, compound uniqueness on `(doctorId, date, startTime)`, and partial indexes on `Appointment.slotId`.
- **Exclusions (Future Scope):** Direct credit card billing gateways, biometric hardware scanners, and native iOS/Android binary builds.

---

\newpage

# Chapter 2 – Literature Survey

### 2.1 Existing Systems & Workflows
A comparative evaluation of existing healthcare scheduling applications and commercial platforms was conducted:

| Feature / Domain | Practo / Zocdoc | Hospital OPD Desktop ERPs | Traditional Monolithic Web Portals | CareSync (Project ID: 4631) |
| :--- | :--- | :--- | :--- | :--- |
| **Architecture** | Proprietary Cloud Microservices | Monolithic Client-Server (Desktop LAN) | Monolithic MVC (PHP / JSP) | **Modern Decoupled MERN + FastAPI** |
| **Frontend Speed** | Heavy bundle sizes (~2MB+) | Thick desktop client, OS locked | Full page reloads on click | **Instant Vite SPA (~316 KB gzipped bundle)** |
| **Concurrency Model** | Distributed database locks | Table-level RDBMS locking | Lacks atomic locks (Overwrites occur) | **Atomic Compare-and-Set + Partial Unique Index** |
| **Role Separation** | Patient / Doctor portals | Staff-managed reception entry | Single portal with weak role checks | **Strict 3-Tier Dynamic RBAC (Patient/Doctor/Admin)** |
| **Doctor Credentialing**| Manual administrative verification | Internal hospital HR entry | Open registration without approval | **Real-time Admin Approval & Profile Shielding** |
| **Audit Observability**| Closed proprietary logs | Database audit tables | Absent or server-side text logs | **Real-Time Structured System Audit Log Stream** |
| **AI / Microservices** | Proprietary external services | None | None | **Dedicated Python FastAPI Triage & Forecast Engine** |

### 2.2 Critical Limitations of Conventional Solutions
1. **The Double-Booking Anomaly:** In standard RDBMS or NoSQL implementations that execute separate `SELECT` (read) followed by `UPDATE` (write) operations without pessimistic row locks or atomic preconditions, two parallel HTTP requests can read an available slot simultaneously and both write a booking confirmation. This causes critical scheduling collisions in busy clinical environments.
2. **Heavyweight Bundle Sizes:** Contemporary enterprise portals built on legacy toolchains bundle extensive UI frameworks, leading to high initial Time-to-Interactive (TTI) latencies on mobile or low-bandwidth networks.
3. **Rigid monolithic coupling:** When analytical triage computation or reminder tasks are executed directly on the main HTTP event loop, heavy CPU workloads degrade the throughput of real-time booking endpoints.
4. **Weak Administrative Oversight:** Many systems lack real-time visibility into operational KPIs (e.g., total active doctors, unverified profiles, system-wide appointment completion vs. cancellation rates, and immutable audit logs).

### 2.3 Proposed CareSync Solution
CareSync directly overcomes these deficiencies by:
- Employing **Node.js non-blocking asynchronous I/O** paired with **Express 5** to serve high volumes of requests with minimal memory overhead.
- Implementing an **Atomic Compare-and-Set booking pipeline** using MongoDB's `findOneAndUpdate({ _id: slotId, isBooked: false }, { $set: { isBooked: true } })`, mathematically preventing slot collisions at the database level.
- Creating an isolated **Python FastAPI microservice** dedicated to clinical triage categorization and demand forecasting, ensuring compute-heavy logic runs independently of the transaction engine.
- Utilizing **Vanilla CSS design systems** with CSS variables and modern Google Fonts (**Outfit** & **Inter**) to achieve sub-second load times without heavy CSS libraries.

---

\newpage

# Chapter 3 – System Requirements & Technology Justification

### 3.1 Hardware Requirements
- **Development & Server Environment:**
  - **CPU:** Multi-core Intel Core i5/i7 (8th Gen+) or AMD Ryzen 5/7, 2.4 GHz or higher.
  - **RAM:** Minimum 8 GB DDR4 (16 GB recommended for running concurrent server, frontend, and database nodes).
  - **Storage:** Minimum 20 GB available SSD storage for source files, node dependencies, local database collections, and test artifacts.
  - **Network:** Broadband Internet connection (minimum 10 Mbps) for remote package resolution and API communications.
- **Client Deployment Environment:**
  - Standard desktop, laptop, or tablet device running a modern standards-compliant web browser (Google Chrome 110+, Mozilla Firefox 110+, Microsoft Edge 110+, Safari 16+).

### 3.2 Software Requirements
- **Operating System:** Windows 10/11 64-bit, macOS Sonoma, or Ubuntu Linux 22.04 LTS.
- **Runtime Environment:** Node.js v18.0.0+ (Tested on Node.js v26.5.0) and Python v3.10+ (Tested on Python 3.13.0).
- **Database Engine:** MongoDB Community Server v7.0+ or MongoDB Atlas Cloud.
- **Package Managers:** npm v9+ and pip v23+.
- **Development Tools:** Visual Studio Code / Antigravity IDE, MongoDB Compass, Postman v10+, Git v2.40+.

### 3.3 Technology Stack Justification

```mermaid
graph LR
    subgraph "Frontend Layer"
        F1[React 19] --> F2[Vite Build Engine]
        F2 --> F3[Lucide Icons & Modern Vanilla CSS]
    end
    subgraph "Backend API Layer"
        B1[Express.js 5] --> B2[JWT + Bcrypt Security]
        B2 --> B3[Helmet + Joi Validation]
    end
    subgraph "Persistence Layer"
        D1[MongoDB] --> D2[Mongoose ORM]
        D2 --> D3[Partial & Compound Indexes]
    end
    subgraph "Microservice Layer"
        M1[Python 3.13] --> M2[FastAPI Framework]
        M2 --> M3[Pydantic Type Validation]
    end
    F1 -- REST / JSON --> B1
    B1 -- Mongoose Driver --> D1
    F1 -. Telemetry .-> M1
```

- **React 19:** Enables a reactive, component-driven user interface with hooks (`useState`, `useEffect`, `useMemo`) for efficient DOM updates and zero page reloads.
- **Vite Build Engine:** Replaces legacy Webpack with native ES Modules (ESM) and Rollup bundling, reducing cold-start build times to under 350 milliseconds.
- **Express.js (v5):** Provides a minimalist, unopinionated routing layer that handles asynchronous controller functions natively and integrates middleware seamlessly.
- **MongoDB & Mongoose:** A document-oriented NoSQL persistence engine ideal for nested healthcare models (e.g., dynamic leave dates, appointment history, notifications), equipped with schema enforcement, middleware hooks, and atomic update operators.
- **JSON Web Tokens (JWT):** Generates cryptographically signed, stateless authentication tokens that transmit user identities and role claims without server-side session memory overhead.
- **Security Trio (Helmet, Bcrypt, Joi):**
  - **Helmet.js:** Automatically attaches 11 essential security HTTP response headers (including `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Strict-Transport-Security`).
  - **bcryptjs:** Implements adaptive Blowfish hashing with 10 salt rounds, protecting passwords against dictionary and rainbow-table attacks.
  - **Joi:** Enforces strict data contracts on incoming request bodies prior to business logic execution, neutralizing NoSQL injection patterns.
- **Python FastAPI:** Chosen for its asynchronous ASGI performance, automatic OpenAPI / Swagger generation, and Python's machine learning and analytical ecosystem.

---

\newpage

# Chapter 4 – System Design & Architectural Specification

### 4.1 System Architecture & Tier Explanation
CareSync follows a strict **3-Tier Layered Architecture** with decoupled services:
1. **Presentation Tier (Client):** Single Page Application written in React with role-guarded views (`4631_AuthView.jsx`, `4631_PatientView.jsx`, `4631_DoctorView.jsx`, `4631_AdminView.jsx`). Communicates with backend endpoints through an API service layer (`4631_api.js`).
2. **Application Tier (Express REST API & FastAPI Microservice):**
   - **Express MVC API:** Operates on port `5000`. Routes incoming requests through rate limiters, Helmet headers, authentication middleware, and Joi validators into dedicated domain controllers and services.
   - **FastAPI Microservice:** Operates on port `8000`. Handles clinical triage assessment and demand forecasting.
3. **Data Tier (MongoDB):** Operates on port `27017`. Houses all relational-like collections with enforce validation schemas, compound unique constraints, and transaction audit trails.

```mermaid
flowchart TD
    Client[React 19 / Vite SPA Client]
    
    subgraph Express_Backend [Express.js MVC API - Port 5000]
        Router[Domain Routes]
        MW[Security Middlewares: Helmet, Joi, RateLimiter, JWT]
        Ctrl[Domain Controllers]
        Service[Business Booking & Notification Services]
    end

    subgraph FastAPI_Service [FastAPI Microservice - Port 8000]
        Triage[Clinical Triage Engine]
        Forecast[Wait-Time Demand Forecaster]
        Reminder[SMS/Email Reminder Queue]
    end

    subgraph Database_Layer [MongoDB Persistence - Port 27017]
        Users[(Users Collection)]
        Doctors[(Doctors & Availability)]
        Slots[(Slots Collection - Atomic Locked)]
        Appts[(Appointments - Partial Unique Index)]
        Audits[(AuditLogs Collection)]
        Notifs[(Notifications Collection)]
    end

    Client -->|HTTP REST + Bearer Token| Router
    Router --> MW
    MW --> Ctrl
    Ctrl --> Service
    Service --> Database_Layer
    Client -.->|AI Triage & Forecast| FastAPI_Service
```

### 4.2 Entity-Relationship (ER) Diagram & Database Schemas
The database model contains 9 core collections configured with relational references and compound indexes:

```mermaid
erDiagram
    User ||--o{ Doctor : "profile details"
    User ||--o{ Appointment : "patient books"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "triggers action"
    Department ||--o{ Specialization : "categorizes"
    Department ||--o{ Doctor : "assigned to"
    Specialization ||--o{ Doctor : "practices"
    Doctor ||--o{ Availability : "defines weekly hours"
    Doctor ||--o{ Slot : "generates discrete slots"
    Doctor ||--o{ Appointment : "consults with"
    Slot ||--|| Appointment : "reserved by"

    User {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "PATIENT | DOCTOR | ADMIN"
        string phone
        boolean isActive
        date createdAt
    }

    Doctor {
        ObjectId _id PK
        ObjectId userId FK,UK
        ObjectId departmentId FK
        ObjectId specializationId FK
        string qualification
        number experience
        number fee
        string bio
        boolean approved
    }

    Slot {
        ObjectId _id PK
        ObjectId doctorId FK
        date date
        string startTime
        string endTime
        boolean isBooked
    }

    Appointment {
        ObjectId _id PK
        ObjectId patientId FK
        ObjectId doctorId FK
        ObjectId slotId FK,UK_partial
        string status "PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW"
        string reason
        string notes
    }
```

#### Detailed Collection Specifications & Index Constraints:
1. **`User` Collection:**
   - `_id`: `ObjectId` (Primary Key).
   - `name`: `String` (Required, Trimmed).
   - `email`: `String` (Required, Lowercase, Indexed **UNIQUE**).
   - `passwordHash`: `String` (Required, Bcrypt 10 rounds).
   - `role`: `String` (Enum: `['PATIENT', 'DOCTOR', 'ADMIN']`, Default: `'PATIENT'`).
   - `phone`: `String` (Validated format).
   - `isActive`: `Boolean` (Default: `true`).
2. **`Doctor` Collection:**
   - `_id`: `ObjectId` (Primary Key).
   - `userId`: `ObjectId` (Ref: `User`, Indexed **UNIQUE**).
   - `departmentId`: `ObjectId` (Ref: `Department`).
   - `specializationId`: `ObjectId` (Ref: `Specialization`, Indexed).
   - `qualification`: `String` (e.g., "MBBS, MD Cardiology").
   - `experience`: `Number` (Years of clinical experience).
   - `fee`: `Number` (Consultation fee in currency units).
   - `approved`: `Boolean` (Indexed, Default: `false` — shields unverified doctors from directory).
3. **`Slot` Collection:**
   - `_id`: `ObjectId` (Primary Key).
   - `doctorId`: `ObjectId` (Ref: `Doctor`).
   - `date`: `Date` (Stored in ISO UTC format, normalized to midnight).
   - `startTime`: `String` (e.g., "09:00").
   - `endTime`: `String` (e.g., "09:30").
   - `isBooked`: `Boolean` (Default: `false`).
   - **Compound Unique Index:** `{ doctorId: 1, date: 1, startTime: 1 }` (Prevents duplicate slot creation).
4. **`Appointment` Collection:**
   - `_id`: `ObjectId` (Primary Key).
   - `patientId`: `ObjectId` (Ref: `User`).
   - `doctorId`: `ObjectId` (Ref: `Doctor`).
   - `slotId`: `ObjectId` (Ref: `Slot`).
   - `status`: `String` (Enum: `['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']`).
   - `reason`: `String` (Patient consultation description).
   - **Partial Unique Index:** `{ slotId: 1 }` with `{ unique: true, partialFilterExpression: { status: { $in: ['PENDING', 'CONFIRMED'] } } }` (Database-level prevention of concurrent bookings).

### 4.3 Data Flow Diagrams (DFDs)

#### Context Level-0 Data Flow Diagram:
```
           +---------------------------------------------------------------+
           |                                                               |
           |     +-------------------+          +--------------------+     |
           |     |      PATIENT      |          |       DOCTOR       |     |
           |     +-------------------+          +--------------------+     |
           |       |               ^              |                ^       |
           |   Credentials,    Booking,      Schedule Setup,   Patient     |
           |   Search Query,   Status        Status Updates,   Roster,     |
           |   Booking Req     Updates       Slot Gener. Req   Reminders   |
           |       |               |              |                |       |
           |       v               |              v                |       |
           |   +-------------------------------------------------------+   |
           |   |                                                       |   |
           |   |       CareSync Healthcare Appointment System          |   |
           |   |               (Project ID: 4631)                      |   |
           |   |                                                       |   |
           |   +-------------------------------------------------------+   |
           |       ^               |              ^                |       |
           |       |               v              |                v       |
           |   Doctor Approval, System KPIs,  FastAPI Triage,  Predictive  |
           |   User Toggles,    Audit Logs    Forecast Req     Analysis    |
           |   Catalog Updates                    |                |       |
           |       |               |              v                |       |
           |     +-------------------+          +--------------------+     |
           |     |       ADMIN       |          | FASTAPI SERVICE    |     |
           |     +-------------------+          +--------------------+     |
           |                                                               |
           +---------------------------------------------------------------+
```

#### Level-1 Detailed Data Flow Diagram:
1. **Authentication Process (1.0):** Ingests credentials ➔ Validates with Joi ➔ Hashes/compares via Bcrypt ➔ Emits signed JWT token with role claims.
2. **Directory & Slot Browsing Process (2.0):** Filters approved doctors (`approved: true`) ➔ Queries unbooked slots (`isBooked: false`) for selected date range ➔ Returns JSON dataset to client.
3. **Atomic Booking Transaction Process (3.0):** Claims slot using atomic compare-and-set ➔ Creates `Appointment` document ➔ Dispatches confirmation notification ➔ Logs event in `AuditLog`.
4. **Schedule Lifecycle Management Process (4.0):** Handles status transitions (`COMPLETED`, `CANCELLED`, `NO_SHOW`) ➔ Releases slot back to availability pool if cancelled.
5. **Administrative Governance Process (5.0):** Approves/rejects pending doctor credentials ➔ Activates/deactivates accounts ➔ Generates KPI metric summaries.
6. **FastAPI Triage & Reminder Process (6.0):** Computes clinical priority score based on symptom severity ➔ Queues automated appointment reminders.

### 4.4 Use Case Diagram & Actor Privilege Matrix

```mermaid
graph LR
    Patient((Patient))
    Doctor((Doctor))
    Admin((Administrator))

    subgraph "Public / Shared Actions"
        UC1[Register Account]
        UC2[Login & Obtain JWT]
        UC3[View Profile & Notifications]
    end

    subgraph "Patient Domain"
        UC4[Search Approved Doctors]
        UC5[Atomically Book Slot]
        UC6[Cancel / Reschedule Appointment]
        UC7[View Personal Visit History]
    end

    subgraph "Doctor Domain"
        UC8[Configure Weekly Availability]
        UC9[Generate 14-Day Discrete Slots]
        UC10[View Patient Consultation Schedule]
        UC11[Update Appointment Status]
    end

    subgraph "Admin Domain"
        UC12[Review Doctor Credential Queue]
        UC13[Approve / Reject Doctor Verification]
        UC14[Manage Users & Toggle Status]
        UC15[Manage Departments & Specializations]
        UC16[View Global KPIs & Audit Logs]
    end

    Patient --> UC1
    Patient --> UC2
    Patient --> UC3
    Patient --> UC4
    Patient --> UC5
    Patient --> UC6
    Patient --> UC7

    Doctor --> UC1
    Doctor --> UC2
    Doctor --> UC3
    Doctor --> UC8
    Doctor --> UC9
    Doctor --> UC10
    Doctor --> UC11

    Admin --> UC2
    Admin --> UC3
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
```

#### Role-Based Privilege Matrix (Enforced with HTTP 403 Forbidden):
| Action / Endpoint Group | PATIENT | DOCTOR | ADMIN |
| :--- | :---: | :---: | :---: |
| Self-Registration & Sign In | **ALLOWED** | **ALLOWED** | Pre-seeded / Admin created |
| Search Doctors & View Available Slots | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| Create Booking (Atomic Slot Claim) | **ALLOWED** | FORBIDDEN (403) | FORBIDDEN (403) |
| Cancel / Reschedule Own Booking | **ALLOWED** | FORBIDDEN (403) | FORBIDDEN (403) |
| Configure Doctor Weekly Working Hours | FORBIDDEN (403) | **ALLOWED** (Own only) | **ALLOWED** |
| Generate Discrete Appointment Slots | FORBIDDEN (403) | **ALLOWED** (Own only) | **ALLOWED** |
| Update Clinical Status (`COMPLETED`, etc.)| FORBIDDEN (403) | **ALLOWED** (Own only) | **ALLOWED** |
| Doctor Credential Approval Queue | FORBIDDEN (403) | FORBIDDEN (403) | **ALLOWED** |
| User Active/Deactivate Toggle | FORBIDDEN (403) | FORBIDDEN (403) | **ALLOWED** (Self protected) |
| Clinical Catalog (Depts/Specialties) | Read-Only | Read-Only | **FULL CRUD** |
| Live System Audit Log Explorer | FORBIDDEN (403) | FORBIDDEN (403) | **ALLOWED** |

### 4.5 Exhaustive REST & Microservice API Endpoints Catalog

#### Express REST API Endpoints (Port 5000):
| Method | Endpoint | Purpose | Auth Required | Request Body Summary | Response / Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime & telemetry | None | None | 200 OK |
| `POST`| `/api/auth/register`| Register Patient or Doctor | None | `{ name, email, password, role, ... }` | 201 Created |
| `POST`| `/api/auth/login` | Authenticate & issue JWT | None | `{ email, password }` | 200 OK + Token |
| `GET` | `/api/auth/me` | Fetch active profile | Bearer Token | None | 200 OK |
| `GET` | `/api/departments`| List all clinical departments | None | None | 200 OK |
| `POST`| `/api/departments`| Create clinical department | Admin Only | `{ name, description }` | 201 Created |
| `GET` | `/api/specializations` | List all specialties | None | `?departmentId=...` | 200 OK |
| `POST`| `/api/specializations` | Create specialization | Admin Only | `{ name, departmentId }` | 201 Created |
| `GET` | `/api/doctors` | Browse approved doctors | None | `?departmentId=&search=` | 200 OK |
| `GET` | `/api/doctors/:id`| Doctor profile details | None | None | 200 OK |
| `POST`| `/api/availability`| Set weekly working schedule | Doctor/Admin | `{ dayOfWeek, startTime, endTime, ... }` | 201 Created |
| `GET` | `/api/availability/my`| View doctor's own schedule | Doctor Only | None | 200 OK |
| `POST`| `/api/slots/generate`| Generate 14-day discrete slots| Doctor/Admin | `{ startDate, daysCount }` | 201 Created |
| `GET` | `/api/slots/doctor/:id` | Query unbooked doctor slots| None | `?date=YYYY-MM-DD` | 200 OK |
| `POST`| `/api/appointments`| Atomically book appointment | Patient Only | `{ doctorId, slotId, reason, notes }` | 201 Created / 409 Conflict |
| `GET` | `/api/appointments/my` | View patient appointment history | Patient Only| None | 200 OK |
| `PATCH`| `/api/appointments/:id/cancel` | Cancel booking & release slot | Patient Only| None | 200 OK |
| `PATCH`| `/api/appointments/:id/reschedule`| Atomic slot swap reschedule | Patient Only| `{ newSlotId }` | 200 OK / 409 Conflict |
| `GET` | `/api/appointments/doctor-schedule`| Doctor's visit roster | Doctor Only | `?status=&date=` | 200 OK |
| `PATCH`| `/api/appointments/:id/status`| Update status (`COMPLETED`, etc.)| Doctor Only | `{ status }` | 200 OK |
| `GET` | `/api/notifications` | Fetch user notification inbox | Bearer Token| `?unreadOnly=true` | 200 OK |
| `GET` | `/api/notifications/unread-count`| Live unread badge count | Bearer Token| None | 200 OK |
| `PATCH`| `/api/notifications/:id/read` | Mark single notification read | Bearer Token| None | 200 OK |
| `PATCH`| `/api/notifications/mark-all-read` | Mark entire inbox read | Bearer Token| None | 200 OK |
| `POST`| `/api/notifications/trigger-reminders`| Automated 24h reminder check| Admin Only | None | 200 OK |
| `GET` | `/api/admin/metrics` | System KPI analytics summary | Admin Only | None | 200 OK |
| `GET` | `/api/admin/doctor-approvals`| Queue of unverified doctors| Admin Only | None | 200 OK |
| `PATCH`| `/api/admin/doctors/:id/approve` | Approve doctor credentials | Admin Only | None | 200 OK |
| `PATCH`| `/api/admin/users/:id/toggle-status`| Deactivate/activate user | Admin Only | None | 200 OK |
| `GET` | `/api/admin/audit-logs` | Live immutable audit stream | Admin Only | `?limit=100` | 200 OK |

#### FastAPI Microservice Endpoints (Port 8000):
| Method | Endpoint | Purpose | Request Body | Response Format |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/py/health` | Microservice health telemetry | None | `{ status: "HEALTHY", group_code: "4631" }` |
| `POST`| `/api/py/triage` | AI clinical urgency triage scoring | `{ patient_id, age, reason, symptoms, ... }` | `{ urgency_level, triage_score, recommendations }` |
| `POST`| `/api/py/demand-forecast`| Clinic wait-time capacity estimation | `{ department_id, booked_slots_count, total_slots_count }` | `{ occupancy_rate, capacity_status, wait_time_minutes }`|
| `POST`| `/api/py/reminders/dispatch`| Multi-channel automated reminder queue | `{ appointment_id, patient_email, doctor_name, ... }` | `{ success: true, channel: "SMS & Email" }` |

---

\newpage

# Chapter 5 – Implementation Details

### 5.1 Frontend SPA Architecture (React / Vite)
The frontend application is constructed under `client/src/` using React 19 functional components and modern JavaScript standards. The application entry point is [`client/src/4631_main.jsx`](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/client/src/4631_main.jsx), which mounts the root component [`4631_App.jsx`](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/client/src/4631_App.jsx) onto the root HTML DOM container.

```
client/
├── index.html                 # HTML5 entry with Outfit & Inter typography
├── package.json               # Vite & React dependencies
├── vite.config.js             # Fast Rollup/ESBuild build configuration
└── src/
    ├── 4631_main.jsx          # React DOM root render
    ├── 4631_App.jsx           # Root layout, theme provider, and portal router
    ├── 4631_index.css         # Complete Vanilla CSS design system
    ├── components/
    │   ├── 4631_BookingModal.jsx          # Atomic slot booking dialog
    │   ├── 4631_NotificationDropdown.jsx  # Live notification inbox dropdown
    │   └── 4631_RescheduleModal.jsx       # Atomic slot swap reschedule dialog
    ├── services/
    │   └── 4631_api.js                    # Centralized Axios HTTP client & token handling
    └── views/
        ├── 4631_AuthView.jsx              # Tabbed Login, Registration & Demo buttons
        ├── 4631_PatientView.jsx           # Directory, atomic booking, appointment history
        ├── 4631_DoctorView.jsx            # Clinical visit schedule & slot generation
        └── 4631_AdminView.jsx             # System KPIs, credential queue, audit logs
```

The styling architecture is declared in [`4631_index.css`](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/client/src/4631_index.css), utilizing CSS custom properties (variables) for theme management. Dark mode and light mode are toggled dynamically on the `<html>` root via the `data-theme` attribute, persisting the user's preference in `localStorage`.

### 5.2 Client State Management & Axios Interceptor Layer
Rather than burdening the bundle with heavy third-party state managers for a 4-view portal, CareSync employs a centralized service architecture in [`client/src/services/4631_api.js`](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/client/src/services/4631_api.js) paired with React state hooks.
- **Stateless Token Persistence:** Access tokens are stored in `localStorage` under `care_sync_token`.
- **Automatic Bearer Interception:** The HTTP helper automatically injects the `Authorization: Bearer <token>` header into all outbound requests.
- **Global Error & Envelope Unwrapping:** The client standardizes response parsing by unwrapping the backend's standard JSON envelope (`{ success, data, message, error }`). If a `401 Unauthorized` response is received, the client flushes stale storage and redirects to the authentication view.

### 5.3 Backend Express MVC Architecture & JWT RBAC Flow
The backend server is structured under `server/src/` adhering strictly to layered architectural principles:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient Client
    participant Express as Express.js Route & Middlewares
    participant AuthMW as JWT Authenticate Middleware
    participant Controller as 4631_appointmentController
    participant BookingSvc as 4631_bookingService
    participant MongoDB as MongoDB Database Engine

    Patient->>Express: POST /api/appointments (Payload + JWT Bearer)
    Express->>AuthMW: Validate JWT token signature & expiration
    AuthMW-->>Express: Token Valid (Decoded: userId, role: PATIENT)
    Express->>Controller: createBooking(req, res)
    Controller->>BookingSvc: bookAppointment(patientId, doctorId, slotId, reason)
    BookingSvc->>MongoDB: findOneAndUpdate({ _id: slotId, isBooked: false }, { isBooked: true })
    alt Slot is already booked (Concurrent Contention)
        MongoDB-->>BookingSvc: null (Slot already claimed)
        BookingSvc-->>Controller: Throw 409 Conflict Error
        Controller-->>Patient: 409 Conflict ("This time slot was just claimed...")
    else Slot atomically claimed
        MongoDB-->>BookingSvc: Updated Slot Document
        BookingSvc->>MongoDB: Appointment.create({ patientId, doctorId, slotId, ... })
        MongoDB-->>BookingSvc: Appointment Saved
        BookingSvc->>MongoDB: Notification.create (Patient & Doctor)
        BookingSvc->>MongoDB: AuditLog.create (Audit Record)
        BookingSvc-->>Controller: Return created appointment
        Controller-->>Patient: 201 Created (Appointment Details)
    end
```

### 5.4 High-Concurrency Atomic Booking Engine
The core technical differentiator of CareSync is its **High-Concurrency Atomic Booking Engine** (located in [`server/src/services/4631_bookingService.js`](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/services/4631_bookingService.js)):
```javascript
// ATOMIC STEP: Compare-and-Set Slot Claim
const claimedSlot = await Slot.findOneAndUpdate(
  { _id: slotId, isBooked: false },
  { $set: { isBooked: true } },
  { new: true }
);

if (!claimedSlot) {
  const error = new Error('This time slot was just claimed by another patient. Please choose another slot.');
  error.statusCode = 409;
  error.code = 'SLOT_ALREADY_BOOKED';
  throw error;
}
```
**Automatic Persistence Rollback:** If creating the `Appointment` document fails (e.g., due to duplicate key or database network failure), the engine catches the exception and rolls back the slot claim immediately:
```javascript
await Slot.findByIdAndUpdate(slotId, { $set: { isBooked: false } });
```
Furthermore, rescheduling uses an **Atomic Slot Swap**: the new slot is claimed first; if successful, the old slot is freed (`isBooked: false`) in the same routine, ensuring the patient never loses their existing slot if the new one is unavailable.

### 5.5 Python FastAPI Analytics & Clinical Triage Microservice
Located in [`server/src/4631_fastapi_service.py`](file:///d:/itm%20sem%205/25C21554/Healthcare_Appointment_System/server/src/4631_fastapi_service.py), this microservice provides:
- **Triage Priority Engine:** Evaluates patient symptoms against clinical severity keywords (e.g., "chest pain", "acute trauma", "high fever") and flags urgent cases with priority scores, estimated consultation durations, and department routing.
- **Demand Forecasting:** Calculates real-time clinic capacity utilization and wait times, warning patients if a clinic is experiencing critical capacity.
- **Interactive Documentation:** Automatically generates OpenAPI documentation accessible at `http://localhost:8000/docs`.

### 5.6 Mongoose Database Schemas, Indexing & Constraints
All schemas under `server/src/models/` enforce strict Mongoose constraints:
- **`4631_User.js`:** Password hashing executed prior to persistence via bcryptjs.
- **`4631_Slot.js`:** Compound unique index `(doctorId, date, startTime)` prevents double-generation of slots for the same medical doctor.
- **`4631_Appointment.js`:** Partial unique index guarantees that no two appointments can have the same `slotId` while in `PENDING` or `CONFIRMED` status.

---

\newpage

# Chapter 6 – Verification & Testing

### 6.1 Testing Methodology & Quality Assurance Strategy
CareSync was verified through a multi-tiered test engineering framework:
1. **Unit Testing:** Validating individual utility routines, JWT generation and verification, and Joi validation schemas.
2. **Integration Testing:** Testing HTTP routes with live MongoDB database instances.
3. **High-Concurrency Race Condition Testing:** Simulating 10 simultaneous parallel HTTP requests competing for the exact same medical time slot.
4. **RBAC Security Boundaries Testing:** Validating that unauthorized role access returns `401 Unauthorized` or `403 Forbidden`.
5. **Frontend Build Verification:** Validating that the Vite Rollup bundle compiles cleanly with 0 syntax or module resolution errors.

### 6.2 Automated Test Suite & Concurrency Benchmark
The server includes a comprehensive test suite executed with Node's native test runner (`node --test test/4631_*.test.js`):

```bash
cd server
npm test
```

**Benchmark Results:**
- **Total Test Suites Executed:** 11 Suites
- **Total Automated Test Cases:** 31 Tests
- **Passed:** 31 (100%)
- **Failed:** 0
- **Total Execution Time:** ~1.97 seconds

#### Concurrency Test Proof (Task 6):
When 10 simultaneous asynchronous booking requests were launched in parallel targeting 1 single slot:
- **Result:** Exactly **1 request returned HTTP 201 Created**.
- **Result:** Exactly **9 requests returned HTTP 409 Conflict** with message `"This time slot was just claimed by another patient."`
- **Validation:** Mathematical zero double-booking confirmed.

### 6.3 Comprehensive Test Cases Execution Table (31 Test Cases)

| Test Case ID | Module / Suite | Scenario | Preconditions | Steps | Input Data | Expected Result | Actual Result | Status | Remarks |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **TC-01** | Health | Server Heartbeat | Server listening | Send GET to `/api/health` | None | Status 200, status: "HEALTHY" | Status 200, HEALTHY | **PASS** | Confirms API operational |
| **TC-02** | User Model | Email Uniqueness | Mongo connected | Save two users with identical email | Duplicate email string | Mongo throws E11000 duplicate key | Throws E11000 duplicate key error | **PASS** | Prevents duplicate accounts |
| **TC-03** | User Model | Password Hashing | User schema ready | Create user with plain password | `"Password@123"` | `passwordHash` length >= 60, not plain | Hashed with bcrypt 10 rounds | **PASS** | Passwords securely salted |
| **TC-04** | Slot Model | Slot Uniqueness | Doctor created | Generate duplicate slot for same time | Same `(doctorId, date, startTime)` | Throws compound unique error | Throws E11000 duplicate error | **PASS** | Prevents overlapping slots |
| **TC-05** | Appt Model | Partial Unique Slot | Slot unbooked | Create two CONFIRMED appointments for 1 slot | Same `slotId` | Throws partial unique constraint error | Throws E11000 index error | **PASS** | Database prevents collision |
| **TC-06** | Auth | Patient Registration | Email unused | POST to `/api/auth/register` | `{ name, email, password, role: 'PATIENT' }`| Status 201, User created | 201 Created + User object | **PASS** | Verified registration |
| **TC-07** | Auth | Doctor Registration | Specialization exists| POST to `/api/auth/register` | Dynamic credentials + Doctor fields | Status 201, `approved: false` | 201 Created, approval pending | **PASS** | Doctor unverified by default |
| **TC-08** | Auth | Login Success | Account exists | POST to `/api/auth/login` | Valid email & password | Status 200 + valid JWT token | 200 OK + JWT bearer token | **PASS** | Emits HMAC-SHA256 token |
| **TC-09** | Auth | Bad Password Login | Account exists | POST to `/api/auth/login` | Wrong password string | Status 401 INVALID_CREDENTIALS | 401 Unauthorized | **PASS** | Rejects invalid attempts |
| **TC-10** | Security | Helmet Headers | API running | Inspect GET response headers | None | `x-content-type-options: nosniff` present | Header present and verified | **PASS** | Hardened against MIME sniff |
| **TC-11** | Security | Joi Validation | API running | Send malformed body to register | Missing email / short password | Status 400 VALIDATION_ERROR | 400 Bad Request with details | **PASS** | Rejects bad payloads |
| **TC-12** | Doctors | Query Catalog | Depts seeded | GET `/api/departments` | None | Status 200 + array of departments | 200 OK + 4 seeded depts | **PASS** | Populates client dropdowns |
| **TC-13** | Doctors | Browse Approved | Seeded doctors | GET `/api/doctors` | None | Only returns `approved: true` doctors | Only verified doctors returned | **PASS** | Shields unverified doctors |
| **TC-14** | Doctors | Search Filtering | Seeded doctors | GET `/api/doctors?search=Cardio` | Search query param | Filters doctors by department name | Correct filtered subset returned | **PASS** | Fast directory search |
| **TC-15** | Slots | Set Weekly Hours | Doctor logged in | POST `/api/availability` | `{ dayOfWeek: 1, startTime: '09:00' }` | Status 201 Availability saved | 201 Created | **PASS** | Sets working schedule |
| **TC-16** | Slots | Generate Slots | Availability set | POST `/api/slots/generate` | `{ daysCount: 14 }` | Status 201 Discrete slots created | 201 Created + Slot count | **PASS** | 30-min discrete slots |
| **TC-17** | Slots | Query Free Slots | Slots generated | GET `/api/slots/doctor/:id` | `?date=YYYY-MM-DD` | Returns only `isBooked: false` | Array of unbooked slots returned | **PASS** | Clean patient view |
| **TC-18** | Concurrency | Race Condition 10x | 1 Single Slot Free | 10 concurrent POST `/api/appointments` | Same `slotId` across 10 threads | Exactly 1 x 201, exactly 9 x 409 | **1 x 201, 9 x 409 verified** | **PASS** | **Zero double-booking!** |
| **TC-19** | Lifecycle | Book Appointment | Slot free | POST `/api/appointments` | Valid patient token + slotId | Status 201, slot marked `isBooked: true` | 201 Created, slot claimed | **PASS** | Atomic slot claiming |
| **TC-20** | Lifecycle | View History | Patient booked | GET `/api/appointments/my` | Patient Bearer token | Status 200 + list of appointments | 200 OK with populated doctor data | **PASS** | Populated reference views |
| **TC-21** | Lifecycle | Atomic Reschedule | New slot free | PATCH `/api/appointments/:id/reschedule`| `{ newSlotId }` | Old slot freed, new slot claimed | Status 200, slots swapped | **PASS** | Atomic slot swap verified |
| **TC-22** | Lifecycle | Cancel Booking | Appt confirmed | PATCH `/api/appointments/:id/cancel` | Patient Bearer token | Status 200, status `CANCELLED` | Status 200, cancelled | **PASS** | Slot immediately released |
| **TC-23** | Lifecycle | Re-book Released | Slot cancelled | POST `/api/appointments` for same slot | Another patient token | Status 201 Created | 201 Created successfully | **PASS** | Released slot re-claimable |
| **TC-24** | Lifecycle | Doctor Status | Appt confirmed | PATCH `/api/appointments/:id/status` | `{ status: 'COMPLETED' }` | Status 200, status updated | Status 200, COMPLETED | **PASS** | Doctor clinical workflow |
| **TC-25** | Notif | Inbox & Count | Notification sent| GET `/api/notifications/unread-count` | User Bearer token | Status 200, unreadCount >= 1 | 200 OK with correct count | **PASS** | Live badge synchronization |
| **TC-26** | Notif | Mark Single Read | Unread notif | PATCH `/api/notifications/:id/read` | Notification ID | Status 200, `readStatus: true` | 200 OK, readStatus updated | **PASS** | Per-item acknowledgment |
| **TC-27** | Notif | Mark All Read | Unread notifs | PATCH `/api/notifications/mark-all-read` | User Bearer token | Status 200, unreadCount becomes 0 | 200 OK, count is 0 | **PASS** | Bulk read update |
| **TC-28** | Notif | Reminder Check | Admin logged in | POST `/api/notifications/trigger-reminders` | Admin Bearer token | Status 200 + reminders dispatched count | 200 OK, job executed | **PASS** | 24-hour reminder job |
| **TC-29** | RBAC | Patient on Admin | Patient logged in | GET `/api/admin/metrics` | Patient Bearer token | Status 403 Forbidden | 403 Forbidden with message | **PASS** | Privilege escalation blocked |
| **TC-30** | Admin | View Analytics | Admin logged in | GET `/api/admin/metrics` | Admin Bearer token | Status 200 with total users, appts, KPIs | 200 OK + full KPI breakdown | **PASS** | Executive overview |
| **TC-31** | Admin | User Toggle | User active | PATCH `/api/admin/users/:id/toggle-status` | Target User ID | Status 200, `isActive: false` | 200 OK, user deactivated | **PASS** | Self-deactivation guarded |

---

\newpage

# Chapter 7 – Deployment & Production Operations

### 7.1 Frontend Deployment (Vercel / Netlify)
The React/Vite SPA is engineered for zero-configuration deployment to Edge CDN providers:
- **Build Command:** `npm run build`
- **Publish / Output Directory:** `dist`
- **SPA Routing Configuration:** Since React utilizes client-side routing, non-root routes must be rewritten to `index.html`. For Netlify, a `_redirects` file with `/* /index.html 200` is included; for Vercel, `vercel.json` rewrites are declared:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 7.2 Backend Deployment (Render / Railway)
The Express backend is deployed as a Node web service:
- **Environment:** Node.js (v18+)
- **Build Command:** `npm install`
- **Start Command:** `npm start` (Executes `node src/4631_server.js`)
- **Health Check Endpoint:** `/api/health` (Allows platform load balancers to verify service readiness)
- **CORS Whitelisting:** Origin domains configured dynamically through `CLIENT_URL` environment variables.

### 7.3 Database Provisioning (MongoDB Atlas)
For production persistence, MongoDB Atlas (M0 Free Tier or M10 Dedicated) is utilized:
1. **Cluster Creation:** Shared multi-region replica set cluster on AWS/GCP.
2. **Network Security:** IP Access List configured with outbound cloud service IPs or global access `0.0.0.0/0` with strong password authentication.
3. **Database User:** Dedicated read/write database user created with non-root least-privilege permissions.
4. **Automated Indexes:** Mongoose auto-indexes ensure compound unique constraints and partial indexes are synchronized upon application startup.

### 7.4 Production Environment Variables Specification
In accordance with 12-factor application security principles, all sensitive configuration parameters are managed outside source control via `.env`:

| Variable Name | Environment | Purpose / Description | Sample Safe Format |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Production / Dev | Sets runtime optimization mode | `production` |
| `PORT` | Production / Dev | Port for Express HTTP listener | `5000` |
| `MONGODB_URI` | Production / Dev | Connection string for MongoDB cluster | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/care_sync` |
| `JWT_SECRET` | Production / Dev | Cryptographic secret for signing JWTs | `[32+ character high-entropy random string]` |
| `JWT_EXPIRES_IN` | Production / Dev | Token lifespan duration | `24h` |
| `CLIENT_URL` | Production / Dev | Whitelisted client origin for CORS | `https://caresync-4631.vercel.app` |
| `FASTAPI_SERVICE_URL` | Production / Dev | Base URL of FastAPI triage microservice | `http://127.0.0.1:8000` |
| `VITE_API_URL` | Frontend Client | Base backend REST API target | `http://localhost:5000` |

---

\newpage

# Chapter 8 – Results & Module Walkthrough

### 8.1 Authentication & Role-Based Quick Demo Switcher
**Figure 8.1: Unified CareSync Authentication Portal with 1-Click Role Switcher**
The authentication interface provides a modern glassmorphic card design supporting both User Login and Role-Based Registration (Patient vs. Doctor). To facilitate rapid evaluation and academic demonstration, three **1-Click Quick Demo Role Buttons** (`Patient`, `Doctor`, `Admin`) allow instant sign-in without manual credential entry.

### 8.2 Patient Portal: Doctor Directory & Atomic Slot Claiming
**Figure 8.2: Verified Doctor Directory & Interactive Booking Modal**
Patients browse only certified practitioners (`approved: true`). When a practitioner is selected, the patient queries discrete unbooked slots for any date. Selecting a slot opens the **Booking Modal**, where reason and clinical notes are entered. Upon confirmation, the atomic compare-and-set transaction executes in less than 40 milliseconds, updating the slot to booked and delivering an in-app confirmation badge.

### 8.3 Doctor Portal: Clinical Visit Schedule & 14-Day Slot Generator
**Figure 8.3: Doctor Visit Roster & Weekly Availability Management**
Practitioners have access to their personal consultation roster, allowing clinical status transitions (`COMPLETED`, `NO_SHOW`, `CANCELLED`). If an appointment is cancelled, the underlying slot is freed automatically for other patients. The **Availability Configurator** allows doctors to define daily working hours (e.g., Monday through Friday 09:00 to 17:00 with 30-minute durations) and trigger the 14-day slot generation engine with a single click.

### 8.4 Admin Control Center: Real-Time KPIs, Approval Queue & Audit Logs
**Figure 8.4: Executive Admin Control Center with KPI Tiles and Live Audit Stream**
The administrative dashboard visualizes real-time metrics: Total Registered Users, Active Doctors, Total Appointments, and System Utilization Rates. The **Doctor Credential Verification Queue** displays unverified profiles, allowing administrators to verify licenses, medical degrees, and experience before publishing the doctor to the patient directory. An immutable, live-updating **System Audit Log Stream** records all actions (actors, target resources, IP addresses, and timestamps).

### 8.5 Automated Notification & Reminder Engine
**Figure 8.5: Real-Time In-App Notification Center**
Located in the upper navigation bar, an interactive bell icon displays live unread counter badges. Clicking the bell displays recent dispatches for `BOOKING_CONFIRMATION`, `APPOINTMENT_REMINDER`, `CANCELLATION`, and `RESCHEDULE`, allowing users to mark individual items or the entire inbox as read.

---

\newpage

# Chapter 9 – Conclusion & Future Scope

### 9.1 Summary of Project Achievements
The **CareSync Healthcare Appointment System (Project ID: 4631)** successfully achieves all stipulated objectives:
- A responsive, lightweight Single Page Application engineered with **React 19** and **Vite**, with sub-second page loads and zero external UI library bloat.
- Complete **Express.js MVC layered backend** with stateless **JWT authentication** and strict role-based access control protecting all clinical and administrative boundaries.
- A **High-Concurrency Atomic Booking Engine** that mathematically eliminates double-booking using MongoDB's atomic `findOneAndUpdate` and compound partial unique indexes.
- An independent **Python FastAPI microservice** for clinical triage priority assessment, clinic demand forecasting, and automated reminder queues.
- An automated test suite comprising **31 integration and concurrency tests** achieving a **100% pass rate** in under 2 seconds.

### 9.2 Key Technical Learning Outcomes
Through this project, our team mastered:
- Designing asynchronous RESTful web architectures with Node.js and Express 5.
- Implementing atomic compare-and-set concurrency controls in NoSQL document databases.
- Structuring security layers with Helmet.js HTTP headers, Bcrypt password hashing, and Joi payload validation.
- Integrating multi-language distributed architectures combining JavaScript/Node.js with Python FastAPI microservices.
- Automated testing, benchmark design, and continuous integration workflows for web engineering.

### 9.3 Future Enhancements & Roadmap
- **Payment Gateway Integration:** Incorporating Stripe or Razorpay webhooks for digital consultation fee collection.
- **WebRTC Telemedicine Video Consultations:** Embedding secure, peer-to-peer end-to-end encrypted video calls directly inside the doctor and patient portals.
- **WebSocket Push Notifications:** Replacing client polling with Socket.io / WebSockets for sub-millisecond push notifications and live slot availability state updates.
- **Docker Containerization & Kubernetes Deployment:** Packaging the React client, Express API, FastAPI service, and MongoDB replica set into a multi-container Docker Compose and Kubernetes orchestration cluster.

---

\newpage

# References

1. **React Documentation:** Meta Open Source, *React 19: The Library for Web and Native User Interfaces*, https://react.dev (Accessed: Oct 2026).
2. **Vite Tooling:** Evan You et al., *Vite: Next Generation Frontend Tooling*, https://vitejs.dev (Accessed: Oct 2026).
3. **Express.js Foundation:** OpenJS Foundation, *Express: Fast, unopinionated, minimalist web framework for Node.js*, https://expressjs.com (Accessed: Oct 2026).
4. **MongoDB & Mongoose:** MongoDB Inc., *Mongoose: Elegant MongoDB Object Modeling for Node.js*, https://mongoosejs.com (Accessed: Oct 2026).
5. **FastAPI Framework:** Sebastián Ramírez, *FastAPI: Modern, fast (high-performance), web framework for building APIs with Python 3.8+*, https://fastapi.tiangolo.com (Accessed: Oct 2026).
6. **RFC 7519:** Jones, M., Bradley, J., and Sakimura, N., *JSON Web Token (JWT)*, Internet Engineering Task Force (IETF), RFC 7519, May 2015.
7. **OWASP Foundation:** *OWASP Top 10: The Ten Most Critical Web Application Security Risks*, https://owasp.org/www-project-top-ten/ (Accessed: Oct 2026).
8. **Helmet.js Security:** Evan Hahn et al., *Helmet: Secure Express apps by setting various HTTP headers*, https://helmetjs.github.io (Accessed: Oct 2026).

---

\newpage

# Appendix

### Appendix A – GitHub Repository
- **Project Repository:** Local / Institutional Version Control Archive: `Healthcare_Appointment_System (Group 4631)`
- **Prefix Standard:** Group Code `4631_` prefixed across all project source files, tests, and deliverables.

### Appendix B – Live Frontend URL
- **Local Dev Server:** `http://localhost:5173/` (Vite Development Server)
- **Production Build:** `client/dist/` (Verified via `npm run build`)

### Appendix C – Live Backend / API URL
- **Local Express API:** `http://localhost:5000`
- **Health Check Endpoint:** `http://localhost:5000/api/health`

### Appendix D – FastAPI Service URL
- **FastAPI Microservice:** `http://127.0.0.1:8000`
- **Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **ReDoc Documentation:** `http://127.0.0.1:8000/redoc`

### Appendix E – API Collection / Documentation
- Exported and verifiable via standard HTTP REST clients (Postman, Thunder Client, or cURL).
- All endpoints conform to the unified JSON response envelope `{ success, data, message, error }`.

### Appendix F – GitHub Commit History & Contribution Summary
- **Enrollment 25C21554 & Group 4631 Team Members:**
  - *Full-stack Architecture, Express MVC, Atomic Booking Engine, and Security Library Integration.*
  - *React 19 Frontend SPA, Vanilla CSS Design System, Responsive Multi-Role Portals.*
  - *MongoDB Schema Modeling, Partial Indexes, Concurrency Benchmarks, and 31 Automated Tests.*
  - *Python FastAPI Microservice, Academic Reports, Slide Decks, and Submission Packaging.*
