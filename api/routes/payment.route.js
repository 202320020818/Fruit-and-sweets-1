import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook
} from "../controllers/payment.controller.js";

const router = express.Router();

// Create a Stripe checkout session
router.post("/create-checkout-session", createCheckoutSession);

// Handle Stripe webhook
router.post('/stripe-webhook', handleStripeWebhook);
export default router;
