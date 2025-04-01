import express from "express";
import multer from "multer";
import path from "path";
import Inventory from "../models/inventory.model.js";


const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Make uploads folder publicly accessible


// Route to add a new product with an image
router.post("/", upload.single("image"), (req, res) => {
  const { product_ID, name, description, category, price, quantity} = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : ""; 
  
  // Store image path
  if (!product_ID || !name || !description || !category || !price || !quantity || !imagePath) {
    return res.status(400).json({ msg: "All fields are required." });
}

if (isNaN(price) || price <= 0) {
    return res.status(400).json({ msg: "Price must be a positive number." });
}

if (isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ msg: "Quantity cannot be negative." });
}

  Inventory.create({
    product_ID,
    name,
    description,
    category,
    price,
    quantity: quantity || 0,
    image: imagePath,
  })
    .then(() => res.json({ msg: "Product added successfully" }))
    .catch(() => res.status(400).json({ msg: "Failed to add product" }));
});

// Route to get all products
router.get("/", (req, res) => {
  Inventory.find()
    .then((inventory) => res.json(inventory))
    .catch(() => res.status(400).json({ msg: "No inventories found" }));
});

// Route to get a single product by ID
router.get("/:id", (req, res) => {
  Inventory.findById(req.params.id)
    .then((inventory) => res.json(inventory))
    .catch(() => res.status(400).json({ msg: "Product not found" }));
});

// Route to update a product
router.put("/:id", upload.single("image"), (req, res) => {
  const { product_ID, name, description, category, price, quantity} = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image; // Keep old image if not updated

  Inventory.findByIdAndUpdate(req.params.id, {
    product_ID,
    name,
    description,
    category,
    price,
    quantity,
    image: imagePath,
  
  })
    .then(() => res.json({ msg: "Product updated successfully" }))
    .catch(() => res.status(400).json({ msg: "Failed to update product" }));
});

// Route to delete a product
router.delete("/:id", (req, res) => {
  Inventory.findByIdAndDelete(req.params.id)
    .then(() => res.json({ msg: "Product deleted successfully" }))
    .catch(() => res.status(400).json({ msg: "Failed to delete product" }));
});

export default router;
