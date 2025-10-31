import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';

export async function restaurantSummary(req, res) {
  // Requires restaurant role
  const userId = req.user.id;
  const restaurant = await Restaurant.findOne({ owner: userId });
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

  const { days = 7 } = req.query;
  const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

  const pipeline = [
    { $match: { restaurant: restaurant._id, createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      orders: { $sum: 1 },
      revenue: { $sum: '$total' }
    } },
    { $sort: { _id: 1 } }
  ];

  const daily = await Order.aggregate(pipeline);
  const totals = daily.reduce((acc, d) => ({ orders: acc.orders + d.orders, revenue: acc.revenue + d.revenue }), { orders: 0, revenue: 0 });

  res.json({ restaurant: { id: restaurant._id, name: restaurant.name }, daily, totals });
}
