import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import mongoose from 'mongoose';

export async function listMenu(req, res) {
  try {
    const { restaurantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) return res.status(400).json({ message: 'Invalid restaurantId' });
    const items = await MenuItem.find({ restaurant: restaurantId });
    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load menu' });
  }
}

export async function createItem(req, res) {
  const ownerId = req.user.id;
  const restaurant = await Restaurant.findOne({ owner: ownerId });
  if (!restaurant) return res.status(403).json({ message: 'No restaurant' });
  const item = await MenuItem.create({ ...req.body, restaurant: restaurant._id });
  res.json({ item });
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    Object.assign(item, req.body);
    await item.save();
    res.json({ item });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update item' });
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete item' });
  }
}
