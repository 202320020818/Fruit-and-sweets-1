import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createComment,
  deleteComment,
  editComment,
  getPostComments,
  getcomments,
  likeComment,
} from '../controllers/comment.controller.js';

const router = express.Router();

// Create a new comment (requires authentication)
router.post('/create', verifyToken, createComment);

// Get all comments for a specific post
router.get('/getPostComments/:postId', getPostComments);

// Like or unlike a comment (toggle behavior)
router.put('/likeComment/:commentId', verifyToken, likeComment);

// Edit a comment (only by author or admin)
router.put('/editComment/:commentId', verifyToken, editComment);

// Delete a comment (only by author or admin)
router.delete('/deleteComment/:commentId', verifyToken, deleteComment);

// Admin-only: Get all comments for dashboard with pagination
router.get('/getcomments', verifyToken, getcomments);

export default router;
