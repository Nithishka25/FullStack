import { Router } from 'express';
import Question from '../models/Question.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin: list all questions
router.get('/', auth, requireAdmin, async (req, res) => {
  const items = await Question.find().sort({ createdAt: -1 });
  res.json(items);
});

// Admin: create question
router.post('/', auth, requireAdmin, async (req, res) => {
  const { text, type = 'text', options = [], isActive = true } = req.body;
  const q = await Question.create({ text, type, options, isActive });
  res.status(201).json(q);
});

// Admin: update question
router.put('/:id', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { text, type, options, isActive } = req.body;
  const q = await Question.findByIdAndUpdate(id, { text, type, options, isActive }, { new: true });
  if (!q) return res.status(404).json({ message: 'Not found' });
  res.json(q);
});

// Admin: delete question
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const q = await Question.findByIdAndDelete(id);
  if (!q) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
});

// User: get random 5 active questions
router.get('/random', auth, async (req, res) => {
  const count = parseInt(req.query.count || '5', 10);
  const items = await Question.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: count } },
  ]);
  res.json(items);
});

export default router;
