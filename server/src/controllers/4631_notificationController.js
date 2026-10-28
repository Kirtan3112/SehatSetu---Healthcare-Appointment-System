const { Notification } = require('../models/4631_Notification');
const { checkAndSendReminders } = require('../services/4631_notificationService');
const { sendSuccess, sendError } = require('../utils/4631_responseEnvelope');

// GET /api/notifications (User's notifications)
const getUserNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const query = { userId: req.user._id };

    if (unreadOnly === 'true') {
      query.readStatus = false;
    }

    const notifications = await Notification.find(query)
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      readStatus: false
    });
    return sendSuccess(res, { unreadCount: count });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return sendError(res, 404, 'NOTIFICATION_NOT_FOUND', 'Notification not found.');
    }

    notification.readStatus = true;
    await notification.save();

    return sendSuccess(res, notification, 200, 'Notification marked as read.');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/mark-all-read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, readStatus: false },
      { $set: { readStatus: true } }
    );
    return sendSuccess(res, null, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/trigger-reminders (Admin/cron trigger)
const triggerReminders = async (req, res, next) => {
  try {
    const result = await checkAndSendReminders();
    return sendSuccess(res, result, 200, `Reminder job executed. ${result.remindersSent} reminders dispatched.`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  triggerReminders
};
