import express from "express";
import { addToCart } from "../controllers/cart.controller.js";

const router = express.Router();

// POST route for adding item to the cart
router.post("/add-to-cart", addToCart);

export default router;