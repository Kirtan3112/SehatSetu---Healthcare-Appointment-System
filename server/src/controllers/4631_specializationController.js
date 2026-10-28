const Specialization = require('../models/4631_Specialization');
const Department = require('../models/4631_Department');
const AuditLog = require('../models/4631_AuditLog');
const { sendSuccess, sendCreated, sendError } = require('../utils/4631_responseEnvelope');

// GET /api/specializations
const getAllSpecializations = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const filter = {};
    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const specializations = await Specialization.find(filter)
      .populate('departmentId', 'name description')
      .sort({ name: 1 });

    return sendSuccess(res, specializations);
  } catch (error) {
    next(error);
  }
};

// GET /api/specializations/:id
const getSpecializationById = async (req, res, next) => {
  try {
    const specialization = await Specialization.findById(req.params.id)
      .populate('departmentId', 'name description');

    if (!specialization) {
      return sendError(res, 404, 'SPECIALIZATION_NOT_FOUND', 'Specialization not found');
    }

    return sendSuccess(res, specialization);
  } catch (error) {
    next(error);
  }
};

// POST /api/specializations (Admin only)
const createSpecialization = async (req, res, next) => {
  try {
    const { name, departmentId, description } = req.body;
    if (!name || !departmentId) {
      return sendError(res, 400, 'MISSING_FIELDS', 'Name and department ID are required');
    }

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return sendError(res, 404, 'DEPARTMENT_NOT_FOUND', 'Linked department not found');
    }

    const existing = await Specialization.findOne({ name: name.trim() });
    if (existing) {
      return sendError(res, 409, 'SPECIALIZATION_EXISTS', 'Specialization with this name already exists');
    }

    const specialization = await Specialization.create({
      name: name.trim(),
      departmentId,
      description: description || ''
    });

    await AuditLog.create({
      actor: req.user._id,
      action: 'CREATE_SPECIALIZATION',
      target: `Specialization:${specialization._id}`,
      details: { name: specialization.name, department: dept.name },
      ipAddress: req.ip
    });

    return sendCreated(res, specialization, 'Specialization created successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/specializations/:id (Admin only)
const updateSpecialization = async (req, res, next) => {
  try {
    const { name, departmentId, description } = req.body;
    const specialization = await Specialization.findById(req.params.id);
    if (!specialization) {
      return sendError(res, 404, 'SPECIALIZATION_NOT_FOUND', 'Specialization not found');
    }

    if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (!dept) {
        return sendError(res, 404, 'DEPARTMENT_NOT_FOUND', 'Linked department not found');
      }
      specialization.departmentId = departmentId;
    }

    if (name) specialization.name = name.trim();
    if (description !== undefined) specialization.description = description.trim();
    await specialization.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_SPECIALIZATION',
      target: `Specialization:${specialization._id}`,
      details: { name: specialization.name },
      ipAddress: req.ip
    });

    return sendSuccess(res, specialization, 200, 'Specialization updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/specializations/:id (Admin only)
const deleteSpecialization = async (req, res, next) => {
  try {
    const specialization = await Specialization.findById(req.params.id);
    if (!specialization) {
      return sendError(res, 404, 'SPECIALIZATION_NOT_FOUND', 'Specialization not found');
    }

    await Specialization.findByIdAndDelete(specialization._id);

    await AuditLog.create({
      actor: req.user._id,
      action: 'DELETE_SPECIALIZATION',
      target: `Specialization:${specialization._id}`,
      details: { name: specialization.name },
      ipAddress: req.ip
    });

    return sendSuccess(res, null, 200, 'Specialization deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSpecializations,
  getSpecializationById,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization
};
