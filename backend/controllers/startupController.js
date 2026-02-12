const Startup = require('../models/Startup');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Get all startups
// @route   GET /api/startups
// @access  Public
exports.getStartups = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, industry, stage, featured } = req.query;

    let query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (industry) query.industry = industry;
    if (stage) query.stage = stage;
    if (featured === 'true') query.isFeatured = true;

    const total = await Startup.countDocuments(query);
    const startups = await Startup.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      startups,
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

// @desc    Get single startup
// @route   GET /api/startups/:id
// @access  Public
exports.getStartupById = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return sendError(res, 404, 'Startup not found');
    }
    sendResponse(res, 200, { startup });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Create startup (Admin only)
// @route   POST /api/startups
// @access  Private/Admin
exports.createStartup = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;

    if (req.file) {
      req.body.logo = req.body.logo || `/uploads/startups/${req.file.filename}`;
    }

    const startup = await Startup.create(req.body);

    sendResponse(res, 201, { startup }, 'Startup added successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update startup (Admin only)
// @route   PUT /api/startups/:id
// @access  Private/Admin
exports.updateStartup = async (req, res) => {
  try {
    if (req.file) {
      req.body.logo = req.body.logo || `/uploads/startups/${req.file.filename}`;
    }

    const startup = await Startup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!startup) {
      return sendError(res, 404, 'Startup not found');
    }

    sendResponse(res, 200, { startup }, 'Startup updated successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete startup (Admin only)
// @route   DELETE /api/startups/:id
// @access  Private/Admin
exports.deleteStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return sendError(res, 404, 'Startup not found');
    }

    await startup.deleteOne();

    sendResponse(res, 200, {}, 'Startup deleted successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Add milestone to startup
// @route   POST /api/startups/:id/milestones
// @access  Private/Admin
exports.addMilestone = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return sendError(res, 404, 'Startup not found');
    }

    startup.milestones.push(req.body);
    await startup.save();

    sendResponse(res, 200, { startup }, 'Milestone added');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
