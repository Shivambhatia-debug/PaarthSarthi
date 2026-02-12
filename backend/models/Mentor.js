const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide mentor name'],
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
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
  specialization: [{
    type: String
  }],
  subjects: [{
    type: String
  }],
  languages: [{
    type: String,
    default: ['Hindi', 'English']
  }],
  experience: {
    type: Number,
    default: 0
  },
  qualifications: [{
    type: String
  }],
  certifications: [{
    type: String
  }],
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  // Pricing
  sessionPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  // Session types
  sessionTypes: [{
    type: String,
    enum: ['video', 'audio', 'chat', 'in-person']
  }],
  // Stats
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  // Target audience
  targetProgram: {
    type: String,
    enum: ['class-8-9', 'class-10-12', 'college-graduates', 'all'],
    default: 'all'
  },
  // Social links
  linkedIn: String,
  twitter: String,
  website: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

mentorSchema.index({ name: 'text', specialization: 'text', subjects: 'text', designation: 'text' });

module.exports = mongoose.model('Mentor', mentorSchema);
