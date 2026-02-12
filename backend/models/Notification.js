const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'meeting_booked',
      'meeting_confirmed',
      'meeting_cancelled',
      'meeting_reminder',
      'new_enrollment',
      'new_user',
      'new_contact',
      'callback_request',
      'payment_received',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // Related entity
  relatedModel: {
    type: String,
    enum: ['Meeting', 'Course', 'User', 'Alumni', 'Mentor', 'Contact']
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
