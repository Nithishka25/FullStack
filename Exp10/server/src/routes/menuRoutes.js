import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listMenu, createItem, updateItem, deleteItem } from '../controllers/menuController.js';

const router = Router();

router.get('/:restaurantId', listMenu);
router.post('/', auth('restaurant'), createItem);
router.put('/:id', auth('restaurant'), updateItem);
router.delete('/:id', auth('restaurant'), deleteItem);

export default router;
