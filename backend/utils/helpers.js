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
