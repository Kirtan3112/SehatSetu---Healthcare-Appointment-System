const express = require('express');
const router = express.Router();
const {
  createBooking,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus
} = require('../controllers/4631_appointmentController');
const { authenticate, authorizeRoles } = require('../middlewares/4631_auth');
const { validate } = require('../middlewares/4631_validate');
const { bookingSchema, updateStatusSchema } = require('../validators/4631_schemas');
const { UserRole } = require('../models/4631_User');

// Patient routes
router.post('/', authenticate, authorizeRoles(UserRole.PATIENT), validate(bookingSchema), createBooking);
router.get('/my', authenticate, authorizeRoles(UserRole.PATIENT), getPatientAppointments);

// Doctor schedule route
router.get('/doctor-schedule', authenticate, authorizeRoles(UserRole.DOCTOR), getDoctorAppointments);

// Admin monitoring route
router.get('/', authenticate, authorizeRoles(UserRole.ADMIN), getAllAppointments);

// Single appointment view
router.get('/:id', authenticate, getAppointmentById);

// Lifecycle transitions
router.patch('/:id/cancel', authenticate, cancelAppointment);
router.patch('/:id/reschedule', authenticate, rescheduleAppointment);
router.patch('/:id/status', authenticate, validate(updateStatusSchema), updateAppointmentStatus);

module.exports = router;
