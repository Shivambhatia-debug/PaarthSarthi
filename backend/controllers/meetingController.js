const Meeting = require('../models/Meeting');
const Alumni = require('../models/Alumni');
const Mentor = require('../models/Mentor');
const { sendResponse, sendError, getPagination, notifyAdmins, createNotification } = require('../utils/helpers');

// @desc    Book a meeting
// @route   POST /api/meetings
// @access  Public (or Private)
exports.bookMeeting = async (req, res) => {
  try {
    const {
      userName, userEmail, userPhone,
      meetingWith, alumniId, mentorId,
      subject, description, date, timeSlot, duration, meetingType
    } = req.body;

    // Build meeting data
    const meetingData = {
      userName,
      userEmail,
      userPhone,
      meetingWith,
      subject,
      description,
      date,
      timeSlot,
      duration: duration || 30,
      meetingType: meetingType || 'video'
    };

    // Set user if authenticated
    if (req.user) {
      meetingData.user = req.user.id;
    }

    // Set alumni or mentor
    if (meetingWith === 'alumni' && alumniId) {
      const alumni = await Alumni.findById(alumniId);
      if (!alumni) return sendError(res, 404, 'Alumni not found');
      meetingData.alumni = alumniId;
      meetingData.meetingPersonName = alumni.name;
      meetingData.amount = alumni.meetingRate || 0;
    } else if (meetingWith === 'mentor' && mentorId) {
      const mentor = await Mentor.findById(mentorId);
      if (!mentor) return sendError(res, 404, 'Mentor not found');
      meetingData.mentor = mentorId;
      meetingData.meetingPersonName = mentor.name;
      meetingData.amount = mentor.sessionPrice || 0;
    }

    const meeting = await Meeting.create(meetingData);

    // Notify all admins about new meeting booking
    await notifyAdmins({
      type: 'meeting_booked',
      title: 'New Meeting Booked!',
      message: `${userName} (${userPhone}) has booked a meeting with ${meetingData.meetingPersonName || 'N/A'} on ${new Date(date).toLocaleDateString()} - Subject: ${subject}`,
      relatedModel: 'Meeting',
      relatedId: meeting._id
    });

    sendResponse(res, 201, { meeting }, 'Meeting booked successfully! Admin will confirm shortly.');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get all meetings (Admin)
// @route   GET /api/meetings
// @access  Private/Admin
exports.getMeetings = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, meetingWith, date } = req.query;

    let query = {};

    if (status) query.status = status;
    if (meetingWith) query.meetingWith = meetingWith;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const total = await Meeting.countDocuments(query);
    const meetings = await Meeting.find(query)
      .populate('user', 'name email phone')
      .populate('alumni', 'name photo designation')
      .populate('mentor', 'name photo designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      meetings,
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

// @desc    Get user's meetings
// @route   GET /api/meetings/my
// @access  Private
exports.getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ user: req.user.id })
      .populate('alumni', 'name photo designation')
      .populate('mentor', 'name photo designation')
      .sort({ date: -1 });

    sendResponse(res, 200, { meetings });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private
exports.getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('alumni', 'name photo designation email phone')
      .populate('mentor', 'name photo designation email phone');

    if (!meeting) {
      return sendError(res, 404, 'Meeting not found');
    }

    sendResponse(res, 200, { meeting });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update meeting status (Admin)
// @route   PUT /api/meetings/:id/status
// @access  Private/Admin
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { status, meetingLink, adminNotes, cancelReason } = req.body;

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return sendError(res, 404, 'Meeting not found');
    }

    meeting.status = status;
    if (meetingLink) meeting.meetingLink = meetingLink;
    if (adminNotes) meeting.adminNotes = adminNotes;
    if (cancelReason) {
      meeting.cancelReason = cancelReason;
      meeting.cancelledBy = 'admin';
    }

    await meeting.save();

    // Notify user about status change
    if (meeting.user) {
      const statusMessages = {
        confirmed: `Your meeting with ${meeting.meetingPersonName} has been confirmed!`,
        cancelled: `Your meeting with ${meeting.meetingPersonName} has been cancelled. Reason: ${cancelReason || 'N/A'}`,
        rescheduled: `Your meeting with ${meeting.meetingPersonName} has been rescheduled.`
      };

      if (statusMessages[status]) {
        await createNotification({
          recipient: meeting.user,
          type: `meeting_${status}`,
          title: `Meeting ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: statusMessages[status],
          relatedModel: 'Meeting',
          relatedId: meeting._id
        });
      }
    }

    sendResponse(res, 200, { meeting }, `Meeting ${status}`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Cancel meeting (User)
// @route   PUT /api/meetings/:id/cancel
// @access  Private
exports.cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return sendError(res, 404, 'Meeting not found');
    }

    // Only allow user to cancel their own meeting
    if (meeting.user && meeting.user.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized');
    }

    meeting.status = 'cancelled';
    meeting.cancelReason = req.body.reason || 'Cancelled by user';
    meeting.cancelledBy = 'user';
    await meeting.save();

    // Notify admins
    await notifyAdmins({
      type: 'meeting_cancelled',
      title: 'Meeting Cancelled',
      message: `${meeting.userName} has cancelled their meeting with ${meeting.meetingPersonName}`,
      relatedModel: 'Meeting',
      relatedId: meeting._id
    });

    sendResponse(res, 200, { meeting }, 'Meeting cancelled');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Add feedback to meeting
// @route   PUT /api/meetings/:id/feedback
// @access  Private
exports.addFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return sendError(res, 404, 'Meeting not found');
    }

    meeting.rating = rating;
    meeting.feedback = feedback;
    await meeting.save();

    // Update alumni/mentor rating
    if (meeting.alumni) {
      const alumni = await Alumni.findById(meeting.alumni);
      if (alumni) {
        const newRating = ((alumni.rating * alumni.totalMeetings) + rating) / (alumni.totalMeetings + 1);
        alumni.rating = Math.round(newRating * 10) / 10;
        alumni.totalMeetings += 1;
        await alumni.save();
      }
    }

    if (meeting.mentor) {
      const mentor = await Mentor.findById(meeting.mentor);
      if (mentor) {
        const newRating = ((mentor.rating * mentor.totalReviews) + rating) / (mentor.totalReviews + 1);
        mentor.rating = Math.round(newRating * 10) / 10;
        mentor.totalReviews += 1;
        await mentor.save();
      }
    }

    sendResponse(res, 200, { meeting }, 'Feedback submitted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
