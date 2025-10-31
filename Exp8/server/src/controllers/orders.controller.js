import { Order } from '../models/Order.js';

export async function listMyOrders(req, res) {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('product');
    res.json({ orders });
  } catch (err) {
    console.error('listMyOrders error', err);
    res.status(500).json({ error: 'Failed to list orders' });
  }
}

export async function createOrder(req, res) {
  try {
    const { productId, amount, currency = 'usd', paymentIntentId } = req.body;
    if (!productId || !amount) return res.status(400).json({ error: 'productId and amount required' });
    const order = await Order.create({ buyer: req.user.id, product: productId, amount, currency, status: 'paid', paymentIntentId });
    res.status(201).json({ order });
  } catch (err) {
    console.error('createOrder error', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
}
