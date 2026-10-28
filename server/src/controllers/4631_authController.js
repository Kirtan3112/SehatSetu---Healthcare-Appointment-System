const bcrypt = require('bcryptjs');
const { User, UserRole } = require('../models/4631_User');
const Doctor = require('../models/4631_Doctor');
const AuditLog = require('../models/4631_AuditLog');
const { generateToken } = require('../utils/4631_token');
const { sendSuccess, sendCreated, sendError } = require('../utils/4631_responseEnvelope');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, qualification, experience, fee, bio, departmentId, specializationId } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'MISSING_FIELDS', 'Name, email, and password are required.');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'PASSWORD_TOO_SHORT', 'Password must be at least 6 characters long.');
    }

    // Prohibit self-registering as ADMIN
    const requestedRole = (role || UserRole.PATIENT).toUpperCase();
    if (requestedRole === UserRole.ADMIN) {
      return sendError(res, 403, 'FORBIDDEN_ROLE', 'Cannot register directly as an Administrator.');
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, 409, 'EMAIL_EXISTS', 'An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: requestedRole,
      phone: phone || '',
      isActive: true
    });

    let doctorProfile = null;
    // If registering as Doctor, create linked doctor profile
    if (requestedRole === UserRole.DOCTOR) {
      doctorProfile = await Doctor.create({
        userId: user._id,
        departmentId: departmentId || undefined,
        specializationId: specializationId || undefined,
        qualification: qualification || 'MD / MBBS',
        experience: experience || 1,
        fee: fee || 500,
        bio: bio || '',
        approved: false // Must be approved by Admin
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email
    });

    // Record Audit Log
    await AuditLog.create({
      actor: user._id,
      action: 'USER_REGISTERED',
      target: `User:${user._id}`,
      details: { role: user.role, email: user.email },
      ipAddress: req.ip
    });

    const userData = user.toJSON();
    if (doctorProfile) {
      userData.doctorProfile = doctorProfile;
    }

    return sendCreated(res, {
      token,
      user: userData
    }, 'Account registered successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'MISSING_CREDENTIALS', 'Email and password are required.');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated. Please contact an administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    let doctorProfile = null;
    if (user.role === UserRole.DOCTOR) {
      doctorProfile = await Doctor.findOne({ userId: user._id })
        .populate('departmentId', 'name description')
        .populate('specializationId', 'name description');
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email
    });

    // Record Audit Log
    await AuditLog.create({
      actor: user._id,
      action: 'USER_LOGIN',
      target: `User:${user._id}`,
      details: { role: user.role },
      ipAddress: req.ip
    });

    const userData = user.toJSON();
    if (doctorProfile) {
      userData.doctorProfile = doctorProfile;
    }

    return sendSuccess(res, {
      token,
      user: userData
    }, 200, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let doctorProfile = null;

    if (user.role === UserRole.DOCTOR) {
      doctorProfile = await Doctor.findOne({ userId: user._id })
        .populate('departmentId', 'name description')
        .populate('specializationId', 'name description');
    }

    const userData = user.toJSON();
    if (doctorProfile) {
      userData.doctorProfile = doctorProfile;
    }

    return sendSuccess(res, { user: userData });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, phone, qualification, experience, fee, bio } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    await user.save();

    let doctorProfile = null;
    if (user.role === UserRole.DOCTOR) {
      doctorProfile = await Doctor.findOne({ userId: user._id });
      if (doctorProfile) {
        if (qualification) doctorProfile.qualification = qualification;
        if (experience !== undefined) doctorProfile.experience = Number(experience);
        if (fee !== undefined) doctorProfile.fee = Number(fee);
        if (bio !== undefined) doctorProfile.bio = bio;
        await doctorProfile.save();
      }
    }

    await AuditLog.create({
      actor: user._id,
      action: 'UPDATE_PROFILE',
      target: `User:${user._id}`,
      details: { name: user.name, phone: user.phone },
      ipAddress: req.ip
    });

    const userData = user.toJSON();
    if (doctorProfile) {
      userData.doctorProfile = doctorProfile;
    }

    return sendSuccess(res, { user: userData }, 200, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'MISSING_FIELDS', 'Current password and new password are required.');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'PASSWORD_TOO_SHORT', 'New password must be at least 6 characters long.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 400, 'INVALID_PASSWORD', 'Current password is incorrect.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await AuditLog.create({
      actor: user._id,
      action: 'CHANGE_PASSWORD',
      target: `User:${user._id}`,
      ipAddress: req.ip
    });

    return sendSuccess(res, null, 200, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
