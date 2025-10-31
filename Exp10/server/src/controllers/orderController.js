import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import mongoose from 'mongoose';

let ioRef = null;
export function setIO(io) { ioRef = io; }
function emitStatus(order) {
  if (!ioRef) return;
  ioRef.to(`order:${order._id}`).emit('order_status', { id: order._id, status: order.status });
  ioRef.to(`user:${order.user}`).emit('order_status', { id: order._id, status: order.status });
}

export async function placeOrder(req, res) {
  try {
    const { restaurantId, items, address } = req.body;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) return res.status(400).json({ message: 'Invalid restaurant' });
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(400).json({ message: 'Invalid restaurant' });

    const itemIds = items.map(i => i.item).filter(id => mongoose.Types.ObjectId.isValid(id))
    const dbItems = await MenuItem.find({ _id: { $in: itemIds } });
    const orderItems = items.map(i => {
      const found = dbItems.find(d => String(d._id) === String(i.item));
      return { item: i.item, name: found?.name, price: found?.price, quantity: i.quantity };
    });
    const total = orderItems.reduce((s, i) => s + (i.price || 0) * i.quantity, 0) + (restaurant.deliveryFee || 0);
    const order = await Order.create({ user: req.user.id, restaurant: restaurantId, items: orderItems, total, address, status: 'placed' });
    emitStatus(order);
    res.json({ order });
  } catch (e) {
    res.status(500).json({ message: 'Failed to place order' });
  }
}

export async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ orders });
}

export async function restaurantOrders(req, res) {
  try {
    const { restaurantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) return res.status(400).json({ message: 'Invalid restaurantId' });
    const orders = await Order.find({ restaurant: restaurantId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load orders' });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    order.status = req.body.status;
    await order.save();
    emitStatus(order);
    res.json({ order });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update status' });
  }
}
