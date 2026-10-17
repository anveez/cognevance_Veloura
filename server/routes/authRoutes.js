import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, me, getWishlist, toggleWishlist, wishlistIds } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

const r = Router();
r.post('/register', limiter, register);
r.post('/login', limiter, login);
r.post('/refresh', refresh);
r.post('/logout', logout);
r.get('/me', protect, me);
r.get('/wishlist', protect, getWishlist);
r.get('/wishlist/ids', protect, wishlistIds);
r.put('/wishlist/:productId', protect, toggleWishlist);
export default r;
