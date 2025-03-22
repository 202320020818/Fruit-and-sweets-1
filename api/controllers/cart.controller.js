import { v4 as uuidv4 } from 'uuid'; // Import uuid package
import CartItem from "../models/CartItemSchema.js";

// Add item to the cart
export const addToCart = async (req, res) => {
    
  const { userId, itemName, price, image, createdBy, updatedBy, description, category, quantity = 1 } = req.body;

  const itemId = uuidv4();  // Random UUID for itemId

  try {
    // Create the new CartItem
    const newCartItem = new CartItem({
      userId,  // UserID from request body
      itemId,  // Random UUID for itemId
      name: itemName,  // Name of the item
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

    // Success response
    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: newCartItem
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);

    // Error response with the exception details
    return res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message || error
    });
  }
};

// Get all cart items
export const getCartItems = async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Query the database to find all cart items for the specific user
      const cartItems = await CartItem.find({ userId });
  
      if (!cartItems || cartItems.length === 0) {
        console.log("No cart items found for userId:", userId);  // Log when no items are found
        return res.status(404).json({ message: "No items found in the cart for this user." });
      }
  
      console.log("Cart items found:", cartItems);  // Log when items are found
  
      res.status(200).json({ message: "Cart items retrieved successfully", data: cartItems });
    } catch (error) {
      console.error("Error:", error);  // Log any errors
      res.status(500).json({ message: "Error fetching cart items", error: error.message });
    }
  };