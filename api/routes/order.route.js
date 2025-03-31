import express from 'express';
import { getCompletedOrders } from '../controllers/order.controller.js';

const router = express.Router();

router.get('/completed-orders/:userId', getCompletedOrders);

export default router;