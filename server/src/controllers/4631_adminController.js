const bcrypt = require('bcryptjs');
const { User, UserRole } = require('../models/4631_User');
const Doctor = require('../models/4631_Doctor');
const Department = require('../models/4631_Department');
const Specialization = require('../models/4631_Specialization');
const { Appointment, AppointmentStatus } = require('../models/4631_Appointment');
const AuditLog = require('../models/4631_AuditLog');
const { sendSuccess, sendError } = require('../utils/4631_responseEnvelope');

// GET /api/admin/metrics
const getSystemMetrics = async (req, res, next) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      totalDepts,
      totalSpecs,
      appointmentsByStatus,
      recentAuditLogs
    ] = await Promise.all([
      User.countDocuments({ role: UserRole.PATIENT }),
      Doctor.countDocuments(),
      Doctor.countDocuments({ approved: false }),
      Doctor.countDocuments({ approved: true }),
      Department.countDocuments(),
      Specialization.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      AuditLog.find().sort({ timestamp: -1 }).limit(10).populate('actor', 'name email role')
    ]);

    const statusMap = {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0
    };
    appointmentsByStatus.forEach(item => {
      statusMap[item._id] = item.count;
    });

    const totalAppointments = Object.values(statusMap).reduce((a, b) => a + b, 0);

    return sendSuccess(res, {
      users: {
        patients: totalPatients,
        doctors: totalDoctors,
        pendingApprovals: pendingDoctors,
        approvedDoctors
      },
      catalog: {
        departments: totalDepts,
        specializations: totalSpecs
      },
      appointments: {
        total: totalAppointments,
        byStatus: statusMap
      },
      recentLogs: recentAuditLogs
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getUsersList = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const query = {};

    if (role) query.role = role.toUpperCase();
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return sendError(res, 400, 'SELF_DEACTIVATION_PROHIBITED', 'Cannot deactivate your own administrator account.');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.');
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      actor: req.user._id,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      target: `User:${user._id}`,
      details: { email: user.email, newActiveState: user.isActive },
      ipAddress: req.ip
    });

    return sendSuccess(res, user, 200, `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, limit } = req.query;
    const query = {};

    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 })
      .limit(Number(limit) || 100);

    return sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/doctors - Create and activate a new doctor directly
const createDoctorByAdmin = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      departmentId,
      specializationId,
      qualification,
      experience,
      fee,
      bio
    } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'MISSING_REQUIRED_FIELDS', 'Name, email, and password are required.');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'PASSWORD_TOO_SHORT', 'Password must be at least 6 characters long.');
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 409, 'EMAIL_EXISTS', 'An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: UserRole.DOCTOR,
      phone: phone?.trim() || '',
      isActive: true
    });

    const doctorProfile = await Doctor.create({
      userId: user._id,
      departmentId: departmentId || undefined,
      specializationId: specializationId || undefined,
      qualification: qualification?.trim() || 'MD / MBBS',
      experience: experience !== undefined ? Number(experience) : 5,
      fee: fee !== undefined ? Number(fee) : 800,
      bio: bio?.trim() || '',
      approved: true // Created directly by Admin -> auto-approved
    });

    await AuditLog.create({
      actor: req.user._id,
      action: 'ADMIN_CREATED_DOCTOR',
      target: `Doctor:${doctorProfile._id}`,
      details: { doctorEmail: user.email, doctorName: user.name, departmentId },
      ipAddress: req.ip
    });

    const populatedProfile = await Doctor.findById(doctorProfile._id)
      .populate('userId', 'name email phone role isActive')
      .populate('departmentId', 'name')
      .populate('specializationId', 'name');

    return sendSuccess(res, { user: user.toJSON(), doctorProfile: populatedProfile }, 201, 'Doctor onboarded and activated successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemMetrics,
  getUsersList,
  toggleUserStatus,
  getAuditLogs,
  createDoctorByAdmin
};
