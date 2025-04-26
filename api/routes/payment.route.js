import express from "express";

import {
  createCheckoutSession,
  handleStripeWebhook
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post('/stripe-webhook', handleStripeWebhook);

export default router;
