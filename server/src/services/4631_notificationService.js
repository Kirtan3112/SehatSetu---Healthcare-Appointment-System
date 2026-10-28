const { Notification, NotificationType } = require('../models/4631_Notification');
const { Appointment, AppointmentStatus } = require('../models/4631_Appointment');
const Slot = require('../models/4631_Slot');

/**
 * Dispatches and stores an in-app and simulated email notification
 */
const sendNotification = async ({ userId, appointmentId, type, message }) => {
  const notification = await Notification.create({
    userId,
    appointmentId,
    type,
    message,
    sentAt: new Date(),
    readStatus: false
  });

  console.log(`[Notification Dispatch] Sent ${type} to User ${userId}: "${message}"`);
  return notification;
};

/**
 * Background worker logic: checks for confirmed appointments occurring within the next 24 hours
 * and dispatches reminder notifications if not already sent.
 */
const checkAndSendReminders = async () => {
  const now = new Date();
  const next24h = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Find confirmed appointments
  const upcomingAppointments = await Appointment.find({
    status: AppointmentStatus.CONFIRMED
  }).populate('slotId patientId doctorId');

  let remindersSent = 0;

  for (const appt of upcomingAppointments) {
    if (!appt.slotId || !appt.slotId.date) continue;

    const [h, m] = (appt.slotId.startTime || '00:00').split(':').map(Number);
    const appointmentTime = new Date(appt.slotId.date);
    appointmentTime.setUTCHours(h, m, 0, 0);

    // If appointment is within 24 hours from now (and still in the future)
    if (appointmentTime > now && appointmentTime <= next24h) {
      // Check if reminder was already sent for this appointment
      const existingReminder = await Notification.findOne({
        userId: appt.patientId._id,
        appointmentId: appt._id,
        type: NotificationType.APPOINTMENT_REMINDER
      });

      if (!existingReminder) {
        const dateStr = appointmentTime.toISOString().split('T')[0];
        const msg = `Reminder: You have an upcoming appointment scheduled on ${dateStr} at ${appt.slotId.startTime}.`;

        await sendNotification({
          userId: appt.patientId._id,
          appointmentId: appt._id,
          type: NotificationType.APPOINTMENT_REMINDER,
          message: msg
        });

        remindersSent++;
      }
    }
  }

  return { remindersSent };
};

module.exports = {
  sendNotification,
  checkAndSendReminders
};
