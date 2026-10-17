import { Router } from 'express';
import { createOrder, validateCoupon, myOrders, getOrder, cancelOrder, adminListOrders, adminUpdateStatus } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.post('/', createOrder);
r.post('/coupon', validateCoupon);
r.get('/mine', myOrders);
r.get('/admin/all', authorize('admin'), adminListOrders);
r.put('/admin/:id/status', authorize('admin'), adminUpdateStatus);
r.get('/:id', getOrder);
r.put('/:id/cancel', cancelOrder);
export default r;
