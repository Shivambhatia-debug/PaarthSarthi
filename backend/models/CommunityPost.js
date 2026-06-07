const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post must have an author']
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    required: true
  },
  authorAvatar: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [5000, 'Post cannot exceed 5000 characters']
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['discussion', 'question', 'success-story', 'resource', 'announcement', 'general']
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ category: 1 });
communityPostSchema.index({ content: 'text', tags: 'text' });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
