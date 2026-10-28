const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  triggerReminders
} = require('../controllers/4631_notificationController');
const { authenticate, authorizeRoles } = require('../middlewares/4631_auth');
const { UserRole } = require('../models/4631_User');

// Authenticated user notifications
router.get('/', authenticate, getUserNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/mark-all-read', authenticate, markAllAsRead);

// Admin-only trigger for reminder scheduler check
router.post('/trigger-reminders', authenticate, authorizeRoles(UserRole.ADMIN), triggerReminders);

module.exports = router;
