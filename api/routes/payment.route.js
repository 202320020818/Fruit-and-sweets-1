import express from "express";
import Stripe from "stripe";
import { createPaymentIntent, confirmPayment } from "../controllers/payment.controller.js";

// Initialize Stripe with your Secret Key
const stripe = new Stripe("sk_test_51R1EIIDWYegqaTAkSR8SSLTlROdixGUzqEpC8eeMTe3ce8ALYEqNqOxkzgGEhI0kEqqy4XL9VU9hy8BRkSbMSII300aF88jnvy");  // Replace with your Stripe Secret Key

const router = express.Router();

// POST route for creating a payment intent (existing route)
router.post("/create-payment-intent", createPaymentIntent);

// POST route for confirming the payment and creating an order (existing route)
router.post("/confirm-payment", confirmPayment);

// POST route for creating a checkout session (new route based on previous implementation)
router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body; // Destructure items from the request body

  try {
    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "lkr", // Specify currency, change as needed
          product_data: {
            name: item.name,
            //TODO add image here

          },
          unit_amount: item.price * 100, 
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:5173/payment-success",  // Redirect after successful payment
      cancel_url: "http://localhost:5173//payment-failed",    // Redirect if payment is canceled
    });

    // Send the session ID back to the frontend
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Error creating checkout session", error: error.message });
  }
});


export default router;