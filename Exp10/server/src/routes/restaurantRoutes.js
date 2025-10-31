import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listRestaurants, getRestaurant, upsertRestaurant } from '../controllers/restaurantController.js';

const router = Router();

router.get('/', listRestaurants);
router.get('/:id', getRestaurant);
router.post('/me', auth('restaurant'), upsertRestaurant);
router.put('/me', auth('restaurant'), upsertRestaurant);

export default router;
