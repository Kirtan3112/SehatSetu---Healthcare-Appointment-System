const { Appointment, AppointmentStatus } = require('../models/4631_Appointment');
const Slot = require('../models/4631_Slot');
const Doctor = require('../models/4631_Doctor');
const { Notification, NotificationType } = require('../models/4631_Notification');
const AuditLog = require('../models/4631_AuditLog');

/**
 * Checks if a slot datetime is in the past
 */
const isSlotInPast = (slotDate, startTime) => {
  const [h, m] = startTime.split(':').map(Number);
  const slotDateTime = new Date(slotDate);
  slotDateTime.setUTCHours(h, m, 0, 0);

  // Compare with current UTC time (with a 2-minute buffer)
  return slotDateTime.getTime() < Date.now() - 2 * 60 * 1000;
};

/**
 * High-concurrency atomic booking function implementing compare-and-set slot claim
 * and transaction rollback per the HAS Activity & Sequence diagrams.
 */
const bookAppointment = async ({ patientId, slotId, reason, notes, ipAddress }) => {
  // 1. Verify slot exists
  const slot = await Slot.findById(slotId).populate('doctorId');
  if (!slot) {
    const error = new Error('The selected time slot does not exist.');
    error.statusCode = 404;
    error.code = 'SLOT_NOT_FOUND';
    throw error;
  }

  // 2. Pre-check: is slot already marked as booked?
  if (slot.isBooked) {
    const error = new Error('This time slot is already booked. Please choose another slot.');
    error.statusCode = 409;
    error.code = 'SLOT_ALREADY_BOOKED';
    throw error;
  }

  // 3. Prevent booking in the past
  if (isSlotInPast(slot.date, slot.startTime)) {
    const error = new Error('Cannot book an appointment slot that has already passed.');
    error.statusCode = 400;
    error.code = 'PAST_SLOT_NOT_ALLOWED';
    throw error;
  }

  // 4. ATOMIC COMPARE-AND-SET SLOT CLAIM
  // Only update isBooked = true IF isBooked is currently false.
  // Backed by unique indexes and atomic database operation.
  const claimedSlot = await Slot.findOneAndUpdate(
    { _id: slotId, isBooked: false },
    { $set: { isBooked: true } },
    { new: true }
  );

  // If claimedSlot is null, another concurrent request claimed this slot in the microsecond window!
  if (!claimedSlot) {
    const error = new Error('This time slot was just claimed by another patient. Please choose another slot.');
    error.statusCode = 409;
    error.code = 'SLOT_ALREADY_BOOKED';
    throw error;
  }

  // 5. Create Appointment record
  let appointment;
  try {
    appointment = await Appointment.create({
      patientId,
      doctorId: claimedSlot.doctorId._id || claimedSlot.doctorId,
      slotId: claimedSlot._id,
      status: AppointmentStatus.CONFIRMED,
      reason: reason || 'General Consultation',
      notes: notes || ''
    });
  } catch (persistenceError) {
    // ROLLBACK: Release the claimed slot if saving appointment failed
    console.error('[Booking Rollback] Appointment creation failed, reverting slot claim:', persistenceError.message);
    await Slot.findByIdAndUpdate(slotId, { $set: { isBooked: false } });

    if (persistenceError.code === 11000) {
      const conflictError = new Error('A booking conflict occurred for this time slot. Please choose another slot.');
      conflictError.statusCode = 409;
      conflictError.code = 'BOOKING_CONFLICT';
      throw conflictError;
    }
    throw persistenceError;
  }

  // 6. Asynchronous Notification dispatch (Patient confirmation & Doctor alert)
  try {
    const dateFormatted = new Date(claimedSlot.date).toISOString().split('T')[0];
    const messagePatient = `Your appointment is confirmed for ${dateFormatted} at ${claimedSlot.startTime}.`;

    await Notification.create({
      userId: patientId,
      appointmentId: appointment._id,
      type: NotificationType.BOOKING_CONFIRMATION,
      message: messagePatient
    });

    // Notify doctor
    const doctorObj = await Doctor.findById(claimedSlot.doctorId);
    if (doctorObj && doctorObj.userId) {
      await Notification.create({
        userId: doctorObj.userId,
        appointmentId: appointment._id,
        type: NotificationType.BOOKING_CONFIRMATION,
        message: `New appointment booked for ${dateFormatted} at ${claimedSlot.startTime}.`
      });
    }
  } catch (notifErr) {
    console.warn('[Notification Warning] Could not record notification:', notifErr.message);
  }

  // 7. Audit log
  try {
    await AuditLog.create({
      actor: patientId,
      action: 'BOOK_APPOINTMENT',
      target: `Appointment:${appointment._id}`,
      details: { slotId, doctorId: claimedSlot.doctorId },
      ipAddress: ipAddress || ''
    });
  } catch (auditErr) {
    console.warn('[Audit Warning] Could not write audit log:', auditErr.message);
  }

  // Populate appointment details for the response
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email phone')
    .populate({
      path: 'doctorId',
      select: 'qualification experience fee userId departmentId specializationId',
      populate: [
        { path: 'userId', select: 'name email phone' },
        { path: 'departmentId', select: 'name' },
        { path: 'specializationId', select: 'name' }
      ]
    })
    .populate('slotId');

  return populatedAppointment;
};

module.exports = {
  bookAppointment,
  isSlotInPast
};
