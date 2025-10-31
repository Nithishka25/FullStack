import express from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer setup for image uploads
const uploadsRoot = path.resolve(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsRoot);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = /image\/(png|jpe?g|gif|webp|bmp|svg\+xml)/.test(file.mimetype);
    if (ok) cb(null, true); else cb(new Error('Only image files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Create post
router.post(
  '/',
  authRequired,
  [
    body('content').optional({ values: 'falsy' }).isLength({ min: 1, max: 280 }).trim(),
    body('imageUrl')
      .optional({ values: 'falsy' })
      .custom((value) => {
        // Allow absolute http(s) URLs or our local static path
        return /^https?:\/\//.test(value) || value.startsWith('/uploads/');
      })
      .withMessage('imageUrl must be an http(s) URL or start with /uploads/')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { content, imageUrl } = req.body;
    if (!content && !imageUrl) {
      return res.status(400).json({ message: 'Either content or imageUrl is required' });
    }
    try {
      const post = await Post.create({ author: req.userId, content: content || '', imageUrl });
      const populated = await post.populate('author', 'username name avatarUrl');
      res.status(201).json(populated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get likers for a post (only visible to the post's author)
router.get('/:id/likers', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('author likes').populate('likes', 'username name avatarUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    res.json(Array.isArray(post.likes) ? post.likes : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload image for a post
router.post('/upload', authRequired, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const pathPart = `/uploads/${req.file.filename}`;
    const base = `${req.protocol}://${req.get('host')}`;
    const absoluteUrl = `${base}${pathPart}`;
    res.status(201).json({ url: absoluteUrl, path: pathPart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put(
  '/:id',
  authRequired,
  [body('content').isLength({ min: 1, max: 280 }).trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const post = await Post.findOneAndUpdate(
        { _id: req.params.id, author: req.userId },
        { content: req.body.content },
        { new: true }
      ).populate('author', 'username name avatarUrl');
      if (!post) return res.status(404).json({ message: 'Post not found' });
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete post
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const result = await Post.findOneAndDelete({ _id: req.params.id, author: req.userId });
    if (!result) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a post
router.post('/:id/like', authRequired, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.userId } },
      { new: true }
    )
      .populate('author', 'username name avatarUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlike a post
router.post('/:id/unlike', authRequired, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.userId } },
      { new: true }
    )
      .populate('author', 'username name avatarUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .select('comments')
      .populate('comments.author', 'username name avatarUrl')
      .lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post.comments || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a post
router.post(
  '/:id/comments',
  authRequired,
  [body('content').isLength({ min: 1, max: 280 }).trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const update = {
        $push: {
          comments: {
            author: req.userId,
            content: req.body.content
          }
        }
      };
      const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate('author', 'username name avatarUrl')
        .populate('comments.author', 'username name avatarUrl');
      if (!post) return res.status(404).json({ message: 'Post not found' });
      res.status(201).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get posts for a user
router.get('/user/:username', authRequired, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('_id isPrivate followers');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isOwner = user._id.toString() === req.userId;
    const isFollower = (user.followers || []).some((id) => id.toString() === req.userId);
    const allowed = !user.isPrivate || isOwner || isFollower;
    if (!allowed) return res.status(403).json({ message: 'Private account' });
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Post.find({ author: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username name avatarUrl')
        .lean(),
      Post.countDocuments({ author: user._id })
    ]);

    res.json({ items, page, limit, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Feed: posts from following + self
router.get('/feed', authRequired, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const skip = (page - 1) * limit;

    // Author IDs are current user + following
    const user = await User.findById(req.userId).select('following');
    const ids = [req.userId, ...(user?.following || [])];
    const authorIds = ids
      .filter(Boolean)
      .map((id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id));

    const [items, total] = await Promise.all([
      Post.find({ author: { $in: authorIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username name avatarUrl')
        .lean(),
      Post.countDocuments({ author: { $in: authorIds } })
    ]);

    res.json({ items, page, limit, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
