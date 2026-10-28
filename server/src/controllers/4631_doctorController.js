const Doctor = require('../models/4631_Doctor');
const { User, UserRole } = require('../models/4631_User');
const { Notification, NotificationType } = require('../models/4631_Notification');
const AuditLog = require('../models/4631_AuditLog');
const { sendSuccess, sendError } = require('../utils/4631_responseEnvelope');

// GET /api/doctors (Public / Patient search)
const searchDoctors = async (req, res, next) => {
  try {
    const {
      search,
      departmentId,
      specializationId,
      minExperience,
      maxFee,
      includeUnapproved
    } = req.query;

    const query = {};

    // Only Admins can view unapproved doctors
    const isAdmin = req.user && req.user.role === UserRole.ADMIN;
    if (!isAdmin || includeUnapproved !== 'true') {
      query.approved = true;
    }

    if (departmentId) {
      query.departmentId = departmentId;
    }

    if (specializationId) {
      query.specializationId = specializationId;
    }

    if (minExperience) {
      query.experience = { ...query.experience, $gte: Number(minExperience) };
    }

    if (maxFee) {
      query.fee = { ...query.fee, $lte: Number(maxFee) };
    }

    let doctors = await Doctor.find(query)
      .populate('userId', 'name email phone isActive')
      .populate('departmentId', 'name description')
      .populate('specializationId', 'name description')
      .sort({ experience: -1 });

    // Filter out inactive user accounts
    doctors = doctors.filter(doc => doc.userId && doc.userId.isActive);

    // If search text provided, filter in-memory or by regex
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      doctors = doctors.filter(doc => {
        const nameMatch = doc.userId?.name?.toLowerCase().includes(term);
        const qualMatch = doc.qualification?.toLowerCase().includes(term);
        const bioMatch = doc.bio?.toLowerCase().includes(term);
        const deptMatch = doc.departmentId?.name?.toLowerCase().includes(term);
        const specMatch = doc.specializationId?.name?.toLowerCase().includes(term);
        return nameMatch || qualMatch || bioMatch || deptMatch || specMatch;
      });
    }

    return sendSuccess(res, doctors);
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone isActive')
      .populate('departmentId', 'name description')
      .populate('specializationId', 'name description');

    if (!doctor) {
      return sendError(res, 404, 'DOCTOR_NOT_FOUND', 'Doctor profile not found');
    }

    return sendSuccess(res, doctor);
  } catch (error) {
    next(error);
  }
};

// PUT /api/doctors/:id (Doctor owner or Admin)
const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return sendError(res, 404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
    }

    const isOwner = req.user._id.toString() === doctor.userId.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to edit this doctor profile.');
    }

    const { qualification, experience, fee, bio, departmentId, specializationId } = req.body;

    if (qualification) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (fee !== undefined) doctor.fee = Number(fee);
    if (bio !== undefined) doctor.bio = bio;
    if (departmentId) doctor.departmentId = departmentId;
    if (specializationId) doctor.specializationId = specializationId;

    await doctor.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_DOCTOR_PROFILE',
      target: `Doctor:${doctor._id}`,
      details: { qualification, experience, fee },
      ipAddress: req.ip
    });

    const updated = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone')
      .populate('departmentId', 'name')
      .populate('specializationId', 'name');

    return sendSuccess(res, updated, 200, 'Doctor profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/doctors/:id/approve (Admin only)
const approveDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId');
    if (!doctor) {
      return sendError(res, 404, 'DOCTOR_NOT_FOUND', 'Doctor profile not found');
    }

    doctor.approved = true;
    await doctor.save();

    // Create Notification for the Doctor
    await Notification.create({
      userId: doctor.userId._id,
      type: NotificationType.BOOKING_CONFIRMATION,
      message: 'Congratulations! Your doctor profile has been verified and approved by the administrator.'
    });

    // Record Audit Log
    await AuditLog.create({
      actor: req.user._id,
      action: 'APPROVE_DOCTOR',
      target: `Doctor:${doctor._id}`,
      details: { doctorEmail: doctor.userId.email },
      ipAddress: req.ip
    });

    return sendSuccess(res, doctor, 200, 'Doctor profile approved successfully');
  } catch (error) {
    next(error);
  }
};

// PATCH /api/doctors/:id/reject (Admin only)
const rejectDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId');
    if (!doctor) {
      return sendError(res, 404, 'DOCTOR_NOT_FOUND', 'Doctor profile not found');
    }

    doctor.approved = false;
    await doctor.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'REJECT_DOCTOR',
      target: `Doctor:${doctor._id}`,
      details: { doctorEmail: doctor.userId.email },
      ipAddress: req.ip
    });

    return sendSuccess(res, doctor, 200, 'Doctor approval revoked successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchDoctors,
  getDoctorById,
  updateDoctorProfile,
  approveDoctor,
  rejectDoctor
};
