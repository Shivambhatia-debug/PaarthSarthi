const Notification = require('../models/Notification');

// Create notification helper
const createNotification = async ({ recipient, type, title, message, relatedModel, relatedId }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedModel,
      relatedId
    });

    // Send push notification if user has registered an Expo push token
    const User = require('../models/User');
    const user = await User.findById(recipient).select('fcmToken');
    if (user && user.fcmToken && user.fcmToken.startsWith('ExponentPushToken[')) {
      try {
        fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            to: user.fcmToken,
            sound: 'default',
            title: title || 'New Notification',
            body: message || '',
            data: { type, relatedModel, relatedId },
          }),
        }).catch(err => console.error('Background push fetch failed:', err));
        console.log(`Push notification queued for user ${recipient}`);
      } catch (pushErr) {
        console.error('Error initiating Expo push notification:', pushErr);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Notify all admins
const notifyAdmins = async ({ type, title, message, relatedModel, relatedId }) => {
  const User = require('../models/User');
  try {
    const admins = await User.find({ role: 'admin', isActive: true });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type,
      title,
      message,
      relatedModel,
      relatedId
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    return true;
  } catch (error) {
    console.error('Error notifying admins:', error);
    return false;
  }
};

// Pagination helper
const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// API Response helper
const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

// Error Response helper
const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  createNotification,
  notifyAdmins,
  getPagination,
  sendResponse,
  sendError
};
