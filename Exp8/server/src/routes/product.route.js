import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { createProduct, listProducts, getProduct, updateProduct, deleteProduct, listMyProducts } from '../controllers/product.controller.js';

const router = Router();

// Public
router.get('/', listProducts);
// Authenticated: place before '/:id' to avoid shadowing
router.get('/mine', authRequired, listMyProducts);
router.get('/:id', getProduct);

// Authenticated
router.post('/', authRequired, createProduct);
router.put('/:id', authRequired, updateProduct);
router.delete('/:id', authRequired, deleteProduct);

export default router;
