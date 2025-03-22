import express from "express";
import {getCartItems, addToCart } from "../controllers/cart.controller.js";

const router = express.Router();

// POST route for adding item to the cart
router.post("/add-to-cart", addToCart);
router.get("/items/:userId", getCartItems);
export default router;