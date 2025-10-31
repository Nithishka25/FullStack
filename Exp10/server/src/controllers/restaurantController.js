import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import mongoose from 'mongoose';

export async function listRestaurants(req, res) {
  const { q, cuisine } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (cuisine) filter.cuisines = cuisine;
  const restaurants = await Restaurant.find(filter).sort({ createdAt: -1 });
  res.json({ restaurants });
}

export async function getRestaurant(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const r = await Restaurant.findById(id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    const items = await MenuItem.find({ restaurant: r._id, available: true });
    res.json({ restaurant: r, menu: items });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch restaurant' });
  }
}

export async function upsertRestaurant(req, res) {
  const ownerId = req.user.id;
  const data = req.body;
  let r = await Restaurant.findOne({ owner: ownerId });
  if (!r) {
    r = await Restaurant.create({ ...data, owner: ownerId });
  } else {
    Object.assign(r, data);
    await r.save();
  }
  res.json({ restaurant: r });
}
