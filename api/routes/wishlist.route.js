import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';

const router = express.Router();

// Add item to wishlist
router.post('/add', addToWishlist);

// Get user's wishlist
router.get('/:userId', getWishlist);

// Remove item from wishlist
router.delete('/:userId/:itemId', removeFromWishlist);

export default router;
