import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { createPaymentIntent } from '../controllers/payment.controller.js';

const router = Router();

// Create client payment intent (authenticated)
router.post('/intent', authRequired, createPaymentIntent);

export default router;
