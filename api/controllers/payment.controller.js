import { v4 as uuidv4 } from 'uuid';
import CartItem from "../models/CartItemSchema.js";
import Order from "../models/order.model.js"; 
import Stripe from 'stripe';
import { query } from 'express';
const stripe = Stripe("sk_test_51R1EIIDWYegqaTAkSR8SSLTlROdixGUzqEpC8eeMTe3ce8ALYEqNqOxkzgGEhI0kEqqy4XL9VU9hy8BRkSbMSII300aF88jnvy"); // Use the environment variable for the secret key

// Add item to the cart
export const addToCart = async (req, res) => {
  const { userId, itemName, price, image, createdBy, updatedBy, description, category, quantity = 1 } = req.body;
  const itemId = uuidv4(); 

  try {
    // Create a new cart item instance
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

    // Save the item in the database
    await newCartItem.save();
    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: newCartItem
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message
    });
  }
};

// Get all cart items
export const getCartItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const cartItems = await CartItem.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "No items found in the cart for this user." });
    }
    res.status(200).json({ message: "Cart items retrieved successfully", data: cartItems });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Error fetching cart items", error: error.message });
  }
};


export const createCheckoutSession = async (req, res) => {
  try {
    const { items, totalAmount ,userDeliveryDetailsId } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items found" });
    }
    const userId = items[0].userId;
    const orderId = uuidv4();
   
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:5173/payment-success',
      cancel_url: 'http://localhost:5173/payment-failed',
      metadata: {
        orderId,
        userId,
        userDeliveryDetailsId
      },
    });

    // Create pending order in DB
    const newOrder = new Order({
      orderId,
      userId,
      userDeliveryDetailsId,
      items: items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      paymentStatus: 'pending',
      paymentIntentId: session.payment_intent || null,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
    });

    await newOrder.save();

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error(' Error in createCheckoutSession:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


//  webhook handler
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  console.log("Received webhook event");
  try {
    const endpointSecret = "whsec_ca13880a8c9c87b4fecd08086e9946c51995485233473c0ccf73ae2bf44c0605";
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log the event data for debugging
  console.log("Event type:", event.type);
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment successful for session:', session.id);

  // Update the order in the DB
  try {
    const orderId = session.metadata.orderId;
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId }, 
      {
        $set: {
          paymentStatus: session.payment_status,
          paymentIntentId: session.payment_intent,
          status: 'completed', 
        },
      },
      { new: true }
    );
    if (!updatedOrder) {
      console.warn(' No matching order found for orderId:', orderId);
    } else {
      console.log(' Order updated successfully:', updatedOrder._id);
    }
  } catch (error) {
    console.error(' Error updating order status in webhook:', error.message);
  }

   // Remove cart items after successful payment
   const userId = session.metadata.userId;  
   const result = await CartItem.deleteMany({ userId });
  if (result.deletedCount > 0) {
     console.log(` ${result.deletedCount} cart item(s) removed for user: ${userId}`);
   } else {
     console.warn(` No cart items found to remove for user: ${userId}`);
   }
  res.status(200).json({ received: true });
  }
};