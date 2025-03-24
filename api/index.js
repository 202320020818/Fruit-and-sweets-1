import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import orderRoutes from './routes/order.route.js'; // Import order routes
import cookieParser from 'cookie-parser';
import admin from "./config/firebase.js";
import cors from 'cors';
import { stripeRawBodyMiddleware } from './middleware/stripeRawBoady.js';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDb is connected");
  })
  .catch((error) => {
    console.log(error);
  });

  
const app = express();

// Use the raw body middleware for the Stripe webhook route
//app.use(stripeRawBodyMiddleware);

// CORS setup
app.use(cors({
  origin: process.env.CLIENT_URL, // Use environment variable for frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // Allow credentials (cookies)
}));

// Middleware to set Cross-Origin-Opener-Policy header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use(cookieParser());
app.use(express.json());


app.listen(3000, () => {
  console.log("Server is running on port 3000!!!");
});
app.use('/api/payment/stripe-webhook', stripeRawBodyMiddleware);
// Routes for user, authentication, cart, payment, and orders
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes); 
app.use('/api/order', orderRoutes); // Order routes (e.g., fetching order details)

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
