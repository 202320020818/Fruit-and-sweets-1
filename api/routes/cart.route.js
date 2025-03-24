import express from 'express';
import { getCartItems, addToCart, updateCartItemQuantity, deleteCartItem  } from '../controllers/cart.controller.js'; // Import the new updateCartItemQuantity controller

const router = express.Router();

// Route to add an item to the cart
router.post('/add-to-cart', addToCart);

// Route to get all cart items for a specific user
router.get('/items/:userId', getCartItems);

// Route to update item quantity in the cart
router.put('/item/:itemId', updateCartItemQuantity);

router.delete("/item/:userId/:itemId", deleteCartItem); // Delete item from cart


export default router;