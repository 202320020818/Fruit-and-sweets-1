import { v4 as uuidv4 } from 'uuid'; 
import CartItem from "../models/CartItemSchema.js";

// Add item to the cart
export const addToCart = async (req, res) => {
  const { userId, itemName, price, image, createdBy, updatedBy, description, category, quantity = 1 } = req.body;
  const itemId = uuidv4();
  try {
    const newCartItem = new CartItem({
      userId, 
      itemId, 
      name: itemName, 
      price,
      image,
      createdBy,
      updatedBy,
      description,
      category,
      quantity,
    });

    // Save the item to the database
    await newCartItem.save();
    return res.status(201).json({success: true,message: "Item added to cart successfully",data: newCartItem });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({success: false,message: "Error adding item to cart",error: error.message });
  }
};

export const getCartItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const cartItems = await CartItem.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      console.log("No cart items found for userId:", userId); 
      return res.status(404).json({ message: "No items found in the cart for this user." });
    }
    console.log("Cart items found:", cartItems); 
    res.status(200).json({ message: "Cart items retrieved successfully", data: cartItems });
  } catch (error) {
    console.error("Error:", error); 
    res.status(500).json({ message: "Error fetching cart items", error: error.message });
  }
};


// Update item quantity in the cart
export const updateCartItemQuantity = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body; 
  try {
    const updatedItem = await CartItem.findOneAndUpdate(
      { itemId },
      { quantity }, 
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item quantity updated successfully', data: updatedItem });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ message: 'Error updating item quantity', error: error.message });
  }
};


// Delete item from cart
export const deleteCartItem = async (req, res) => {
  const { userId, itemId } = req.params; 
  try {
    const deletedItem = await CartItem.findOneAndDelete({ userId, itemId });
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }
    return res.status(200).json({success: true, message: "Item deleted from cart successfully",data: deletedItem,});
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    return res.status(500).json({success: false,message: "Error deleting item from cart",error: error.message });
  }
};
