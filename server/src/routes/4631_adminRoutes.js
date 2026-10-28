const express = require('express');
const router = express.Router();
const {
  getSystemMetrics,
  getUsersList,
  toggleUserStatus,
  getAuditLogs,
  createDoctorByAdmin
} = require('../controllers/4631_adminController');
const { authenticate, authorizeRoles } = require('../middlewares/4631_auth');
const { UserRole } = require('../models/4631_User');

// All admin routes require ADMIN role
router.use(authenticate, authorizeRoles(UserRole.ADMIN));

router.get('/metrics', getSystemMetrics);
router.get('/users', getUsersList);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/audit-logs', getAuditLogs);
router.post('/doctors', createDoctorByAdmin);

module.exports = router;
