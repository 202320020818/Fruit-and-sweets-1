import express from 'express';
import { addToWishlist, getWishlistItems, deleteWishlistItem } from '../controllers/wishlist.controller.js';

const router = express.Router();

router.post('/add', addToWishlist);
router.get('/:userId', getWishlistItems);
router.delete('/:userId/:itemId', deleteWishlistItem);

export default router;
