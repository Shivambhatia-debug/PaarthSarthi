const Alumni = require('../models/Alumni');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Get all alumni
// @route   GET /api/alumni
// @access  Public
exports.getAlumni = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, industry, expertise, available } = req.query;

    let query = { isActive: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (industry) query.industry = industry;
    if (expertise) query.expertise = { $in: expertise.split(',') };
    if (available === 'true') query.isAvailableForMeeting = true;

    const total = await Alumni.countDocuments(query);
    const alumni = await Alumni.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      alumni,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get single alumni
// @route   GET /api/alumni/:id
// @access  Public
exports.getAlumniById = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return sendError(res, 404, 'Alumni not found');
    }
    sendResponse(res, 200, { alumni });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Create alumni (Admin only)
// @route   POST /api/alumni
// @access  Private/Admin
exports.createAlumni = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;

    // Handle photo upload
    if (req.file) {
      req.body.photo = `/uploads/alumni/${req.file.filename}`;
    }

    const alumni = await Alumni.create(req.body);

    sendResponse(res, 201, { alumni }, 'Alumni added successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update alumni (Admin only)
// @route   PUT /api/alumni/:id
// @access  Private/Admin
exports.updateAlumni = async (req, res) => {
  try {
    // Handle photo upload
    if (req.file) {
      req.body.photo = `/uploads/alumni/${req.file.filename}`;
    }

    const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!alumni) {
      return sendError(res, 404, 'Alumni not found');
    }

    sendResponse(res, 200, { alumni }, 'Alumni updated successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete alumni (Admin only)
// @route   DELETE /api/alumni/:id
// @access  Private/Admin
exports.deleteAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return sendError(res, 404, 'Alumni not found');
    }

    await alumni.deleteOne();

    sendResponse(res, 200, {}, 'Alumni removed successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Toggle alumni active status (Admin only)
// @route   PATCH /api/alumni/:id/toggle
// @access  Private/Admin
exports.toggleAlumniStatus = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return sendError(res, 404, 'Alumni not found');
    }

    alumni.isActive = !alumni.isActive;
    await alumni.save();

    sendResponse(res, 200, { alumni }, `Alumni ${alumni.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
