import express from 'express';
import { getCompletedOrders } from '../controllers/order.controller.js';


const router = express.Router();

    // Fetch all orders for the given user ID
    router.get('/completed-orders/:userId', getCompletedOrders);

export default router;