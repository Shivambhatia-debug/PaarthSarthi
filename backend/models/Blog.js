const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide blog title'],
    trim: true
  },
  slug: String,
  content: {
    type: String,
    required: [true, 'Please provide blog content']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Please provide blog category'],
    enum: ['career-tips', 'exam-preparation', 'skill-development', 'success-stories', 
           'industry-insights', 'mentorship', 'wellness', 'technology', 'startup', 'other']
  },
  tags: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: String,
  // Stats
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  // Status
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: Date
}, {
  timestamps: true
});

blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

blogSchema.index({ title: 'text', content: 'text', tags: 'text', category: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
