import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController.js';

const router = Router();

router.use(auth);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
