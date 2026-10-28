const mongoose = require('mongoose');

const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: [true, 'Slot ID is required']
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.CONFIRMED,
    index: true
  },
  reason: {
    type: String,
    trim: true,
    default: 'General Consultation'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: { createdAt: true, updatedAt: true }
});

// Compound index on patientId and status for appointment history queries
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 });

// CRITICAL CONSTRAINT: Partial Unique Index on slotId for active bookings
// Guarantees zero double-booking even under extreme race conditions!
appointmentSchema.index(
  { slotId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
    }
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = {
  Appointment,
  AppointmentStatus
};
