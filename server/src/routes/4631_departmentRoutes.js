const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/4631_departmentController');
const { authenticate, authorizeRoles } = require('../middlewares/4631_auth');
const { UserRole } = require('../models/4631_User');

// Public routes
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);

// Admin-only management routes
router.post('/', authenticate, authorizeRoles(UserRole.ADMIN), createDepartment);
router.put('/:id', authenticate, authorizeRoles(UserRole.ADMIN), updateDepartment);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN), deleteDepartment);

module.exports = router;
