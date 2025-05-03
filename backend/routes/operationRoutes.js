const express = require('express');
const router = express.Router();
const { 
  createOperation, 
  getOperations, 
  getOperationById, 
  updateOperation, 
  deleteOperation 
} = require('../controllers/operationController');
const { 
  getPosts, 
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Base operation routes
router.post('/', protect, adminOnly, createOperation);
router.get('/', getOperations);
router.get('/:id', getOperationById);
router.put('/:id', protect, adminOnly, updateOperation);
router.delete('/:id', protect, adminOnly, deleteOperation);

// Nested posts routes under operations
router.get('/:operationId/posts', getPosts);
router.post('/:operationId/posts', protect, adminOnly, createPost);
router.delete('/:operationId/posts/:id', protect, adminOnly, deletePost);
router.put('/:operationId/posts/:id', protect, adminOnly, updatePost);

module.exports = router;