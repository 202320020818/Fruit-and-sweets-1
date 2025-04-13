import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import cartRoutes from './routes/cart.route.js';
import paymentRoutes from './routes/payment.route.js';
import orderRoutes from './routes/order.route.js';
import feedbackRoutes from './routes/feedback.route.js';
import deliveryRoutes from './routes/delivery.route.js';
import admin from './config/firebase.js';
import { stripeRawBodyMiddleware } from './middleware/stripeRawBoady.js';
import inventoryRoutes from './routes/inventory.route.js';
import wishlistRoutes from './routes/wishlist.route.js';
import bankSlipRoutes from './routes/bankSlip.route.js';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.log(error));

const app = express();

// ✅ Fix CORS Issue
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ✅ Handle Preflight Requests
app.options('*', cors());

// ✅ Middleware Order Matters!
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ Serve Static Files
// Use import.meta.url to get the directory and join paths accordingly
const __dirname = path.dirname(new URL(import.meta.url).pathname); // Get current directory
app.use('/uploads', express.static('uploads'));
app.use('/uploads/bank_slips', express.static(path.join(__dirname, 'uploads', 'bank_slips'))); // Serve bank slip files

// ✅ Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/bankslip', bankSlipRoutes); // Add Bank Slip Routes here
app.use('/api/feedback', feedbackRoutes);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  });
});


// ✅ Start Server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
