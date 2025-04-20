import express from 'express';
import {
  saveDeliveryDetails,
  getDeliveryDetails,
  deleteDeliveryDetails
} from '../controllers/delivery.controller.js';

const router = express.Router();

router.post('/saveDeliveryDetails', saveDeliveryDetails);
router.get('/:userId', getDeliveryDetails);
router.delete('/:id', deleteDeliveryDetails);

export default router; 