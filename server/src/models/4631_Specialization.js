const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Specialization name is required'],
    unique: true,
    trim: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department ID is required']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

specializationSchema.index({ departmentId: 1 });

const Specialization = mongoose.model('Specialization', specializationSchema);

module.exports = Specialization;
