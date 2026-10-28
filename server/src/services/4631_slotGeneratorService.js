const Availability = require('../models/4631_Availability');
const Slot = require('../models/4631_Slot');
const Doctor = require('../models/4631_Doctor');

/**
 * Helper to convert "HH:mm" to total minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Helper to convert total minutes to "HH:mm"
 */
const minutesToTime = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Generates discrete time slots for a doctor over a specified date range
 * based on the doctor's weekly Availability rules and leave dates.
 */
const generateSlotsForDoctor = async (doctorId, startDateInput, endDateInput) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  // Fetch all availability rules for this doctor
  const availabilities = await Availability.find({ doctorId });
  if (availabilities.length === 0) {
    return { created: 0, existing: 0, message: 'No availability rules configured for doctor.' };
  }

  // Map rules by dayOfWeek (0 = Sunday, 1 = Monday, etc.)
  const ruleMap = {};
  availabilities.forEach(rule => {
    ruleMap[rule.dayOfWeek] = rule;
  });

  const startDate = new Date(startDateInput);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(endDateInput);
  endDate.setUTCHours(23, 59, 59, 999);

  let createdCount = 0;
  let existingCount = 0;

  const curDate = new Date(startDate);

  while (curDate <= endDate) {
    const dayOfWeek = curDate.getUTCDay();
    const rule = ruleMap[dayOfWeek];

    if (rule) {
      // Check if curDate is in leaveDates
      const dateStr = curDate.toISOString().split('T')[0];
      const isLeave = (rule.leaveDates || []).some(ld => {
        return ld.toISOString().split('T')[0] === dateStr;
      });

      if (!isLeave) {
        const startMin = timeToMinutes(rule.startTime);
        const endMin = timeToMinutes(rule.endTime);
        const duration = rule.slotDuration || 30;

        for (let m = startMin; m + duration <= endMin; m += duration) {
          const slotStart = minutesToTime(m);
          const slotEnd = minutesToTime(m + duration);

          const existingSlot = await Slot.findOne({
            doctorId,
            date: new Date(curDate),
            startTime: slotStart
          });

          if (existingSlot) {
            existingCount++;
          } else {
            try {
              await Slot.create({
                doctorId,
                date: new Date(curDate),
                startTime: slotStart,
                endTime: slotEnd,
                isBooked: false
              });
              createdCount++;
            } catch (err) {
              if (err.code === 11000) {
                existingCount++;
              } else {
                throw err;
              }
            }
          }
        }
      }
    }

    // Move to next day
    curDate.setUTCDate(curDate.getUTCDate() + 1);
  }

  return {
    doctorId,
    created: createdCount,
    existing: existingCount,
    total: createdCount + existingCount
  };
};

module.exports = {
  generateSlotsForDoctor,
  timeToMinutes,
  minutesToTime
};
