import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { restaurantSummary } from '../controllers/analyticsController.js';

const router = Router();

router.get('/restaurant/summary', auth('restaurant'), restaurantSummary);

export default router;
