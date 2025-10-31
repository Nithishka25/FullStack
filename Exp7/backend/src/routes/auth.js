import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).trim().toLowerCase(),
    body('email').isEmail().normalizeEmail(),
    body('name').isLength({ min: 1 }).trim(),
    body('password').isLength({ min: 6 }),
    body('isPrivate').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, name, password } = req.body;
    const isPrivate = !!req.body.isPrivate;

    try {
      const exists = await User.findOne({ $or: [{ username }, { email }] });
      if (exists) return res.status(409).json({ message: 'Username or email already in use' });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, name, passwordHash, isPrivate });

      const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET || 'dev_secret', {
        expiresIn: '7d'
      });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          isPrivate: user.isPrivate
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [body('usernameOrEmail').isString(), body('password').isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { usernameOrEmail, password } = req.body;
    try {
      const user = await User.findOne({
        $or: [
          { username: usernameOrEmail.toLowerCase() },
          { email: usernameOrEmail.toLowerCase() }
        ]
      });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET || 'dev_secret', {
        expiresIn: '7d'
      });

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          bio: user.bio,
          avatarUrl: user.avatarUrl
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
