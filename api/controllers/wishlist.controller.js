import { v4 as uuidv4 } from 'uuid';
import WishlistItem from "../models/WishlistSchema.js";

export const addToWishlist = async (req, res) => {
  const { userId, name, price, image, description, category, customCategory, priority, createdBy, updatedBy } = req.body;
  const itemId = uuidv4();

  try {
    const newItem = new WishlistItem({
      userId,
      itemId,
      name,
      price,
      image,
      description,
      category,
      customCategory,
      priority,
      createdBy,
      updatedBy,
    });

    await newItem.save();
    res.status(201).json({ success: true, message: "Item added to wishlist", data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add to wishlist", error: error.message });
  }
};

export const getWishlistItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const items = await WishlistItem.find({ userId }).sort({ priority: 1 }); // High > Medium > Low
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch wishlist", error: error.message });
  }
};

export const deleteWishlistItem = async (req, res) => {
  const { userId, itemId } = req.params;
  try {
    const item = await WishlistItem.findOneAndDelete({ userId, itemId });
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.status(200).json({ success: true, message: "Item removed from wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete item", error: error.message });
  }
};
