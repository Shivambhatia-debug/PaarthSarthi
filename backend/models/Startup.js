const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide startup name'],
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Please provide startup description']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  founder: {
    name: String,
    photo: String,
    bio: String,
    linkedIn: String
  },
  industry: {
    type: String,
    required: [true, 'Please provide industry']
  },
  stage: {
    type: String,
    enum: ['idea', 'mvp', 'early-stage', 'growth', 'scaling'],
    default: 'idea'
  },
  // Services offered by ParthSarthi to this startup
  services: [{
    type: String,
    enum: ['tech', 'marketing', 'strategy', 'design', 'finance', 'legal', 'mentoring', 'funding']
  }],
  // Startup details
  website: String,
  email: String,
  phone: String,
  location: String,
  foundedYear: Number,
  teamSize: Number,
  // Social
  linkedIn: String,
  twitter: String,
  instagram: String,
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Progress tracking
  milestones: [{
    title: String,
    description: String,
    date: Date,
    isCompleted: { type: Boolean, default: false }
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

startupSchema.index({ name: 'text', industry: 'text', description: 'text' });

module.exports = mongoose.model('Startup', startupSchema);
