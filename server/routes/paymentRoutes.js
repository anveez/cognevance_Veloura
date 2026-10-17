import { Router } from 'express';
import { createPayment, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.post('/create', protect, createPayment);
r.post('/verify', protect, verifyPayment);
export default r;
