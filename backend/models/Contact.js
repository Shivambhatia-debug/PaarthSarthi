const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number']
  },
  type: {
    type: String,
    enum: ['callback', 'demo', 'inquiry', 'support', 'partnership', 'institution', 'startup-service'],
    default: 'inquiry'
  },
  subject: {
    type: String
  },
  message: {
    type: String,
    required: [true, 'Please provide a message']
  },
  // For institution inquiries
  institutionName: String,
  designation: String,
  studentCount: Number,
  // Status
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: String,
  resolvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
