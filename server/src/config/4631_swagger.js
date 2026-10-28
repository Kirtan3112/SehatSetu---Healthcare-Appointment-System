const swaggerUi = require('swagger-ui-express');
const env = require('./4631_env');

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Healthcare Appointment System (HAS) REST API',
    version: '1.0.0',
    description: `## Healthcare Appointment System (HAS) - Interactive API Documentation

Welcome to the **HAS REST API Specification & Interactive Testing Playground**.
This platform allows administrators, doctors, and patients to manage healthcare services, schedules, and appointments seamlessly.

---

### 🔑 Authentication & Quick-Start Guide
Many endpoints require a **Bearer JWT token**. Follow these steps to authenticate in Swagger:

1. Expand the **Auth** section below and open **\`POST /api/auth/login\`**.
2. Click **Try it out** and use one of the seeded test credentials:
   - **Administrator**:
     \`\`\`json
     { "email": "admin@healthcare.com", "password": "Admin@123" }
     \`\`\`
   - **Doctor**:
     \`\`\`json
     { "email": "doctor@healthcare.com", "password": "Password@123" }
     \`\`\`
   - **Patient**:
     \`\`\`json
     { "email": "patient@healthcare.com", "password": "Password@123" }
     \`\`\`
3. Click **Execute**. Copy the \`token\` value from the JSON response envelope (\`data.token\`).
4. Scroll to the top of this page (or bottom right of the screen) and click the **Authorize 🔓** button.
5. In the \`Value\` field, paste your token (you can type just the token, or \`Bearer <token>\`) and click **Authorize**.
6. All protected endpoints are now authorized for your session! You can test any protected endpoint by clicking **Try it out** ➡️ **Execute**.
`,
    contact: {
      name: 'HAS Engineering Team',
      email: 'support@healthcare.com'
    }
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from POST /api/auth/login'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Invalid request input' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
          password: { type: 'string', minLength: 6, example: 'SecurePass@123' },
          role: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'], default: 'PATIENT' },
          phone: { type: 'string', example: '+1 555-0144' },
          qualification: { type: 'string', example: 'MD, Pediatrics (Required if role=DOCTOR)' },
          experience: { type: 'number', example: 5 },
          fee: { type: 'number', example: 850 },
          bio: { type: 'string', example: 'Experienced medical practitioner.' },
          departmentId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          specializationId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'patient@healthcare.com' },
          password: { type: 'string', example: 'Password@123' }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'Password@123' },
          newPassword: { type: 'string', minLength: 6, example: 'NewSecurePass@2026' }
        }
      },
      DepartmentRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Ophthalmology' },
          description: { type: 'string', example: 'Eye and vision comprehensive care' }
        }
      },
      SpecializationRequest: {
        type: 'object',
        required: ['name', 'departmentId'],
        properties: {
          name: { type: 'string', example: 'Retinal Surgery' },
          departmentId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          description: { type: 'string', example: 'Micro-surgical interventions for retinal diseases' }
        }
      },
      DoctorUpdateRequest: {
        type: 'object',
        properties: {
          qualification: { type: 'string', example: 'MD, FRCS, Harvard Medical School' },
          experience: { type: 'number', example: 12 },
          fee: { type: 'number', example: 1200 },
          bio: { type: 'string', example: 'Senior specialist in preventative care.' },
          departmentId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          specializationId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' }
        }
      },
      AvailabilityScheduleItem: {
        type: 'object',
        required: ['dayOfWeek', 'startTime', 'endTime'],
        properties: {
          dayOfWeek: { type: 'integer', minimum: 0, maximum: 6, description: '0=Sunday, 1=Monday ... 6=Saturday', example: 1 },
          startTime: { type: 'string', example: '09:00' },
          endTime: { type: 'string', example: '17:00' },
          slotDuration: { type: 'integer', default: 30, example: 30 }
        }
      },
      SetAvailabilityRequest: {
        type: 'object',
        required: ['schedule'],
        properties: {
          schedule: {
            type: 'array',
            items: { $ref: '#/components/schemas/AvailabilityScheduleItem' }
          }
        }
      },
      GenerateSlotsRequest: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date', example: '2026-11-01' },
          endDate: { type: 'string', format: 'date', example: '2026-11-15' }
        }
      },
      LeaveDateRequest: {
        type: 'object',
        required: ['date'],
        properties: {
          date: { type: 'string', format: 'date', example: '2026-11-05' }
        }
      },
      BookingRequest: {
        type: 'object',
        required: ['slotId'],
        properties: {
          slotId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d3' },
          reason: { type: 'string', example: 'Annual cardiovascular checkup & ECG review' },
          notes: { type: 'string', example: 'First consultation' }
        }
      },
      RescheduleRequest: {
        type: 'object',
        required: ['newSlotId'],
        properties: {
          newSlotId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d4' }
        }
      },
      UpdateAppointmentStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            example: 'COMPLETED'
          },
          notes: { type: 'string', example: 'Consultation conducted; prescription issued.' }
        }
      },
      AdminCreateDoctorRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Dr. Gregory House' },
          email: { type: 'string', format: 'email', example: 'house@healthcare.com' },
          password: { type: 'string', minLength: 6, example: 'Password@123' },
          phone: { type: 'string', example: '+1 555-0188' },
          departmentId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          specializationId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
          qualification: { type: 'string', example: 'MD, Nephrology & Diagnostics' },
          experience: { type: 'number', example: 18 },
          fee: { type: 'number', example: 2000 },
          bio: { type: 'string', example: 'Diagnostics specialist.' }
        }
      }
    }
  },
  tags: [
    { name: 'System & Health', description: 'API health checks and system overview' },
    { name: 'Auth', description: 'User registration, login, profile, and password management' },
    { name: 'Departments', description: 'Hospital medical departments catalog' },
    { name: 'Specializations', description: 'Clinical medical specializations linked to departments' },
    { name: 'Doctors', description: 'Doctor search, public directory, credentialing, and administrative approvals' },
    { name: 'Doctor Availability', description: 'Weekly working schedules, leave days, and slot generation' },
    { name: 'Slots', description: 'Search and inspect bookable appointment time slots' },
    { name: 'Appointments', description: 'Booking lifecycle: creation, reschedule, cancellation, and status transitions' },
    { name: 'Notifications', description: 'Real-time alert inbox, unread counts, and automated reminder triggers' },
    { name: 'Admin Management', description: 'System health metrics, user account moderation, doctor onboarding, and audit logs' }
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['System & Health'],
        summary: 'Check API service health',
        description: 'Returns the health status, uptime, and current server timestamp.',
        responses: {
          200: {
            description: 'System is healthy',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } }
          }
        }
      }
    },
    '/': {
      get: {
        tags: ['System & Health'],
        summary: 'Root API welcome endpoint',
        responses: {
          200: {
            description: 'Welcome message and API metadata',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user account',
        description: 'Creates a new account (PATIENT by default, or DOCTOR / ADMIN). Doctors can optionally provide initial clinical credentials.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: {
          201: { description: 'User successfully registered' },
          400: { description: 'Validation error' },
          409: { description: 'Email already registered' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user & obtain JWT token',
        description: 'Authenticates with email and password, returning user details and a Bearer JWT token.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          200: {
            description: 'Login successful. Returns user object and token.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { type: 'object' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid email or password' },
          403: { description: 'Account deactivated' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current profile data' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/auth/profile': {
      put: {
        tags: ['Auth'],
        summary: 'Update current user profile information',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Updated Name' },
                  phone: { type: 'string', example: '+1 555-9988' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change account password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } }
        },
        responses: {
          200: { description: 'Password changed successfully' },
          400: { description: 'Current password incorrect or new password invalid' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/departments': {
      get: {
        tags: ['Departments'],
        summary: 'List all departments',
        description: 'Returns all active medical departments sorted alphabetically.',
        responses: {
          200: { description: 'List of departments' }
        }
      },
      post: {
        tags: ['Departments'],
        summary: 'Create a new department (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DepartmentRequest' } } }
        },
        responses: {
          201: { description: 'Department created' },
          400: { description: 'Department name required' },
          403: { description: 'Forbidden (Admin role required)' },
          409: { description: 'Department already exists' }
        }
      }
    },
    '/api/departments/{id}': {
      get: {
        tags: ['Departments'],
        summary: 'Get department by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Department details' },
          404: { description: 'Department not found' }
        }
      },
      put: {
        tags: ['Departments'],
        summary: 'Update department (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DepartmentRequest' } } }
        },
        responses: {
          200: { description: 'Department updated' },
          404: { description: 'Department not found' }
        }
      },
      delete: {
        tags: ['Departments'],
        summary: 'Delete department (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Department deleted' },
          400: { description: 'Cannot delete department with linked active specializations' },
          404: { description: 'Department not found' }
        }
      }
    },
    '/api/specializations': {
      get: {
        tags: ['Specializations'],
        summary: 'List all specializations',
        description: 'Optionally filter specializations by department ID.',
        parameters: [
          { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by Department ID' }
        ],
        responses: {
          200: { description: 'List of specializations' }
        }
      },
      post: {
        tags: ['Specializations'],
        summary: 'Create a specialization (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SpecializationRequest' } } }
        },
        responses: {
          201: { description: 'Specialization created' },
          400: { description: 'Missing fields' },
          403: { description: 'Forbidden' },
          404: { description: 'Department not found' },
          409: { description: 'Specialization already exists' }
        }
      }
    },
    '/api/specializations/{id}': {
      get: {
        tags: ['Specializations'],
        summary: 'Get specialization by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Specialization details' },
          404: { description: 'Specialization not found' }
        }
      },
      put: {
        tags: ['Specializations'],
        summary: 'Update specialization (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SpecializationRequest' } } }
        },
        responses: {
          200: { description: 'Specialization updated' },
          404: { description: 'Specialization not found' }
        }
      },
      delete: {
        tags: ['Specializations'],
        summary: 'Delete specialization (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Specialization deleted' },
          404: { description: 'Specialization not found' }
        }
      }
    },
    '/api/doctors': {
      get: {
        tags: ['Doctors'],
        summary: 'Search and filter doctors',
        description: 'Search doctors by name, department, specialization, experience, or fee. Authenticated Admins can pass includeUnapproved=true to view pending doctors.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for name, bio, qualification, or department' },
          { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by Department ObjectId' },
          { name: 'specializationId', in: 'query', schema: { type: 'string' }, description: 'Filter by Specialization ObjectId' },
          { name: 'minExperience', in: 'query', schema: { type: 'integer' }, description: 'Minimum years of medical experience' },
          { name: 'maxFee', in: 'query', schema: { type: 'number' }, description: 'Maximum consultation fee limit' },
          { name: 'includeUnapproved', in: 'query', schema: { type: 'boolean' }, description: 'Admins only: include doctors pending approval' }
        ],
        responses: {
          200: { description: 'List of matched doctors' }
        }
      }
    },
    '/api/doctors/{id}': {
      get: {
        tags: ['Doctors'],
        summary: 'Get doctor profile by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Doctor profile details' },
          404: { description: 'Doctor not found' }
        }
      },
      put: {
        tags: ['Doctors'],
        summary: 'Update doctor profile (Doctor Owner or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DoctorUpdateRequest' } } }
        },
        responses: {
          200: { description: 'Doctor profile updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Doctor not found' }
        }
      }
    },
    '/api/doctors/{id}/approve': {
      patch: {
        tags: ['Doctors'],
        summary: 'Approve doctor profile (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Doctor profile approved and activated' },
          403: { description: 'Forbidden' },
          404: { description: 'Doctor not found' }
        }
      }
    },
    '/api/doctors/{id}/reject': {
      patch: {
        tags: ['Doctors'],
        summary: 'Revoke doctor approval (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Doctor approval revoked' },
          403: { description: 'Forbidden' },
          404: { description: 'Doctor not found' }
        }
      }
    },
    '/api/availability/{doctorId}': {
      get: {
        tags: ['Doctor Availability'],
        summary: 'Get doctor weekly availability schedule',
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Weekly availability rules' }
        }
      },
      post: {
        tags: ['Doctor Availability'],
        summary: 'Configure weekly recurring availability (Doctor Owner or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SetAvailabilityRequest' } } }
        },
        responses: {
          200: { description: 'Weekly schedule saved' },
          400: { description: 'Invalid schedule payload' },
          403: { description: 'Forbidden' },
          404: { description: 'Doctor not found' }
        }
      }
    },
    '/api/availability/{doctorId}/generate-slots': {
      post: {
        tags: ['Doctor Availability'],
        summary: 'Generate appointment slots for date range (Doctor Owner or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateSlotsRequest' } } }
        },
        responses: {
          200: { description: 'Slots generated successfully' },
          403: { description: 'Forbidden' },
          404: { description: 'Doctor not found' }
        }
      }
    },
    '/api/availability/{doctorId}/leave': {
      post: {
        tags: ['Doctor Availability'],
        summary: 'Record doctor leave date (Doctor Owner or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveDateRequest' } } }
        },
        responses: {
          200: { description: 'Leave date marked' },
          400: { description: 'Missing leave date' },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/api/slots': {
      get: {
        tags: ['Slots'],
        summary: 'Query available appointment time slots',
        parameters: [
          { name: 'doctorId', in: 'query', schema: { type: 'string' }, description: 'Doctor profile ObjectId' },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Target date (YYYY-MM-DD)' },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Range start (YYYY-MM-DD)' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Range end (YYYY-MM-DD)' },
          { name: 'onlyAvailable', in: 'query', schema: { type: 'boolean', default: true }, description: 'Set false to include already booked slots' }
        ],
        responses: {
          200: { description: 'List of matching slots' }
        }
      }
    },
    '/api/slots/{id}': {
      get: {
        tags: ['Slots'],
        summary: 'Get single slot details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Slot details with doctor information' },
          404: { description: 'Slot not found' }
        }
      }
    },
    '/api/appointments': {
      post: {
        tags: ['Appointments'],
        summary: 'Book an appointment slot (Patient only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingRequest' } } }
        },
        responses: {
          201: { description: 'Appointment successfully booked' },
          400: { description: 'Invalid slot or slot in past' },
          403: { description: 'Only PATIENT can book' },
          409: { description: 'Slot already booked by another user' }
        }
      },
      get: {
        tags: ['Appointments'],
        summary: 'View all appointments in system (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] } },
          { name: 'doctorId', in: 'query', schema: { type: 'string' } },
          { name: 'patientId', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Full system appointment list' },
          403: { description: 'Forbidden (Admin only)' }
        }
      }
    },
    '/api/appointments/my': {
      get: {
        tags: ['Appointments'],
        summary: 'View patient booking history (Patient only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] } }
        ],
        responses: {
          200: { description: 'List of patient appointments' },
          403: { description: 'Patient role required' }
        }
      }
    },
    '/api/appointments/doctor-schedule': {
      get: {
        tags: ['Appointments'],
        summary: 'View doctor upcoming schedule & appointments (Doctor only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: { description: 'List of doctor appointments' },
          403: { description: 'Doctor role required' }
        }
      }
    },
    '/api/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get single appointment details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Appointment details' },
          403: { description: 'Forbidden' },
          404: { description: 'Appointment not found' }
        }
      }
    },
    '/api/appointments/{id}/cancel': {
      patch: {
        tags: ['Appointments'],
        summary: 'Cancel appointment and release slot (Patient, Doctor, or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Appointment cancelled and slot reopened' },
          400: { description: 'Already completed or cancelled' },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/api/appointments/{id}/reschedule': {
      patch: {
        tags: ['Appointments'],
        summary: 'Reschedule appointment to a new slot (Patient or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RescheduleRequest' } } }
        },
        responses: {
          200: { description: 'Appointment rescheduled successfully' },
          400: { description: 'Invalid slot or slot in past' },
          409: { description: 'New slot already booked' }
        }
      }
    },
    '/api/appointments/{id}/status': {
      patch: {
        tags: ['Appointments'],
        summary: 'Update appointment lifecycle status (Doctor or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAppointmentStatusRequest' } } }
        },
        responses: {
          200: { description: 'Status updated' },
          400: { description: 'Invalid status' },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications for current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'unreadOnly', in: 'query', schema: { type: 'boolean', default: false } }
        ],
        responses: {
          200: { description: 'List of notifications' }
        }
      }
    },
    '/api/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get count of unread notifications',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Unread notification count',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        unreadCount: { type: 'integer', example: 3 }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark single notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Notification marked as read' },
          404: { description: 'Notification not found' }
        }
      }
    },
    '/api/notifications/mark-all-read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All notifications marked as read' }
        }
      }
    },
    '/api/notifications/trigger-reminders': {
      post: {
        tags: ['Notifications'],
        summary: 'Trigger scheduled upcoming appointment reminders (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Reminders processed and sent' },
          403: { description: 'Admin role required' }
        }
      }
    },
    '/api/admin/metrics': {
      get: {
        tags: ['Admin Management'],
        summary: 'Get system analytics, KPIs, and dashboard metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Summary metrics of users, catalog, appointments, and recent audit logs' }
        }
      }
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin Management'],
        summary: 'List and filter system users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'] } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of users' }
        }
      }
    },
    '/api/admin/users/{id}/toggle-status': {
      patch: {
        tags: ['Admin Management'],
        summary: 'Activate or deactivate a user account',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User account status toggled' },
          400: { description: 'Self-deactivation prohibited' },
          404: { description: 'User not found' }
        }
      }
    },
    '/api/admin/audit-logs': {
      get: {
        tags: ['Admin Management'],
        summary: 'View immutable system audit logs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'action', in: 'query', schema: { type: 'string' }, description: 'Filter by action name (e.g., BOOK_APPOINTMENT, APPROVE_DOCTOR)' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } }
        ],
        responses: {
          200: { description: 'List of audit records' }
        }
      }
    },
    '/api/admin/doctors': {
      post: {
        tags: ['Admin Management'],
        summary: 'Directly onboard and activate a new doctor',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminCreateDoctorRequest' } } }
        },
        responses: {
          201: { description: 'Doctor account created and auto-approved' },
          400: { description: 'Validation error' },
          409: { description: 'Email already exists' }
        }
      }
    }
  }
};

module.exports = {
  swaggerUi,
  swaggerDocument
};
