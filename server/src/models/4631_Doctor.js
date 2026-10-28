const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  },
  specializationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
    required: false
  },
  qualification: {
    type: String,
    trim: true,
    default: 'MD / MBBS'
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    default: 1
  },
  fee: {
    type: Number,
    min: [0, 'Fee cannot be negative'],
    default: 50
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  approved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

doctorSchema.index({ specializationId: 1 });
doctorSchema.index({ departmentId: 1 });
doctorSchema.index({ approved: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
