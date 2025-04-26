import express from "express";
import { createCheckoutSession, handleStripeWebhook, uploadBankSlip, getOrderDetailsBySessionId } from "../controllers/payment.controller.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/bank-slips/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create checkout session
router.post("/create-checkout-session", createCheckoutSession);

// Handle Stripe webhook
router.post("/webhook", handleStripeWebhook);

// Upload bank slip
router.post("/upload-bank-slip", upload.single("slipImage"), uploadBankSlip);

// Get order details by session ID
router.get("/order-details/:sessionId", getOrderDetailsBySessionId);

export default router;
