import { z } from 'zod';
import Product from '../models/Product.js';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { applyCoupon, shippingFor } from '../utils/pricing.js';

const orderSchema = z.object({
  items: z.array(z.object({
    product: z.string(),
    size: z.coerce.number().positive(),
    qty: z.coerce.number().int().min(1).max(10),
  })).min(1, 'Your bag is empty'),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().min(7).max(20),
    line1: z.string().trim().min(3),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    postalCode: z.string().trim().min(3).max(12),
    country: z.string().trim().default('India'),
  }),
  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().trim().optional(),
});

const restock = (items) =>
  Promise.all(items.map((i) =>
    Product.updateOne({ _id: i.product, 'sizes.ml': i.size }, { $inc: { 'sizes.$.stock': i.qty } })
  ));

export const createOrder = asyncHandler(async (req, res) => {
  const data = orderSchema.parse(req.body);

  // Merge duplicate lines (same product + size)
  const merged = new Map();
  for (const l of data.items) {
    const key = `${l.product}:${l.size}`;
    merged.set(key, { ...l, qty: (merged.get(key)?.qty || 0) + l.qty });
  }
  const lines = [...merged.values()];
  if (lines.some((l) => !/^[0-9a-fA-F]{24}$/.test(l.product))) throw new HttpError(400, 'Invalid product in your bag');

  const products = await Product.find({ _id: { $in: lines.map((l) => l.product) } });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  // Price everything on the server. Never trust prices from the browser.
  const items = lines.map((l) => {
    const p = byId.get(l.product);
    if (!p) throw new HttpError(400, 'A product in your bag is no longer available');
    const size = p.sizes.find((s) => s.ml === l.size);
    if (!size) throw new HttpError(400, `${p.name} is not sold in ${l.size}ml`);
    return {
      product: p._id, name: p.name, slug: p.slug, size: l.size, price: size.price,
      qty: l.qty, image: p.images?.[0]?.url || '', accent: p.accent,
    };
  });

  // Reserve stock atomically; roll back if any line fails.
  const reserved = [];
  try {
    for (const i of items) {
      const r = await Product.updateOne(
        { _id: i.product, sizes: { $elemMatch: { ml: i.size, stock: { $gte: i.qty } } } },
        { $inc: { 'sizes.$.stock': -i.qty } }
      );
      if (r.modifiedCount !== 1) throw new HttpError(409, `${i.name} (${i.size}ml) does not have enough stock`);
      reserved.push(i);
    }
    const itemsPrice = items.reduce((a, i) => a + i.price * i.qty, 0);
    const { coupon, discount } = await applyCoupon(data.couponCode, itemsPrice);
    const shippingPrice = shippingFor(itemsPrice - discount);
    const totalPrice = itemsPrice - discount + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      itemsPrice, shippingPrice, discount, couponCode: coupon?.code, totalPrice,
      status: data.paymentMethod === 'cod' ? 'processing' : 'pending',
      timeline: [{ status: data.paymentMethod === 'cod' ? 'processing' : 'pending' }],
    });
    res.status(201).json(order);
  } catch (err) {
    await restock(reserved);
    throw err;
  }
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = z.object({ code: z.string().trim().min(1), subtotal: z.coerce.number().min(0) }).parse(req.body);
  const { coupon, discount } = await applyCoupon(code, subtotal);
  res.json({ code: coupon.code, percent: coupon.percent, discount });
});

export const myOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new HttpError(404, 'Order not found');
  const ownerId = order.user._id?.toString() || order.user.toString();
  if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new HttpError(403, 'You do not have access to this order');
  }
  res.json(order);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.user.toString() !== req.user._id.toString()) throw new HttpError(403, 'You do not have access to this order');
  if (!['pending', 'processing'].includes(order.status)) {
    throw new HttpError(400, 'This order has already shipped and cannot be cancelled');
  }
  order.status = 'cancelled';
  order.timeline.push({ status: 'cancelled' });
  await order.save();
  await restock(order.items);
  res.json(order);
});

// ---- Admin ----
export const adminListOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const filter = ORDER_STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit), total });
});

export const adminUpdateStatus = asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.enum(ORDER_STATUSES) }).parse(req.body);
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.status === status) return res.json(order);
  if (order.status === 'cancelled') throw new HttpError(400, 'A cancelled order cannot be changed');

  if (status === 'cancelled') await restock(order.items);
  if (status === 'delivered' && order.paymentMethod === 'cod' && !order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date();
  }
  order.status = status;
  order.timeline.push({ status });
  await order.save();
  res.json(order);
});
