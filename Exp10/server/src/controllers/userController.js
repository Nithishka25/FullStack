import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function getMe(req, res) {
  const user = await User.findById(req.user.id).populate('restaurant');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, restaurant: user.restaurant, addresses: user.addresses || [] } });
}

export async function updateMe(req, res) {
  const { name, password, addresses } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (name) user.name = name;
  if (Array.isArray(addresses)) user.addresses = addresses;
  if (password) user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();
  res.json({ success: true });
}
