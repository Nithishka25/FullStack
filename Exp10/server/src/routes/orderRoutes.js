import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { placeOrder, myOrders, restaurantOrders, updateStatus } from '../controllers/orderController.js';
import { setIO } from '../controllers/orderController.js';

let io;
export function attachIO(_io) { io = _io; setIO(io); }

const router = Router();

router.post('/', auth('user'), placeOrder);
router.get('/mine', auth('user'), myOrders);
router.get('/restaurant/:restaurantId', auth('restaurant'), restaurantOrders);
router.patch('/:id/status', auth('restaurant'), updateStatus);

export default router;
