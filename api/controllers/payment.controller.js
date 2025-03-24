import { v4 as uuidv4 } from 'uuid';
import CartItem from "../models/CartItemSchema.js";
import Order from "../models/order.model.js"; // Import Order schema
import Stripe from 'stripe';
const stripe = Stripe("sk_test_51R1EIIDWYegqaTAkSR8SSLTlROdixGUzqEpC8eeMTe3ce8ALYEqNqOxkzgGEhI0kEqqy4XL9VU9hy8BRkSbMSII300aF88jnvy"); // Use the environment variable for the secret key

// Add item to the cart
export const addToCart = async (req, res) => {
  const { userId, itemName, price, image, createdBy, updatedBy, description, category, quantity = 1 } = req.body;
  const itemId = uuidv4(); // Generate a unique identifier for the cart item

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

    // Respond with success message
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

const exchangeRateLKRtoUSD = 0.0026; // Replace with actual exchange rate from LKR to USD

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, totalAmount, userId } = req.body;

    // Check if items is an array and is not empty
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "The items array is missing or empty.",
      });
    }

    // Log the incoming total amount
    console.log("Total amount in LKR (before conversion):", totalAmount);

    // Calculate the total amount in cents (ensure this is in LKR first)
    const totalAmountInLKR = Math.round(totalAmount * 100); // Convert to LKR cents
    const totalAmountInUSD = totalAmount * exchangeRateLKRtoUSD; // Convert to USD
    const totalAmountInUSDInCents = Math.round(totalAmountInUSD * 100); // Convert to USD cents

    // Log the conversion details
    console.log("Total amount in USD (after conversion):", totalAmountInUSD);
    console.log("Total amount in USD cents (after conversion):", totalAmountInUSDInCents);

    // Check if the total amount is at least 50 cents in USD
    if (totalAmountInUSDInCents < 50) {
      return res.status(400).json({
        message: "The total amount must be at least 50 cents in USD.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      submit_type: 'pay',
      mode: "payment",
      billing_address_collection: 'auto',
      line_items: items.map((item) => ({
        price_data: {
          currency: "lkr", // Specify currency, change as needed
          product_data: {
            name: item.name,
            //TODO add image here
            metadata: {
              userId: userId,
            },
          },
          unit_amount: Math.round(item.price * 100), 
        },
        adjustable_quantity: { enabled: true, minimum: 1 },
        quantity: item.quantity,
      })),
      success_url: "http://localhost:5173/payment-success",  // Redirect after successful payment
      cancel_url: "http://localhost:5173/payment-failed",    // Redirect if payment is canceled
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating checkout session" });
  }
};





// Handle Webhook from Stripe
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, "whsec_ca13880a8c9c87b4fecd08086e9946c51995485233473c0ccf73ae2bf44c0605");
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the successful payment event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const items = JSON.parse(session.metadata.items);

    try {
      const newOrder = new Order({
        userId,
        items,
        paymentStatus: session.payment_status,
        totalAmount: session.amount_total / 100, // Convert amount back to dollars
        paymentIntentId: session.payment_intent,
        createdAt: new Date(),
      });

      await newOrder.save();
      console.log('✅ Order saved successfully');
    } catch (error) {
      console.error('❌ Error saving order:', error);
    }
  }

  res.json({ received: true });
};
