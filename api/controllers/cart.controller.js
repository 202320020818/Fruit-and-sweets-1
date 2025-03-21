import { v4 as uuidv4 } from 'uuid'; // Import uuid package
import CartItem from "../models/CartItemSchema.js";

// Add item to the cart
export const addToCart = async (req, res) => {
  const { itemName, price, image, createdBy, updatedBy, description, category, quantity = 1 } = req.body;

  // Generate random UUIDs for userId and itemId
  const userId = uuidv4();  // Random UUID for userId
  const itemId = uuidv4();  // Random UUID for itemId

  try {
    // Create the new CartItem
    const newCartItem = new CartItem({
      userId,  // Random UUID for userId
      itemId,  // Random UUID for itemId
      name: itemName,  // Use itemName for name
      price,
      image,
      createdBy,
      updatedBy,
      description,
      category,
      quantity,
    });

    await newCartItem.save();

    res.status(201).json({ message: "Item added to cart successfully", data: newCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding item to cart", error: error.message });
  }

};
