const express = require('express');
const router = express.Router();
const {
  getAllSpecializations,
  getSpecializationById,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization
} = require('../controllers/4631_specializationController');
const { authenticate, authorizeRoles } = require('../middlewares/4631_auth');
const { UserRole } = require('../models/4631_User');

// Public routes
router.get('/', getAllSpecializations);
router.get('/:id', getSpecializationById);

// Admin-only management routes
router.post('/', authenticate, authorizeRoles(UserRole.ADMIN), createSpecialization);
router.put('/:id', authenticate, authorizeRoles(UserRole.ADMIN), updateSpecialization);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN), deleteSpecialization);

module.exports = router;
