import express from 'express';
import {
  saveDeliveryDetails,
  getDeliveryDetails,
  deleteDeliveryDetails,
  getAllDeliveries
} from '../controllers/delivery.controller.js';

const router = express.Router();

// Get all deliveries
router.get('/', getAllDeliveries);

// User specific routes
router.post('/saveDeliveryDetails', saveDeliveryDetails);
router.get('/user/:userId', getDeliveryDetails);
router.delete('/:id', deleteDeliveryDetails);

export default router; 