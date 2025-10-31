import { Router } from 'express';
import Response from '../models/Response.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// User: submit responses
router.post('/', auth, async (req, res) => {
  const { answers } = req.body; // [{question, answer}]
  if (!Array.isArray(answers) || answers.length === 0) return res.status(400).json({ message: 'No answers' });
  const resp = await Response.create({ user: req.user.id, answers });
  res.status(201).json({ id: resp._id, createdAt: resp.createdAt });
});

// Admin: view all responses
router.get('/', auth, requireAdmin, async (req, res) => {
  const items = await Response.find().populate('user', 'email role').populate('answers.question', 'text');
  res.json(items);
});

export default router;
