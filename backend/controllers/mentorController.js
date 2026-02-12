const Mentor = require('../models/Mentor');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
exports.getMentors = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, subject, language, priceMin, priceMax, program, available, featured } = req.query;

    let query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (subject) query.subjects = { $in: subject.split(',') };
    if (language) query.languages = { $in: language.split(',') };
    if (program) query.targetProgram = { $in: [program, 'all'] };
    if (available === 'true') query.isAvailable = true;
    if (featured === 'true') query.isFeatured = true;

    // Price range
    if (priceMin || priceMax) {
      query.sessionPrice = {};
      if (priceMin) query.sessionPrice.$gte = parseInt(priceMin);
      if (priceMax) query.sessionPrice.$lte = parseInt(priceMax);
    }

    const total = await Mentor.countDocuments(query);
    const mentors = await Mentor.find(query)
      .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      mentors,
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

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return sendError(res, 404, 'Mentor not found');
    }
    sendResponse(res, 200, { mentor });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Create mentor (Admin only)
// @route   POST /api/mentors
// @access  Private/Admin
exports.createMentor = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;

    if (req.file) {
      req.body.photo = req.body.photo || `/uploads/mentors/${req.file.filename}`;
    }

    const mentor = await Mentor.create(req.body);

    sendResponse(res, 201, { mentor }, 'Mentor added successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update mentor (Admin only)
// @route   PUT /api/mentors/:id
// @access  Private/Admin
exports.updateMentor = async (req, res) => {
  try {
    if (req.file) {
      req.body.photo = req.body.photo || `/uploads/mentors/${req.file.filename}`;
    }

    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!mentor) {
      return sendError(res, 404, 'Mentor not found');
    }

    sendResponse(res, 200, { mentor }, 'Mentor updated successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete mentor (Admin only)
// @route   DELETE /api/mentors/:id
// @access  Private/Admin
exports.deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return sendError(res, 404, 'Mentor not found');
    }

    await mentor.deleteOne();

    sendResponse(res, 200, {}, 'Mentor removed successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Toggle mentor status (Admin only)
// @route   PATCH /api/mentors/:id/toggle
// @access  Private/Admin
exports.toggleMentorStatus = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return sendError(res, 404, 'Mentor not found');
    }

    mentor.isActive = !mentor.isActive;
    await mentor.save();

    sendResponse(res, 200, { mentor }, `Mentor ${mentor.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get featured mentors
// @route   GET /api/mentors/featured
// @access  Public
exports.getFeaturedMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true, isFeatured: true })
      .sort({ rating: -1 })
      .limit(6);

    sendResponse(res, 200, { mentors });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
