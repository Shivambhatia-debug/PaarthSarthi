const User = require('../models/User');
const Alumni = require('../models/Alumni');
const Mentor = require('../models/Mentor');
const Course = require('../models/Course');
const Meeting = require('../models/Meeting');
const Blog = require('../models/Blog');
const Startup = require('../models/Startup');
const Contact = require('../models/Contact');
const Notification = require('../models/Notification');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalMentorUsers,
      totalAlumni,
      totalMentors,
      totalCourses,
      totalStartups,
      totalBlogs,
      totalMeetings,
      pendingMeetings,
      totalContacts,
      newContacts,
      unreadNotifications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'mentor' }),
      Alumni.countDocuments({ isActive: true }),
      Mentor.countDocuments({ isActive: true }),
      Course.countDocuments({ isPublished: true }),
      Startup.countDocuments({ isActive: true }),
      Blog.countDocuments({ isPublished: true }),
      Meeting.countDocuments(),
      Meeting.countDocuments({ status: 'pending' }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Notification.countDocuments({ recipient: req.user.id, isRead: false })
    ]);

    // Recent meetings
    const recentMeetings = await Meeting.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('alumni', 'name')
      .populate('mentor', 'name');

    // Recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    sendResponse(res, 200, {
      stats: {
        totalUsers,
        totalStudents,
        totalMentorUsers,
        totalAlumni,
        totalMentors,
        totalCourses,
        totalStartups,
        totalBlogs,
        totalMeetings,
        pendingMeetings,
        totalContacts,
        newContacts,
        unreadNotifications
      },
      recentMeetings,
      recentContacts,
      recentUsers
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { role, search, active } = req.query;

    let query = {};
    if (role) query.role = role;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    sendResponse(res, 200, {
      users,
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

// @desc    Update user role/status (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    const updateData = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, { user }, 'User updated');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Don't allow deleting self
    if (user._id.toString() === req.user.id) {
      return sendError(res, 400, 'Cannot delete your own account');
    }

    await user.deleteOne();
    sendResponse(res, 200, {}, 'User deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Create admin user
// @route   POST /api/admin/create-admin
// @access  Private/Admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email already exists');
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      isVerified: true
    });

    sendResponse(res, 201, {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }, 'Admin created successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
