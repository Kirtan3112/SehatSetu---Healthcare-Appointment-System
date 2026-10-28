const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Slot date is required']
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
  isBooked: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// CRITICAL CONSTRAINT: Compound unique index preventing duplicate slots for the same doctor at the same time
slotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });
slotSchema.index({ doctorId: 1, date: 1, isBooked: 1 });

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
