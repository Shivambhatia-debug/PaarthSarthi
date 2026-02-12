const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide alumni name'],
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    lowercase: true
  },
  phone: {
    type: String
  },
  designation: {
    type: String,
    required: [true, 'Please provide designation']
  },
  company: {
    type: String
  },
  industry: {
    type: String
  },
  expertise: [{
    type: String
  }],
  experience: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  education: {
    type: String
  },
  linkedIn: {
    type: String
  },
  // Meeting booking related
  isAvailableForMeeting: {
    type: Boolean,
    default: true
  },
  meetingRate: {
    type: Number,
    default: 0
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalMeetings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Text index for search
alumniSchema.index({ name: 'text', designation: 'text', company: 'text', expertise: 'text' });

module.exports = mongoose.model('Alumni', alumniSchema);
