import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import CartItem from '../models/CartItemSchema.js';
import Wishlist from '../models/wishlist.model.js';

// Add item to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { userId, productId, name, price, image, description, category } = req.body;
    
    console.log('Received wishlist data:', { userId, productId, name, price, image, description, category });

    // Validate required fields
    if (!userId || !productId || !name || price === undefined || !image) {
      console.log('Missing required fields:', { userId, productId, name, price, image });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: {
          userId: !userId,
          productId: !productId,
          name: !name,
          price: price === undefined,
          image: !image
        }
      });
    }

    // Convert userId and productId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Check if item already exists in wishlist
    const existingItem = await Wishlist.findOne({ userId: userObjectId, productId: productObjectId });
    if (existingItem) {
      console.log('Item already exists in wishlist:', existingItem);
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }

    // Create new wishlist item
    const wishlistItem = new Wishlist({
      userId: userObjectId,
      productId: productObjectId,
      name: name.toString(),
      price: Number(price),
      image: image.toString(),
      description: description?.toString() || '',
      category: category?.toString() || ''
    });

    console.log('Saving wishlist item:', wishlistItem);

    const savedItem = await wishlistItem.save();
    console.log('Item saved to wishlist:', savedItem);

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: savedItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching wishlist for userId:', userId);

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // First, check if the user exists and has any items
    const count = await Wishlist.countDocuments({ userId: userObjectId });
    console.log('Total wishlist items count:', count);

    // Get all items without any limit
    const wishlistItems = await Wishlist.find({ userId: userObjectId }).sort({ createdAt: -1 });
    console.log('Found wishlist items:', wishlistItems.length);
    console.log('All items:', wishlistItems);

    if (!wishlistItems || wishlistItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No items found in wishlist',
        data: []
      });
    }

    // Log each item for debugging
    wishlistItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        _id: item._id,
        name: item.name,
        price: item.price,
        userId: item.userId
      });
    });

    res.status(200).json({
      success: true,
      message: 'Wishlist items retrieved successfully',
      data: wishlistItems
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist items',
      error: error.message
    });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    console.log('Removing from wishlist:', { userId, itemId });

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const deletedItem = await Wishlist.findOneAndDelete({ _id: itemId, userId: userObjectId });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    console.log('Item removed from wishlist:', deletedItem);

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist successfully',
      data: deletedItem
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
};

// Move item from wishlist to cart
export const moveToCart = async (req, res) => {
  const { itemId } = req.params;
  try {
    const wishlistItem = await Wishlist.findById(itemId);
    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist"
      });
    }

    // Create cart item
    const cartItem = new CartItem({
      userId: wishlistItem.userId,
      itemId: uuidv4(),
      name: wishlistItem.name,
      price: wishlistItem.price,
      image: wishlistItem.image,
      description: wishlistItem.description,
      category: wishlistItem.category,
      quantity: 1
    });

    await cartItem.save();
    await Wishlist.findByIdAndDelete(itemId);

    res.status(200).json({
      success: true,
      message: "Item moved to cart successfully",
      data: cartItem
    });
  } catch (error) {
    console.error("Error moving item to cart:", error);
    res.status(500).json({
      success: false,
      message: "Error moving item to cart",
      error: error.message
    });
  }
};
