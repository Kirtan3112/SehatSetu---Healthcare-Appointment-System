const express = require('express');
const router = express.Router();
const {
  searchDoctors,
  getDoctorById,
  updateDoctorProfile,
  approveDoctor,
  rejectDoctor
} = require('../controllers/4631_doctorController');
const { authenticate, authorizeRoles } = require('../middlewares/4631_auth');
const { UserRole } = require('../models/4631_User');

// Optional auth on search so admins can see unapproved if requested
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

// Public / Patient routes
router.get('/', optionalAuth, searchDoctors);
router.get('/:id', getDoctorById);

// Doctor or Admin profile update
router.put('/:id', authenticate, updateDoctorProfile);

// Admin-only approval routes
router.patch('/:id/approve', authenticate, authorizeRoles(UserRole.ADMIN), approveDoctor);
router.patch('/:id/reject', authenticate, authorizeRoles(UserRole.ADMIN), rejectDoctor);

module.exports = router;
