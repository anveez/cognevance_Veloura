import { Router } from 'express';
import { stats, listCustomers } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();
r.use(protect, authorize('admin'));
r.get('/stats', stats);
r.get('/customers', listCustomers);
export default r;
