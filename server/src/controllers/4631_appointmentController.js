const { Appointment, AppointmentStatus } = require('../models/4631_Appointment');
const Slot = require('../models/4631_Slot');
const Doctor = require('../models/4631_Doctor');
const { Notification, NotificationType } = require('../models/4631_Notification');
const AuditLog = require('../models/4631_AuditLog');
const { UserRole } = require('../models/4631_User');
const { bookAppointment, isSlotInPast } = require('../services/4631_bookingService');
const { sendSuccess, sendCreated, sendError } = require('../utils/4631_responseEnvelope');

// POST /api/appointments (Patient creates booking)
const createBooking = async (req, res, next) => {
  try {
    const { slotId, reason, notes } = req.body;
    const patientId = req.user._id;

    if (!slotId) {
      return sendError(res, 400, 'MISSING_SLOT_ID', 'Time slot ID is required to book an appointment.');
    }

    const appointment = await bookAppointment({
      patientId,
      slotId,
      reason,
      notes,
      ipAddress: req.ip
    });

    return sendCreated(res, appointment, 'Appointment booked successfully.');
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/my (Patient's appointment history)
const getPatientAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { patientId: req.user._id };

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        select: 'qualification experience fee userId departmentId specializationId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
          { path: 'specializationId', select: 'name' }
        ]
      })
      .populate('slotId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, appointments);
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/doctor-schedule (Doctor's view of their appointments)
const getDoctorAppointments = async (req, res, next) => {
  try {
    // Find doctor profile corresponding to this authenticated doctor user
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return sendError(res, 404, 'DOCTOR_PROFILE_NOT_FOUND', 'No doctor profile found for this user account.');
    }

    const { status, date } = req.query;
    const query = { doctorId: doctorProfile._id };

    if (status && status !== 'undefined' && status !== 'null') {
      query.status = status;
    }

    let appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('slotId')
      .sort({ createdAt: -1 });

    // Optional filter by slot date
    if (date && date !== 'undefined' && date !== 'null') {
      const targetDate = new Date(date).toISOString().split('T')[0];
      appointments = appointments.filter(appt => {
        if (!appt.slotId || !appt.slotId.date) return false;
        return new Date(appt.slotId.date).toISOString().split('T')[0] === targetDate;
      });
    }

    return sendSuccess(res, appointments);
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments (Admin monitors all appointments)
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, patientId } = req.query;
    const query = {};

    if (status && status !== 'undefined' && status !== 'null') query.status = status;
    if (doctorId && doctorId !== 'undefined' && doctorId !== 'null') query.doctorId = doctorId;
    if (patientId && patientId !== 'undefined' && patientId !== 'null') query.patientId = patientId;

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' }
        ]
      })
      .populate('slotId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, appointments);
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
          { path: 'specializationId', select: 'name' }
        ]
      })
      .populate('slotId');

    if (!appointment) {
      return sendError(res, 404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    }

    // Role check: Patient can only view their own, Doctor their own, Admin can view all
    const isPatientOwner = appointment.patientId && appointment.patientId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    let isDoctorOwner = false;
    if (req.user.role === UserRole.DOCTOR && appointment.doctorId) {
      isDoctorOwner = appointment.doctorId.userId && appointment.doctorId.userId._id.toString() === req.user._id.toString();
    }

    if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to view this appointment.');
    }

    return sendSuccess(res, appointment);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id/cancel
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId slotId');
    if (!appointment) {
      return sendError(res, 404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    }

    // Check authorization: Patient owner, Doctor owner, or Admin
    const isPatientOwner = appointment.patientId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    let isDoctorOwner = false;
    if (req.user.role === UserRole.DOCTOR && appointment.doctorId) {
      isDoctorOwner = appointment.doctorId.userId.toString() === req.user._id.toString();
    }

    if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to cancel this appointment.');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      return sendError(res, 400, 'ALREADY_CANCELLED', 'This appointment has already been cancelled.');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      return sendError(res, 400, 'ALREADY_COMPLETED', 'Cannot cancel an appointment that is already completed.');
    }

    // Update appointment status to CANCELLED
    appointment.status = AppointmentStatus.CANCELLED;
    await appointment.save();

    // Release the booked slot so it becomes available again!
    if (appointment.slotId) {
      await Slot.findByIdAndUpdate(appointment.slotId._id || appointment.slotId, {
        $set: { isBooked: false }
      });
    }

    // Dispatch Cancellation Notifications
    const slotInfo = appointment.slotId ? `on ${new Date(appointment.slotId.date).toISOString().split('T')[0]} at ${appointment.slotId.startTime}` : '';
    await Notification.create({
      userId: appointment.patientId,
      appointmentId: appointment._id,
      type: NotificationType.CANCELLATION,
      message: `Your appointment ${slotInfo} has been cancelled.`
    });

    if (appointment.doctorId && appointment.doctorId.userId) {
      await Notification.create({
        userId: appointment.doctorId.userId,
        appointmentId: appointment._id,
        type: NotificationType.CANCELLATION,
        message: `Appointment ${slotInfo} was cancelled.`
      });
    }

    // Record Audit Log
    await AuditLog.create({
      actor: req.user._id,
      action: 'CANCEL_APPOINTMENT',
      target: `Appointment:${appointment._id}`,
      details: { releasedSlotId: appointment.slotId ? appointment.slotId._id : null },
      ipAddress: req.ip
    });

    return sendSuccess(res, appointment, 200, 'Appointment cancelled successfully and slot released.');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id/reschedule
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { newSlotId } = req.body;
    if (!newSlotId) {
      return sendError(res, 400, 'MISSING_SLOT_ID', 'New time slot ID is required to reschedule.');
    }

    const appointment = await Appointment.findById(req.params.id).populate('slotId doctorId');
    if (!appointment) {
      return sendError(res, 404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    }

    const isPatientOwner = appointment.patientId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isPatientOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to reschedule this appointment.');
    }

    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
      return sendError(res, 400, 'INVALID_LIFECYCLE_STATE', `Cannot reschedule an appointment with status '${appointment.status}'.`);
    }

    // Verify new slot
    const newSlot = await Slot.findById(newSlotId);
    if (!newSlot) {
      return sendError(res, 404, 'SLOT_NOT_FOUND', 'The new time slot does not exist.');
    }

    if (newSlot.isBooked) {
      return sendError(res, 409, 'SLOT_ALREADY_BOOKED', 'The new time slot is already booked.');
    }

    if (isSlotInPast(newSlot.date, newSlot.startTime)) {
      return sendError(res, 400, 'PAST_SLOT_NOT_ALLOWED', 'Cannot reschedule to a slot in the past.');
    }

    // Atomically claim NEW slot
    const claimedNewSlot = await Slot.findOneAndUpdate(
      { _id: newSlotId, isBooked: false },
      { $set: { isBooked: true } },
      { new: true }
    );

    if (!claimedNewSlot) {
      return sendError(res, 409, 'SLOT_ALREADY_BOOKED', 'The new time slot was just booked by another user.');
    }

    // Release OLD slot
    const oldSlotId = appointment.slotId ? (appointment.slotId._id || appointment.slotId) : null;
    if (oldSlotId) {
      await Slot.findByIdAndUpdate(oldSlotId, { $set: { isBooked: false } });
    }

    // Update appointment
    appointment.slotId = claimedNewSlot._id;
    appointment.doctorId = claimedNewSlot.doctorId;
    appointment.status = AppointmentStatus.CONFIRMED;
    await appointment.save();

    // Create Reschedule Notifications
    const dateFormatted = new Date(claimedNewSlot.date).toISOString().split('T')[0];
    await Notification.create({
      userId: appointment.patientId,
      appointmentId: appointment._id,
      type: NotificationType.RESCHEDULE,
      message: `Your appointment has been rescheduled to ${dateFormatted} at ${claimedNewSlot.startTime}.`
    });

    // Record Audit Log
    await AuditLog.create({
      actor: req.user._id,
      action: 'RESCHEDULE_APPOINTMENT',
      target: `Appointment:${appointment._id}`,
      details: { oldSlotId, newSlotId: claimedNewSlot._id },
      ipAddress: req.ip
    });

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' }
        ]
      })
      .populate('slotId');

    return sendSuccess(res, updatedAppointment, 200, 'Appointment rescheduled successfully.');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id/status (Doctor or Admin updates status)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!status || !Object.values(AppointmentStatus).includes(status)) {
      return sendError(res, 400, 'INVALID_STATUS', `Status must be one of: ${Object.values(AppointmentStatus).join(', ')}`);
    }

    const appointment = await Appointment.findById(req.params.id).populate('doctorId');
    if (!appointment) {
      return sendError(res, 404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
    }

    const isAdmin = req.user.role === UserRole.ADMIN;
    let isDoctorOwner = false;
    if (req.user.role === UserRole.DOCTOR && appointment.doctorId) {
      isDoctorOwner = appointment.doctorId.userId.toString() === req.user._id.toString();
    }

    if (!isAdmin && !isDoctorOwner) {
      return sendError(res, 403, 'FORBIDDEN', 'Only the assigned Doctor or an Admin can update appointment status.');
    }

    const previousStatus = appointment.status;
    appointment.status = status;
    if (notes !== undefined) {
      appointment.notes = notes;
    }
    await appointment.save();

    // If cancelled, release slot
    if (status === AppointmentStatus.CANCELLED) {
      await Slot.findByIdAndUpdate(appointment.slotId, { $set: { isBooked: false } });
    }

    // Audit Log
    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_APPOINTMENT_STATUS',
      target: `Appointment:${appointment._id}`,
      details: { previousStatus, newStatus: status },
      ipAddress: req.ip
    });

    return sendSuccess(res, appointment, 200, `Appointment status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus
};
