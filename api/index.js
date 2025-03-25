import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import cartRoutes from "./routes/cart.route.js";
import paymentRoutes from "./routes/payment.route.js";
import orderRoutes from './routes/order.route.js';  
import cookieParser from 'cookie-parser';
import admin from "./config/firebase.js";
import cors from 'cors';
import { stripeRawBodyMiddleware } from './middleware/stripeRawBoady.js';
import bodyParser from 'body-parser';
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
app.use(cors({
  origin: process.env.CLIENT_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  
}));

// Middleware to set Cross-Origin-Opener-Policy header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});
app.post('/api/payment/stripe-webhook', bodyParser.raw({ type: 'application/json' }));
app.use(cookieParser());
app.use(express.json());


app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes); 
app.use('/api/order', orderRoutes); 

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
app.listen(3000, () => {
  console.log("Server is running on port 3000!!!");
});

    