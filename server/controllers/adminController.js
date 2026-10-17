import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/http.js';

const PAID = { isPaid: true, status: { $ne: 'cancelled' } };
const TZ = process.env.STORE_TIMEZONE || 'Asia/Kolkata';
const dayKey = (d) => d.toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

export const stats = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 31 * 86400000);

  const [totals, daily, statusCounts, topProducts, lowStock, recentOrders, customers, products] = await Promise.all([
    Order.aggregate([{ $match: PAID }, { $group: { _id: null, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { ...PAID, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: PAID },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', units: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { units: -1 } },
      { $limit: 5 },
    ]),
    Product.aggregate([
      { $unwind: '$sizes' },
      { $match: { 'sizes.stock': { $lte: 5 } } },
      { $project: { name: 1, ml: '$sizes.ml', stock: '$sizes.stock' } },
      { $sort: { stock: 1 } },
      { $limit: 8 },
    ]),
    Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(6),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
  ]);

  // Fill the last 30 days so the chart has no gaps
  const map = new Map(daily.map((d) => [d._id, d]));
  const salesByDay = [];
  for (let i = 29; i >= 0; i--) {
    const key = dayKey(new Date(Date.now() - i * 86400000));
    salesByDay.push({ date: key, revenue: map.get(key)?.revenue || 0, orders: map.get(key)?.orders || 0 });
  }

  const revenue = totals[0]?.revenue || 0;
  const paidOrders = totals[0]?.orders || 0;
  res.json({
    revenue,
    paidOrders,
    averageOrder: paidOrders ? Math.round(revenue / paidOrders) : 0,
    customers,
    products,
    salesByDay,
    statusCounts: statusCounts.map((s) => ({ status: s._id, count: s.count })),
    topProducts: topProducts.map((t) => ({ name: t._id, units: t.units, revenue: t.revenue })),
    lowStock,
    recentOrders,
  });
});

export const listCustomers = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(200).select('name email createdAt');
  const counts = await Order.aggregate([
    { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: { $cond: ['$isPaid', '$totalPrice', 0] } } } },
  ]);
  const byUser = new Map(counts.map((c) => [c._id.toString(), c]));
  res.json(users.map((u) => ({
    id: u._id, name: u.name, email: u.email, joined: u.createdAt,
    orders: byUser.get(u._id.toString())?.orders || 0,
    spent: byUser.get(u._id.toString())?.spent || 0,
  })));
});
