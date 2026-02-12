const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide course title'],
    trim: true
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please provide course description']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Please provide course category'],
    enum: ['career-guidance', 'psychometric', 'skill-development', 'competitive-exams', 
           'personality-development', 'communication', 'technology', 'entrepreneurship', 'other']
  },
  language: {
    type: String,
    enum: ['hindi', 'english', 'both'],
    default: 'both'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // Target audience
  targetProgram: {
    type: String,
    enum: ['class-8-9', 'class-10-12', 'college-graduates', 'all'],
    default: 'all'
  },
  // Pricing
  price: {
    type: Number,
    required: [true, 'Please provide course price'],
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isFree: {
    type: Boolean,
    default: false
  },
  // Content
  modules: [{
    title: String,
    description: String,
    duration: String,
    lessons: [{
      title: String,
      type: {
        type: String,
        enum: ['video', 'article', 'quiz', 'assignment']
      },
      content: String,
      duration: String,
      isFree: { type: Boolean, default: false }
    }]
  }],
  totalDuration: {
    type: String
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  // Instructor
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  instructorName: String,
  // Features
  features: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  // Stats
  enrolledStudents: {
    type: Number,
    default: 0
  },
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
  // Webinar specific
  isWebinar: {
    type: Boolean,
    default: false
  },
  webinarDate: Date,
  webinarLink: String,
  // Status
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPromoted: {
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

// Create slug from title
courseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

courseSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Course', courseSchema);
