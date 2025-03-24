import express from 'express';
import Order from '../models/order.model.js'; // Import Order model

const router = express.Router();

// Route to get all orders for a specific user
router.get('/orders/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all orders for the given user ID
    const orders = await Order.find({ userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    res.status(200).json({ message: 'Orders retrieved successfully', data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

export default router;