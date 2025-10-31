import express from 'express';
import { body, validationResult, param } from 'express-validator';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import Post from '../models/Post.js';

const router = express.Router();

// List users with optional search and pagination
router.get('/', async (req, res) => {
  try {
    const q = (req.query.search || '').toString().trim().toLowerCase();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const skip = (page - 1) * limit;

    const filter = q
      ? {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } }
          ]
        }
      : {};

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('username name avatarUrl bio createdAt isPrivate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-passwordHash')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile (name, bio, avatarUrl)
router.put(
  '/me',
  authRequired,
  [
    body('name').optional().isLength({ min: 1 }),
    body('bio').optional().isString(),
    body('avatarUrl').optional().isURL(),
    body('dob').optional().isISO8601().toDate(),
    body('contact').optional().isString(),
    body('isPrivate').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const update = {};
      if (req.body.name) update.name = req.body.name;
      if (req.body.bio !== undefined) update.bio = req.body.bio;
      if (req.body.avatarUrl) update.avatarUrl = req.body.avatarUrl;
      if (req.body.dob !== undefined) update.dob = req.body.dob;
      if (req.body.contact !== undefined) update.contact = req.body.contact;
      if (req.body.isPrivate !== undefined) update.isPrivate = req.body.isPrivate;

      const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select(
        '-passwordHash'
      );
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Permanently delete my account
router.delete('/me', authRequired, async (req, res) => {
  try {
    const userId = req.userId;
    // Remove this user from others' followers/following/requests
    await Promise.all([
      User.updateMany({ followers: userId }, { $pull: { followers: userId } }),
      User.updateMany({ following: userId }, { $pull: { following: userId } }),
      User.updateMany({ followRequests: userId }, { $pull: { followRequests: userId } }),
      // Remove likes and comments from posts
      Post.updateMany({ likes: userId }, { $pull: { likes: userId } }),
      Post.updateMany({}, { $pull: { comments: { author: userId } } })
    ]);
    // Delete posts authored by this user
    await Post.deleteMany({ author: userId });
    // Finally delete the user
    await User.deleteOne({ _id: userId });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow user
router.post('/:username/follow', authRequired, async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target._id.toString() === req.userId) return res.status(400).json({ message: 'Cannot follow yourself' });
    if (target.isPrivate) {
      // create follow request
      await User.updateOne({ _id: target._id }, { $addToSet: { followRequests: req.userId } });
      return res.json({ message: 'Follow request sent', requested: true });
    } else {
      await User.updateOne({ _id: req.userId }, { $addToSet: { following: target._id } });
      await User.updateOne({ _id: target._id }, { $addToSet: { followers: req.userId } });
      return res.json({ message: 'Followed', requested: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow user
router.post('/:username/unfollow', authRequired, async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target._id.toString() === req.userId) return res.status(400).json({ message: 'Cannot unfollow yourself' });

    await User.updateOne({ _id: req.userId }, { $pull: { following: target._id } });
    await User.updateOne({ _id: target._id }, { $pull: { followers: req.userId } });

    res.json({ message: 'Unfollowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a follow request explicitly (for private accounts)
router.post('/:username/request-follow', authRequired, async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (!target.isPrivate) return res.status(400).json({ message: 'Target is public; follow directly' });
    if (target._id.toString() === req.userId) return res.status(400).json({ message: 'Cannot request yourself' });
    // If already following, no-op
    if (target.followers.some((id) => id.toString() === req.userId)) return res.json({ message: 'Already following' });
    await User.updateOne({ _id: target._id }, { $addToSet: { followRequests: req.userId } });
    res.json({ message: 'Follow request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List pending follow requests for the authenticated user (incoming)
router.get('/me/requests', authRequired, async (req, res) => {
  try {
    const me = await User.findById(req.userId)
      .populate('followRequests', 'username name avatarUrl')
      .select('followRequests')
      .lean();
    res.json(me?.followRequests || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a follow request
router.post('/:username/approve', authRequired, async (req, res) => {
  try {
    // :username here is the account owner
    const owner = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!owner) return res.status(404).json({ message: 'User not found' });
    if (owner._id.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    const requesterId = req.body.requesterId;
    if (!requesterId) return res.status(400).json({ message: 'requesterId is required' });

    // Remove from requests, add to followers/following
    await User.updateOne({ _id: owner._id }, { $pull: { followRequests: requesterId }, $addToSet: { followers: requesterId } });
    await User.updateOne({ _id: requesterId }, { $addToSet: { following: owner._id } });

    res.json({ message: 'Approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deny a follow request
router.post('/:username/deny', authRequired, async (req, res) => {
  try {
    const owner = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!owner) return res.status(404).json({ message: 'User not found' });
    if (owner._id.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    const requesterId = req.body.requesterId;
    if (!requesterId) return res.status(400).json({ message: 'requesterId is required' });
    await User.updateOne({ _id: owner._id }, { $pull: { followRequests: requesterId } });
    res.json({ message: 'Denied' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Relationship/status helper
router.get('/:username/status', authRequired, async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username.toLowerCase() }).select('isPrivate followers followRequests');
    if (!target) return res.status(404).json({ message: 'User not found' });
    const isFollowing = target.followers.some((id) => id.toString() === req.userId);
    const requested = target.followRequests.some((id) => id.toString() === req.userId);
    res.json({ isPrivate: target.isPrivate, isFollowing, requested });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get followers / following lists
router.get('/:username/followers', authRequired, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .populate('followers', 'username name avatarUrl')
      .select('followers followers _id isPrivate')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const allowed = !user.isPrivate || user._id.toString() === req.userId || (user.followers || []).some((id) => id._id?.toString?.() === req.userId || id.toString?.() === req.userId);
    if (!allowed) return res.status(403).json({ message: 'Private account' });
    res.json(user.followers || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:username/following', authRequired, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .populate('following', 'username name avatarUrl')
      .select('following followers _id isPrivate')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const allowed = !user.isPrivate || user._id.toString() === req.userId || (user.followers || []).some((id) => id._id?.toString?.() === req.userId || id.toString?.() === req.userId);
    if (!allowed) return res.status(403).json({ message: 'Private account' });
    res.json(user.following || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
