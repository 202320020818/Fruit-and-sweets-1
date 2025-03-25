import express from 'express';

import{
    createDelivery,
    getAllDeliveries,
    getDeliveryById, 
    updateDelivery,
    deleteDelivery,
    getCancelledDeliveries
}from "../controllers/delivery.controller.js";

const router = express.Router();
// Routes
router.post("/saveDeliveryDetails", createDelivery);        // Create a delivery
router.get("/", getAllDeliveries);       // Get all deliveries
router.get("/:id", getDeliveryById);     // Get delivery by ID
router.put("/:id", updateDelivery);      // Update delivery
router.delete("/:id", deleteDelivery);   // Delete delivery
router.get("/cancelled", getCancelledDeliveries);


//module.exports = router;
export default router;
