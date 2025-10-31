import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { listMyOrders, createOrder } from '../controllers/orders.controller.js';

const router = Router();

router.get('/', authRequired, listMyOrders);
router.post('/', authRequired, createOrder);

export default router;
