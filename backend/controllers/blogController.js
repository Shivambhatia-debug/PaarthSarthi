const Blog = require('../models/Blog');
const { sendResponse, sendError, getPagination } = require('../utils/helpers');

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, category, tag, featured } = req.query;

    let query = { isPublished: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (tag) query.tags = { $in: tag.split(',') };
    if (featured === 'true') query.isFeatured = true;

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendResponse(res, 200, {
      blogs,
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

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name avatar bio');

    if (!blog) {
      return sendError(res, 404, 'Blog not found');
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    sendResponse(res, 200, { blog });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'name avatar bio');

    if (!blog) {
      return sendError(res, 404, 'Blog not found');
    }

    blog.views += 1;
    await blog.save();

    sendResponse(res, 200, { blog });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Create blog (Admin)
// @route   POST /api/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
  try {
    req.body.author = req.user.id;
    req.body.authorName = req.user.name;

    if (req.file) {
      req.body.thumbnail = req.body.thumbnail || `/uploads/blogs/${req.file.filename}`;
    }

    if (req.body.isPublished) {
      req.body.publishedAt = new Date();
    }

    const blog = await Blog.create(req.body);

    sendResponse(res, 201, { blog }, 'Blog created successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update blog (Admin)
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
  try {
    if (req.file) {
      req.body.thumbnail = req.body.thumbnail || `/uploads/blogs/${req.file.filename}`;
    }

    // If publishing for first time
    const existingBlog = await Blog.findById(req.params.id);
    if (existingBlog && !existingBlog.isPublished && req.body.isPublished) {
      req.body.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!blog) {
      return sendError(res, 404, 'Blog not found');
    }

    sendResponse(res, 200, { blog }, 'Blog updated successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete blog (Admin)
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return sendError(res, 404, 'Blog not found');
    }

    await blog.deleteOne();

    sendResponse(res, 200, {}, 'Blog deleted successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Like a blog
// @route   POST /api/blogs/:id/like
// @access  Public
exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return sendError(res, 404, 'Blog not found');
    }

    blog.likes += 1;
    await blog.save();

    sendResponse(res, 200, { likes: blog.likes }, 'Blog liked');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get blog categories with count
// @route   GET /api/blogs/categories
// @access  Public
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    sendResponse(res, 200, { categories });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
