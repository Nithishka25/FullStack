import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';

function sign(user) {
  return jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
}

export async function register(req, res) {
  try {
    const { name, email, password, role, restaurantName } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: role === 'restaurant' ? 'restaurant' : 'user' });

    if (user.role === 'restaurant' && restaurantName) {
      const restaurant = await Restaurant.create({ owner: user._id, name: restaurantName });
      user.restaurant = restaurant._id;
      await user.save();
    }

    const token = sign(user);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, restaurant: user.restaurant } });
  } catch (e) {
    res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = sign(user);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, restaurant: user.restaurant } });
  } catch (e) {
    res.status(500).json({ message: 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).populate('restaurant');
    res.json({ user: user ? { id: user._id, name: user.name, role: user.role, email: user.email, restaurant: user.restaurant } : null });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}
