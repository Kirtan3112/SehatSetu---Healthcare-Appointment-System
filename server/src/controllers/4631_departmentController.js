const Department = require('../models/4631_Department');
const Specialization = require('../models/4631_Specialization');
const AuditLog = require('../models/4631_AuditLog');
const { sendSuccess, sendCreated, sendError } = require('../utils/4631_responseEnvelope');

// GET /api/departments
const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return sendSuccess(res, departments);
  } catch (error) {
    next(error);
  }
};

// GET /api/departments/:id
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 404, 'DEPARTMENT_NOT_FOUND', 'Department not found');
    }
    return sendSuccess(res, department);
  } catch (error) {
    next(error);
  }
};

// POST /api/departments (Admin only)
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return sendError(res, 400, 'MISSING_NAME', 'Department name is required');
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return sendError(res, 409, 'DEPARTMENT_EXISTS', 'A department with this name already exists');
    }

    const department = await Department.create({
      name: name.trim(),
      description: description || ''
    });

    await AuditLog.create({
      actor: req.user._id,
      action: 'CREATE_DEPARTMENT',
      target: `Department:${department._id}`,
      details: { name: department.name },
      ipAddress: req.ip
    });

    return sendCreated(res, department, 'Department created successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/departments/:id (Admin only)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 404, 'DEPARTMENT_NOT_FOUND', 'Department not found');
    }

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description.trim();
    await department.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_DEPARTMENT',
      target: `Department:${department._id}`,
      details: { name: department.name },
      ipAddress: req.ip
    });

    return sendSuccess(res, department, 200, 'Department updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/departments/:id (Admin only)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 404, 'DEPARTMENT_NOT_FOUND', 'Department not found');
    }

    // Check if specializations reference this department
    const linkedSpec = await Specialization.findOne({ departmentId: department._id });
    if (linkedSpec) {
      return sendError(res, 400, 'DEPARTMENT_HAS_LINKED_SPECIALIZATIONS', 'Cannot delete department with active linked specializations.');
    }

    await Department.findByIdAndDelete(department._id);

    await AuditLog.create({
      actor: req.user._id,
      action: 'DELETE_DEPARTMENT',
      target: `Department:${department._id}`,
      details: { name: department.name },
      ipAddress: req.ip
    });

    return sendSuccess(res, null, 200, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
