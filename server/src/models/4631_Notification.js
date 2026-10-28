const mongoose = require('mongoose');

const NotificationType = {
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  CANCELLATION: 'CANCELLATION',
  RESCHEDULE: 'RESCHEDULE'
};

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Notification type is required']
  },
  message: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true
  },
  readStatus: {
    type: Boolean,
    default: false,
    index: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, readStatus: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Notification,
  NotificationType
};
