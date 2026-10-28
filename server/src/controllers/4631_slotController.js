const Slot = require('../models/4631_Slot');
const { sendSuccess, sendError } = require('../utils/4631_responseEnvelope');

// GET /api/slots
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date, startDate, endDate, onlyAvailable } = req.query;

    const query = {};

    if (doctorId) {
      query.doctorId = doctorId;
    }

    // Default: only return unbooked slots for patients
    if (onlyAvailable !== 'false') {
      query.isBooked = false;
    }

    if (date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    } else {
      // Default to future/today's slots onwards
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      query.date = { $gte: today };
    }

    const slots = await Slot.find(query)
      .populate({
        path: 'doctorId',
        select: 'qualification experience fee userId departmentId specializationId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
          { path: 'specializationId', select: 'name' }
        ]
      })
      .sort({ date: 1, startTime: 1 });

    return sendSuccess(res, slots);
  } catch (error) {
    next(error);
  }
};

// GET /api/slots/:id
const getSlotById = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'departmentId', select: 'name' },
          { path: 'specializationId', select: 'name' }
        ]
      });

    if (!slot) {
      return sendError(res, 404, 'SLOT_NOT_FOUND', 'Slot not found');
    }

    return sendSuccess(res, slot);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSlots,
  getSlotById
};
