const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Operation = require('../models/Operation');
const mongoose = require('mongoose');
const broadcast = require('../utils/webSocketService');

// @desc    Get all posts for an operation
// @route   GET /api/operations/:operationId/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
    // We check our operation ID and ensure its in the correct format
    const { operationId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(operationId)) {
      res.status(400).json({ success: false, message: 'Invalid operation ID format' });
      return;
    }
  
    // We then verify if the operation exists
    const operation = await Operation.findById(operationId);
    if (!operation) {
      res.status(404).json({ success: false, message: 'Operation not found' });
      return;
    }

    // We then set up the sorting and pagination controls of the returned data
  const sortBy = req.query.sort || '-createdAt';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // We fetch the posts
  const query = Post.find({ operation: operationId })
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate('author', 'username email')
    .populate('operation', 'name');
// We display the posts
  const posts = await query;
  const totalPosts = await Post.countDocuments({ operation: operationId });
// We return a 200 OK message
  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
    },
  });
});

// @desc    Create a new post in an operation
// @route   POST /api/operations/:operationId/posts
// @access  Private (Admin only)
// Similar logic to all creation code we've set up so far
const createPost = asyncHandler(async (req, res) => {
  const { operationId } = req.params;
  const { content, media } = req.body;
// We validate the operation ID format
  if (!mongoose.Types.ObjectId.isValid(operationId)) {
    res.status(400).json({ success: false, message: 'Invalid operation ID format' });
    return;
  }

  if (!content && media.length === 0) {
    res.status(400).json({ success: false, message: 'Content or media is required' });
    return;
  }
  // When content is passed we check if the operation exists
  const operation = await Operation.findById(operationId);
  if (!operation) {
    res.status(404).json({ success: false, message: 'Operation not found' });
    return;
  }
  // When that is checked we check the media lenght
  if (media && media.length > 5) {
    res.status(400).json({ success: false, message: 'Cannot upload more than 5 media items' });
    return;
  }
// If all the checks are passed we create the post 
  const post = await Post.create({
    content,
    media: media || [],
    operation: operationId,
    author: req.admin._id
  });


// We return the created post
  const populatedPost = await Post.findById(post._id)
    .populate('author', 'username email')
    .populate('operation', 'name');


    broadcast.postCreated(populatedPost);
// We return a 201 Created message
  res.status(201).json({
    success: true,
    data: populatedPost,
    message: 'Post created successfully'
  });

  // Activity logged for auditing purposes
  console.log(`Post created in operation ${operationId} by admin ${req.admin._id} at ${new Date().toISOString()}`);
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Admin only)
const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { content, media } = req.body;
// We validate the post ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid post ID format' });
    return;
  }

// We validate the post exists
  const existingPost = await Post.findById(id);
  if (!existingPost) {
    res.status(404).json({ success: false, message: 'Post not found' });
    return;
  }
// We validate the post belongs to the admin who can update it
  if (existingPost.author.toString() !== req.admin._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    return;
  }
// We update the fields with the new inputs
  const updateFields = {};
  if (content) updateFields.content = content;
  if (media) {
    // We check if the media lenght is appropriate
    if (media.length > 5) {
      res.status(400).json({ success: false, message: 'Cannot upload more than 5 media items' });
      return;
    }
    updateFields.media = media;
  }

  // If no field is updated in a PUT req we return a 400 Bad Request message
  if (Object.keys(updateFields).length === 0) {
    res.status(400).json({ success: false, message: 'At least one field must be updated' });
    return;
  }
// Otherwise we inject the new inputs in the database
  const updated = await Post.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  })
    .populate('author', 'username email')
    .populate('operation', 'name');

    // We log the activity
  console.log(`Post ${id} updated by admin ${req.admin._id} at ${new Date().toISOString()}`);
  // 200 OK message returned
  res.status(200).json({
    success: true,
    data: updated,
    message: 'Post updated successfully',
  });
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Admin only)
// Similar logic to update
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // We validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid post ID format' });
    return;
  }

  const post = await Post.findById(id);
  if (!post) {
    res.status(404).json({ success: false, message: 'Post not found' });
    return;
  }

  if (post.author.toString() !== req.admin._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    return;
  }

  await Post.deleteOne({ _id: id });

  console.log(`Post ${id} deleted by admin ${req.admin._id} at ${new Date().toISOString()}`);
  
  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
    deletedId: id,
  });
});

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
};