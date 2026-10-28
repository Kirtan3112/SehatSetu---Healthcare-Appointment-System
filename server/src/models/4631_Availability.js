const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required (0-6)'],
    min: 0,
    max: 6
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required (HH:mm)'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm 24-hour format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required (HH:mm)'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm 24-hour format']
  },
  slotDuration: {
    type: Number,
    required: [true, 'Slot duration in minutes is required'],
    min: [10, 'Slot duration must be at least 10 minutes'],
    max: [120, 'Slot duration cannot exceed 120 minutes'],
    default: 30
  },
  leaveDates: [{
    type: Date
  }]
}, {
  timestamps: true
});

// Ensure a doctor has at most one availability rule per day of week
availabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
