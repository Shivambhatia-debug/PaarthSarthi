const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: [true, 'Comment must belong to a post']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment must have an author']
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    enum: ['student', 'mentor', 'admin']
  },
  authorAvatar: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

module.exports = mongoose.model('Comment', commentSchema);
