const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Create a community post
// @route   POST /api/community/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, category, tags, images } = req.body;

    const post = await CommunityPost.create({
      author: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.avatar || '',
      content,
      category: category || 'general',
      tags: tags || [],
      images: images || []
    });

    sendResponse(res, 201, { post }, 'Post created successfully');
  } catch (error) {
    console.error('Create post error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get community posts (feed)
// @route   GET /api/community/posts
// @access  Private
exports.getPosts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, search, author } = req.query;

    let query = { isActive: true };

    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };
    if (author) query.author = author;

    const total = await CommunityPost.countDocuments(query);
    const posts = await CommunityPost.find(query)
      .populate('author', 'name avatar role')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add isLiked flag for current user
    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.includes(req.user.id);
      return postObj;
    });

    sendResponse(res, 200, {
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get single post
// @route   GET /api/community/posts/:id
// @access  Private
exports.getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'name avatar role bio');

    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    const postObj = post.toObject();
    postObj.isLiked = post.likes.includes(req.user.id);

    sendResponse(res, 200, { post: postObj });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/community/posts/:id/like
// @access  Private
exports.toggleLikePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    const userId = req.user.id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like
      post.likes.push(userId);
      post.likesCount += 1;
    }

    await post.save();

    sendResponse(res, 200, {
      likesCount: post.likesCount,
      isLiked: likeIndex === -1
    }, likeIndex > -1 ? 'Post unliked' : 'Post liked');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete a post
// @route   DELETE /api/community/posts/:id
// @access  Private (own post or admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    // Only author or admin can delete
    if (post.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to delete this post');
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    // Also soft-delete associated comments
    await Comment.updateMany({ post: req.params.id }, { isActive: false });

    sendResponse(res, 200, {}, 'Post deleted successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Create a comment on a post
// @route   POST /api/community/posts/:id/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.avatar || '',
      content,
      parentComment: parentComment || null
    });

    // Update comment count on post
    post.commentsCount += 1;
    await post.save();

    // Populate for response
    const populated = await Comment.findById(comment._id)
      .populate('author', 'name avatar role');

    sendResponse(res, 201, { comment: populated }, 'Comment added');
  } catch (error) {
    console.error('Create comment error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get comments for a post
// @route   GET /api/community/posts/:id/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const total = await Comment.countDocuments({
      post: req.params.id,
      isActive: true,
      parentComment: null
    });

    const comments = await Comment.find({
      post: req.params.id,
      isActive: true,
      parentComment: null
    })
      .populate('author', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
          isActive: true
        })
          .populate('author', 'name avatar role')
          .sort({ createdAt: 1 })
          .limit(5);

        const commentObj = comment.toObject();
        commentObj.replies = replies;
        commentObj.isLiked = comment.likes.includes(req.user.id);
        return commentObj;
      })
    );

    sendResponse(res, 200, {
      comments: commentsWithReplies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Like/Unlike a comment
// @route   POST /api/community/comments/:id/like
// @access  Private
exports.toggleLikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    const userId = req.user.id;
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      comment.likes.push(userId);
      comment.likesCount += 1;
    }

    await comment.save();

    sendResponse(res, 200, {
      likesCount: comment.likesCount,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/community/comments/:id
// @access  Private (own comment or admin)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    if (comment.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to delete this comment');
    }

    comment.isActive = false;
    await comment.save();

    // Decrement comment count on post
    await CommunityPost.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 }
    });

    sendResponse(res, 200, {}, 'Comment deleted');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
