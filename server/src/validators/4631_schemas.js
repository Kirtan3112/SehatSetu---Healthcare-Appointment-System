const Joi = require('joi');
const { UserRole } = require('../models/4631_User');
const { AppointmentStatus } = require('../models/4631_Appointment');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const objectIdValidator = Joi.string().pattern(objectIdPattern).messages({
  'string.pattern.base': 'Must be a valid 24-character hexadecimal MongoDB ObjectId'
});

// User Registration Schema
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'any.required': 'Name is required'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN).default(UserRole.PATIENT).messages({
    'any.only': 'Role must be PATIENT, DOCTOR, or ADMIN'
  }),
  phone: Joi.string().trim().allow('').max(20).optional(),
  
  // Optional Doctor credentials fields if role is DOCTOR
  qualification: Joi.string().trim().max(100).optional(),
  experience: Joi.number().min(0).max(70).optional(),
  fee: Joi.number().min(0).max(100000).optional(),
  bio: Joi.string().trim().max(1000).allow('').optional(),
  departmentId: objectIdValidator.optional().allow(null, ''),
  specializationId: objectIdValidator.optional().allow(null, '')
});

// User Login Schema
const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

// Appointment Booking Schema
const bookingSchema = Joi.object({
  slotId: objectIdValidator.required().messages({
    'any.required': 'Slot ID is required to book an appointment'
  }),
  reason: Joi.string().trim().max(500).allow('').optional()
});

// Appointment Status Update Schema
const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(AppointmentStatus)).required().messages({
    'any.only': `Status must be one of: ${Object.values(AppointmentStatus).join(', ')}`,
    'any.required': 'Status is required'
  }),
  notes: Joi.string().trim().max(1000).allow('').optional()
});

// Change Password Schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  })
});

module.exports = {
  objectIdValidator,
  registerSchema,
  loginSchema,
  bookingSchema,
  updateStatusSchema,
  changePasswordSchema
};
