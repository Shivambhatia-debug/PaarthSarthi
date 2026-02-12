const Course = require('../models/Course');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, category, language, level, program, free, featured, promoted } = req.query;

    let query = { isPublished: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (language) query.language = language;
    if (level) query.level = level;
    if (program) query.targetProgram = { $in: [program, 'all'] };
    if (free === 'true') query.isFree = true;
    if (featured === 'true') query.isFeatured = true;
    if (promoted === 'true') query.isPromoted = true;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name photo')
      .sort({ isPromoted: -1, isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      courses,
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

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name photo bio specialization');

    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    sendResponse(res, 200, { course });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get course by slug
// @route   GET /api/courses/slug/:slug
// @access  Public
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', 'name photo bio specialization');

    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    sendResponse(res, 200, { course });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Create course (Admin only)
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;

    if (req.file) {
      req.body.thumbnail = `/uploads/courses/${req.file.filename}`;
    }

    const course = await Course.create(req.body);

    sendResponse(res, 201, { course }, 'Course created successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update course (Admin only)
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    if (req.file) {
      req.body.thumbnail = `/uploads/courses/${req.file.filename}`;
    }

    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    sendResponse(res, 200, { course }, 'Course updated successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete course (Admin only)
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    await course.deleteOne();

    sendResponse(res, 200, {}, 'Course deleted successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get webinars
// @route   GET /api/courses/webinars
// @access  Public
exports.getWebinars = async (req, res) => {
  try {
    const webinars = await Course.find({
      isWebinar: true,
      isPublished: true,
      webinarDate: { $gte: new Date() }
    })
    .sort({ webinarDate: 1 })
    .limit(10);

    sendResponse(res, 200, { webinars });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Toggle course publish status
// @route   PATCH /api/courses/:id/publish
// @access  Private/Admin
exports.togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    course.isPublished = !course.isPublished;
    await course.save();

    sendResponse(res, 200, { course }, `Course ${course.isPublished ? 'published' : 'unpublished'}`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
