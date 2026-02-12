const Notification = require('../models/Notification');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { unread } = req.query;

    let query = { recipient: req.user.id };
    if (unread === 'true') query.isRead = false;

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      notifications,
      unreadCount,
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

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    if (notification.recipient.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    sendResponse(res, 200, { notification }, 'Marked as read');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    sendResponse(res, 200, {}, 'All notifications marked as read');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    if (notification.recipient.toString() !== req.user.id) {
      return sendError(res, 403, 'Not authorized');
    }

    await notification.deleteOne();

    sendResponse(res, 200, {}, 'Notification deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id, 
      isRead: false 
    });

    sendResponse(res, 200, { unreadCount: count });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
