# SehatSetu (सेहत सेतु) — Healthcare Appointment System (HAS)

> **"A bridge to health — connecting patients and doctors seamlessly."**

![SehatSetu Logo](client/public/sehatsetu_logo.png)

A high-performance, full-stack MERN Healthcare Appointment System built strictly in accordance with architectural specifications, UML diagrams (Class, Sequence, Activity, Use Case), Technical Feasibility analysis, and the Agile process model.

---

## 🌟 Key Features & Architectural Compliance

1. **High-Concurrency Atomic Booking Engine (Sprint 3 & Technical Feasibility Section 6-7)**:
   - Atomic compare-and-set slot claim (`findOneAndUpdate({ _id: slotId, isBooked: false }, { $set: { isBooked: true } })`).
   - Partial unique index on `Appointment.slotId` for active bookings (`CONFIRMED`, `PENDING`), mathematically preventing double-booking at the database engine level.
   - Idempotent request handling and automatic rollback if persistence fails.
   - Stress-tested under simultaneous concurrent contention (10 simultaneous requests for 1 slot -> exactly 1 succeeds with 201 Created, 9 rejected with 409 Conflict).

2. **Full Appointment Lifecycle (Sprint 4 & Activity/Sequence Diagrams)**:
   - **Cancellation**: Safely cancels appointment and immediately releases the slot (`isBooked: false`) back into the available pool for other patients.
   - **Rescheduling**: Atomic slot swap (claims new slot, releases old slot in one operation).
   - **Clinical Status Transitions**: `PENDING` ➔ `CONFIRMED` ➔ `COMPLETED` / `CANCELLED` / `NO_SHOW`.

3. **Multi-Role Portals & Strict RBAC Privileges (Sprint 1, 5 & 6)**:
   - **Dedicated Login & Registration Experience**:
     - Seamless role-based registration: choose between **Patient** and **Doctor**.
     - Dynamic Doctor credentials form (Clinical department, specialization, medical degrees, experience years, fee, and clinical bio).
     - Instant 1-click demo role buttons (`Patient`, `Doctor`, `Admin`) for rapid evaluation and paired testing.
     - Role-based automatic redirect immediately upon sign-in or account registration.
   - **Patient Portal**:
     - *Privileges*: Search approved doctors, filter by specialty/department, view discrete unbooked slots, atomically book appointments with instant conflict rejection, view appointment history, cancel appointments (slot auto-released), reschedule (atomic slot swap).
     - *Access Control*: Strictly prohibited from doctor availability setup, doctor schedule, and admin control center (enforced with 403 Forbidden).
   - **Doctor Portal**:
     - *Privileges*: View doctor's own patient visit schedule, update clinical appointment status (`COMPLETED`, `NO_SHOW`, `CANCELLED`), configure weekly working hours and slot duration, generate 14-day discrete appointment slots.
     - *Approval Enforcement*: Displays real-time **Verification Pending Banner** when `approved: false`. Profiles are hidden from patient directory until Admin verifies credentials.
     - *Access Control*: Strictly prohibited from patient booking endpoints, user management, and other doctors' schedules.
   - **Admin Control Center**:
     - *Privileges*: Global KPI metrics, Doctor credential approval/rejection queue, User management (active/deactivate toggle with self-deactivation protection), Clinical Catalog (departments & specializations), live system audit log explorer.

4. **Notifications & Reminders (Sprint 5 & Sequence Diagram)**:
   - In-app notification inbox with live unread counter badge.
   - Automated 24-hour appointment reminder scheduler.
   - Dispatches for `BOOKING_CONFIRMATION`, `APPOINTMENT_REMINDER`, `CANCELLATION`, and `RESCHEDULE`.

5. **Design System & Aesthetics**:
   - Built with **Vanilla CSS** for maximum precision, performance, and flexibility.
   - Typography: Google Fonts **Outfit** (headings) & **Inter** (body).
   - Curated healthcare teal & ocean palette, glassmorphism, responsive cards, micro-animations, zero placeholders.

---

## 🗄️ Database Models & Compound Unique Indexes

| Model | Key Fields | Critical Constraints / Indexes |
| :--- | :--- | :--- |
| **`User`** | `name`, `email`, `passwordHash`, `role` (`PATIENT`/`DOCTOR`/`ADMIN`), `phone`, `isActive` | Unique index on `email` |
| **`Department`** | `name`, `description` | Unique index on `name` |
| **`Specialization`** | `name`, `departmentId`, `description` | Unique index on `name`, index on `departmentId` |
| **`Doctor`** | `userId`, `departmentId`, `specializationId`, `qualification`, `experience`, `fee`, `bio`, `approved` | Unique on `userId`, indexes on `specializationId`, `approved` |
| **`Availability`** | `doctorId`, `dayOfWeek` (0-6), `startTime`, `endTime`, `slotDuration`, `leaveDates` | Compound unique index `(doctorId, dayOfWeek)` |
| **`Slot`** | `doctorId`, `date`, `startTime`, `endTime`, `isBooked` | **Compound unique index `(doctorId, date, startTime)`** |
| **`Appointment`** | `patientId`, `doctorId`, `slotId`, `status`, `reason`, `notes` | **Partial unique index on `slotId`** where status in `['PENDING', 'CONFIRMED']` |
| **`Notification`** | `userId`, `appointmentId`, `type`, `message`, `readStatus`, `sentAt` | Index on `(userId, readStatus)` |
| **`AuditLog`** | `actor`, `action`, `target`, `details`, `ipAddress`, `timestamp` | Index on `(actor, timestamp)` |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended; tested on v26)
- MongoDB instance running locally on `localhost:27017`

### 1. Database Seeding
Populate initial admin, departments, specializations, verified doctors, weekly schedules, slots, and demo patients:
```bash
cd server
node src/scripts/4631_seed.js
```

### 2. Run Backend REST API
```bash
cd server
npm run dev
# or: npm start
```
- **Backend Port**: `http://localhost:5000`
- **Swagger Interactive API Documentation**: `http://localhost:5000/api/docs` *(automatically opens in your default browser on startup!)*
- **OpenAPI 3.0 Raw JSON Spec**: `http://localhost:5000/api/docs.json`
- **Health check**: `http://localhost:5000/api/health`

### 3. Run Frontend Web App
```bash
cd client
npm run dev
# Frontend runs on http://127.0.0.1:5173/ (entry point: src/4631_main.jsx)
```

### 4. Run Automated Test Suite
To execute all 31 integration and concurrency tests:
```bash
cd server
npm test
# Executes node --test test/4631_*.test.js
```

---

## 🔑 Default Credentials for Demo & Evaluation

| Role | Email | Password | Pre-configured State |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@healthcare.com` | `Admin@123` | Full dashboard access, doctor approvals, audit logs |
| **Doctor** | `doctor@healthcare.com` | `Password@123` | Dr. Sarah Jenkins (Cardiology), schedule & slot generator |
| **Patient** | `patient@healthcare.com` | `Password@123` | John Doe, booking history & interactive slot picker |

*(Tip: Use the top Quick Demo Switcher bar in the web app to switch personas with 1 click!)*
