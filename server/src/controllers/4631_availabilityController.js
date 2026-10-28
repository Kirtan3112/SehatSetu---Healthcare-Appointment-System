const Availability = require('../models/4631_Availability');
const Doctor = require('../models/4631_Doctor');
const AuditLog = require('../models/4631_AuditLog');
const { UserRole } = require('../models/4631_User');
const { generateSlotsForDoctor } = require('../services/4631_slotGeneratorService');
const { sendSuccess, sendError } = require('../utils/4631_responseEnvelope');

// GET /api/availability/:doctorId
const getDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const rules = await Availability.find({ doctorId }).sort({ dayOfWeek: 1 });
    return sendSuccess(res, rules);
  } catch (error) {
    next(error);
  }
};

// POST /api/availability/:doctorId (Doctor owner or Admin)
const setWeeklyAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return sendError(res, 404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
    }

    const isOwner = req.user._id.toString() === doctor.userId.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to configure this doctor availability.');
    }

    const { schedule } = req.body; // Array of { dayOfWeek, startTime, endTime, slotDuration }
    if (!Array.isArray(schedule)) {
      return sendError(res, 400, 'INVALID_PAYLOAD', 'Schedule must be an array of availability objects.');
    }

    const updatedRules = [];
    for (const item of schedule) {
      const { dayOfWeek, startTime, endTime, slotDuration } = item;
      if (dayOfWeek === undefined || !startTime || !endTime) {
        continue;
      }

      const rule = await Availability.findOneAndUpdate(
        { doctorId, dayOfWeek },
        {
          $set: {
            startTime,
            endTime,
            slotDuration: slotDuration || 30
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      updatedRules.push(rule);
    }

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_AVAILABILITY',
      target: `Doctor:${doctorId}`,
      details: { rulesCount: updatedRules.length },
      ipAddress: req.ip
    });

    return sendSuccess(res, updatedRules, 200, 'Weekly availability configured successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/availability/:doctorId/generate-slots
const triggerSlotGeneration = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return sendError(res, 404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
    }

    const isOwner = req.user._id.toString() === doctor.userId.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to generate slots for this doctor.');
    }

    const { startDate, endDate } = req.body;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default

    const result = await generateSlotsForDoctor(doctorId, start, end);

    await AuditLog.create({
      actor: req.user._id,
      action: 'GENERATE_SLOTS',
      target: `Doctor:${doctorId}`,
      details: result,
      ipAddress: req.ip
    });

    return sendSuccess(res, result, 200, 'Slots generated successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/availability/:doctorId/leave
const addLeaveDate = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.body; // YYYY-MM-DD

    if (!date) {
      return sendError(res, 400, 'MISSING_DATE', 'Leave date is required.');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return sendError(res, 404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
    }

    const isOwner = req.user._id.toString() === doctor.userId.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to manage leave for this doctor.');
    }

    const leaveDate = new Date(date);
    leaveDate.setUTCHours(0, 0, 0, 0);
    const dayOfWeek = leaveDate.getUTCDay();

    // Add to doctor's availability rule for this day of week
    await Availability.updateMany(
      { doctorId, dayOfWeek },
      { $addToSet: { leaveDates: leaveDate } }
    );

    return sendSuccess(res, { date: leaveDate.toISOString() }, 200, 'Leave date recorded successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorAvailability,
  setWeeklyAvailability,
  triggerSlotGeneration,
  addLeaveDate
};
