const User = require('../models/User');
const { sendResponse, sendError, notifyAdmins } = require('../utils/helpers');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, language, interests, currentEducation, institution, location, yearOfStudy, stream } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'student',
      language,
      interests,
      currentEducation,
      institution,
      location,
      yearOfStudy,
      stream
    });

    // Notify admins about new user
    await notifyAdmins({
      type: 'new_user',
      title: 'New User Registration',
      message: `${user.name} (${user.email}) has registered as ${user.role}`,
      relatedModel: 'User',
      relatedId: user._id
    });

    // Send token
    const token = user.getSignedJwtToken();

    sendResponse(res, 201, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        language: user.language,
        currentEducation: user.currentEducation,
        institution: user.institution,
        location: user.location,
        yearOfStudy: user.yearOfStudy,
        stream: user.stream
      }
    }, 'Registration successful');

  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 500, error.message || 'Server error');
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    // Check user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if active
    if (!user.isActive) {
      return sendError(res, 401, 'Account is deactivated. Contact admin.');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = user.getSignedJwtToken();

    sendResponse(res, 200, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        language: user.language,
        currentEducation: user.currentEducation,
        institution: user.institution,
        location: user.location,
        yearOfStudy: user.yearOfStudy,
        stream: user.stream
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Server error');
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    sendResponse(res, 200, { user });
  } catch (error) {
    sendError(res, 500, 'Server error');
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      language: req.body.language,
      interests: req.body.interests
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    sendResponse(res, 200, { user }, 'Profile updated');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    const token = user.getSignedJwtToken();

    sendResponse(res, 200, { token }, 'Password changed successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
