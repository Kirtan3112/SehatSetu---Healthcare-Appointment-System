const { User, UserRole } = require('./4631_User');
const Department = require('./4631_Department');
const Specialization = require('./4631_Specialization');
const Doctor = require('./4631_Doctor');
const Availability = require('./4631_Availability');
const Slot = require('./4631_Slot');
const { Appointment, AppointmentStatus } = require('./4631_Appointment');
const { Notification, NotificationType } = require('./4631_Notification');
const AuditLog = require('./4631_AuditLog');

module.exports = {
  User,
  UserRole,
  Department,
  Specialization,
  Doctor,
  Availability,
  Slot,
  Appointment,
  AppointmentStatus,
  Notification,
  NotificationType,
  AuditLog
};
