const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  // Who booked the meeting
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    required: [true, 'Please provide your name']
  },
  userEmail: {
    type: String,
    required: [true, 'Please provide your email']
  },
  userPhone: {
    type: String,
    required: [true, 'Please provide your phone number']
  },
  // Meeting with whom (alumni or mentor)
  meetingWith: {
    type: String,
    enum: ['alumni', 'mentor'],
    required: [true, 'Please specify meeting type']
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni'
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  meetingPersonName: {
    type: String
  },
  // Meeting details
  subject: {
    type: String,
    required: [true, 'Please provide meeting subject']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please provide meeting date']
  },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  duration: {
    type: Number,
    default: 30,
    enum: [15, 30, 45, 60]
  },
  meetingType: {
    type: String,
    enum: ['video', 'audio', 'in-person'],
    default: 'video'
  },
  meetingLink: {
    type: String
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  // Payment
  amount: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  // Feedback
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  feedback: {
    type: String
  },
  // Admin notes
  adminNotes: {
    type: String
  },
  // Cancellation
  cancelReason: String,
  cancelledBy: {
    type: String,
    enum: ['user', 'admin', 'mentor', 'alumni']
  }
}, {
  timestamps: true
});

meetingSchema.index({ date: 1, status: 1 });
meetingSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
