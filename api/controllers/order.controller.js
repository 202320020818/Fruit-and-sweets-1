import { v4 as uuidv4 } from 'uuid';
import Order from "../models/order.model.js"; 

// Import Order schema
export const getCompletedOrders = async (req, res) => {
  const { userId } = req.params; 
  try {
    const completedOrders = await Order.find({ userId, status: 'completed' })
      .sort({ createdAt: -1 })  
      .exec();
    if (!completedOrders || completedOrders.length === 0) {
      return res.status(404).json({ message: "No completed orders found for this user." });
    }
    res.status(200).json({ message: "Completed orders retrieved successfully", data: completedOrders });
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).json({ message: "Error fetching completed orders", error: error.message });
  }
};