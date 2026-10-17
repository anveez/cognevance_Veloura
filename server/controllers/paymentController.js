import crypto from 'crypto';
import Razorpay from 'razorpay';
import { z } from 'zod';
import Order from '../models/Order.js';
import { HttpError, asyncHandler } from '../utils/http.js';

const keysConfigured = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const client = () => new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const safeEqual = (a, b) => {
  const A = Buffer.from(a || '');
  const B = Buffer.from(b || '');
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

// Idempotent: calling it twice does not change anything the second time.
async function markPaid(order, paymentId, demo = false) {
  if (order.isPaid) return order;
  order.isPaid = true;
  order.paidAt = new Date();
  order.set('paymentResult.razorpayPaymentId', paymentId);
  order.set('paymentResult.demo', demo);
  if (order.status === 'pending') {
    order.status = 'processing';
    order.timeline.push({ status: 'processing' });
  }
  await order.save();
  return order;
}

async function ownOrder(req, orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.user.toString() !== req.user._id.toString()) throw new HttpError(403, 'You do not have access to this order');
  if (order.paymentMethod !== 'razorpay') throw new HttpError(400, 'This order is paid on delivery');
  if (order.status === 'cancelled') throw new HttpError(400, 'This order was cancelled');
  return order;
}

export const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = z.object({ orderId: z.string() }).parse(req.body);
  const order = await ownOrder(req, orderId);
  if (order.isPaid) throw new HttpError(400, 'This order is already paid');

  if (!keysConfigured()) return res.json({ demo: true, orderId: order._id });

  const rzOrder = await client().orders.create({
    amount: Math.round(order.totalPrice * 100),
    currency: 'INR',
    receipt: order._id.toString(),
  });
  order.set('paymentResult.razorpayOrderId', rzOrder.id);
  await order.save();
  res.json({ demo: false, keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: rzOrder.id, amount: rzOrder.amount, currency: rzOrder.currency });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const body = z.object({
    orderId: z.string(),
    demo: z.boolean().optional(),
    razorpay_order_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
  }).parse(req.body);
  const order = await ownOrder(req, body.orderId);

  if (!keysConfigured()) {
    if (!body.demo) throw new HttpError(400, 'Payments are in demo mode');
    return res.json(await markPaid(order, `demo_${Date.now()}`, true));
  }

  const { razorpay_order_id: rzOrderId, razorpay_payment_id: rzPaymentId, razorpay_signature: sig } = body;
  if (!rzOrderId || !rzPaymentId || !sig) throw new HttpError(400, 'Missing payment details');
  if (rzOrderId !== order.paymentResult?.razorpayOrderId) throw new HttpError(400, 'Payment does not match this order');

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${rzOrderId}|${rzPaymentId}`).digest('hex');
  if (!safeEqual(expected, sig)) throw new HttpError(400, 'Payment signature could not be verified');
  res.json(await markPaid(order, rzPaymentId));
});

// Razorpay -> your server. Confirms payments even if the customer closes the tab.
export const webhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ message: 'Webhook not configured' });
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (!safeEqual(expected, signature)) return res.status(400).json({ message: 'Invalid signature' });

  const event = JSON.parse(req.body.toString('utf8'));
  if (['payment.captured', 'order.paid'].includes(event.event)) {
    const entity = event.payload?.payment?.entity;
    if (entity?.order_id) {
      const order = await Order.findOne({ 'paymentResult.razorpayOrderId': entity.order_id });
      if (order) await markPaid(order, entity.id);
    }
  }
  res.json({ received: true });
});
