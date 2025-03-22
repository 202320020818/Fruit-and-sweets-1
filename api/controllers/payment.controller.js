import { v4 as uuidv4 } from 'uuid'; // Import uuid package
import Order from "../models/order.model.js";  // Assuming you have an Order schema
import CartItem from "../models/CartItemSchema.js"; // Assuming you have a CartItem schema
import Stripe from 'stripe';
const stripe = Stripe("sk_test_51R1EIIDWYegqaTAkSR8SSLTlROdixGUzqEpC8eeMTe3ce8ALYEqNqOxkzgGEhI0kEqqy4XL9VU9hy8BRkSbMSII300aF88jnvy");  // Make sure to store your secret key in environment variables

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Invalid cart items" });
    }

    const totalAmount = cartItems.reduce((total, item) => {
      if (item.price) {
        return total + item.price;
      } else {
        throw new Error("Item does not have a price");
      }
    }, 0);

    // Now proceed with the payment intent creation logic
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Stripe requires the amount in cents
      currency: 'lkr', // or your preferred currency
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Error creating payment intent", error: error.message });
  }
};

// Confirm Payment and Create Order
// Confirm Payment and Create Order
export const confirmPayment = async (req, res) => {
  const { paymentToken, userId, cartItems } = req.body;

  try {
    // Calculate the total amount from cart items
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Confirm the payment with Stripe using the payment token
    const paymentIntent = await stripe.paymentIntents.confirm(paymentToken, {
      amount: totalAmount * 100, // Convert to cents
    });

    if (paymentIntent.status === 'succeeded') {
      // Create a new order in the database after successful payment
      const orderId = uuidv4();  // Generate unique order ID
      const newOrder = new Order({
        orderId,
        userId,
        items: cartItems.map(item => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        paymentToken: paymentIntent.id,
        totalAmount,
        status: 'completed',
        createdAt: new Date(),
      });

      // Save the new order to the database
      await newOrder.save();

      // Optionally, clear the user's cart after the order is placed
      await CartItem.deleteMany({ userId });

      // Return success response with order details
      return res.status(200).json({
        success: true,
        message: 'Payment successful, order placed successfully',
        order: newOrder,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
      });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message || error,
    });
  }
};
