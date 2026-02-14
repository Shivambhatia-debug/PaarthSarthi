const Admission = require('../models/Admission');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Submit admission form (public)
// @route   POST /api/admissions
exports.createAdmission = async (req, res) => {
  try {
    const admission = await Admission.create(req.body);
    sendResponse(res, 201, { admission }, 'Admission form submitted successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get all admissions (admin)
// @route   GET /api/admissions
exports.getAdmissions = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, coaching, course } = req.query;
    let query = {};
    if (status) query.status = status;
    if (coaching) query.coachingInstitute = new RegExp(coaching, 'i');
    if (course) query.course = new RegExp(course, 'i');

    const total = await Admission.countDocuments(query);
    const admissions = await Admission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    sendResponse(res, 200, {
      admissions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update admission status/notes (admin)
// @route   PUT /api/admissions/:id
exports.updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!admission) return sendError(res, 404, 'Admission not found');
    sendResponse(res, 200, { admission }, 'Updated');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete admission (admin)
// @route   DELETE /api/admissions/:id
exports.deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) return sendError(res, 404, 'Admission not found');
    sendResponse(res, 200, null, 'Deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
