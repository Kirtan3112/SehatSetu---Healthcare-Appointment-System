const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sendSuccess, sendError } = require('./utils/4631_responseEnvelope');
const { errorHandler, notFoundHandler } = require('./middlewares/4631_errorHandler');
const env = require('./config/4631_env');
const { swaggerUi, swaggerDocument } = require('./config/4631_swagger');

const app = express();

// Security HTTP headers (disable CSP so Swagger UI assets load cleanly)
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key']
}));

// Body parsing with safe size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global Rate Limiter per Technical Feasibility doc Section 7
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // generous max requests per window for dev
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'RATE_LIMIT_EXCEEDED', 'Too many requests from this IP, please try again later.');
  }
});
app.use(globalLimiter);

// Swagger Interactive API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'HAS REST API Docs',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 25px 0 }
    .swagger-ui .info .title { color: #0284c7; font-family: system-ui, -apple-system, sans-serif; }
    .swagger-ui .btn.authorize { background-color: #0284c7; color: #fff; border-color: #0284c7; }
    .swagger-ui .btn.authorize svg { fill: #fff; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    docExpansion: 'list'
  }
}));

// Expose Raw OpenAPI Spec JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    status: 'HEALTHY',
    service: 'Healthcare Appointment System API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }, 200, 'System is healthy and operational');
});

// Root welcome endpoint
app.get('/', (req, res) => {
  return sendSuccess(res, {
    name: 'Healthcare Appointment System API',
    version: '1.0.0',
    documentation: '/api/docs'
  }, 200, 'Welcome to Healthcare Appointment System REST API');
});

// Domain Routes
const authRoutes = require('./routes/4631_authRoutes');
const departmentRoutes = require('./routes/4631_departmentRoutes');
const specializationRoutes = require('./routes/4631_specializationRoutes');
const doctorRoutes = require('./routes/4631_doctorRoutes');
const availabilityRoutes = require('./routes/4631_availabilityRoutes');
const slotRoutes = require('./routes/4631_slotRoutes');
const appointmentRoutes = require('./routes/4631_appointmentRoutes');
const notificationRoutes = require('./routes/4631_notificationRoutes');
const adminRoutes = require('./routes/4631_adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/specializations', specializationRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

module.exports = app;
