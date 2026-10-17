import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { signAccess, signRefresh, refreshCookieOptions } from '../utils/tokens.js';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});
const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

const sendAuth = (res, user, status = 200) => {
  res.cookie('refreshToken', signRefresh(user._id), refreshCookieOptions);
  res.status(status).json({ user: publicUser(user), accessToken: signAccess(user._id) });
};

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  if (await User.findOne({ email: data.email.toLowerCase() })) {
    throw new HttpError(409, 'An account with this email already exists');
  }
  const user = await User.create({ ...data, role: 'customer' }); // role can never be set from the client
  sendAuth(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }
  sendAuth(res, user);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new HttpError(401, 'No session');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new HttpError(401, 'Session expired');
  }
  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'Account not found');
  sendAuth(res, user); // rotates the refresh token
});

export const logout = (_req, res) => {
  res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: undefined });
  res.json({ message: 'Signed out' });
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug brand family accent images sizes minPrice rating numReviews');
  res.json(user.wishlist);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const id = req.params.productId;
  const has = req.user.wishlist.some((p) => p.toString() === id);
  req.user.wishlist = has ? req.user.wishlist.filter((p) => p.toString() !== id) : [...req.user.wishlist, id];
  await req.user.save();
  res.json({ wishlist: req.user.wishlist.map(String), added: !has });
});

export const wishlistIds = (req, res) => res.json({ wishlist: req.user.wishlist.map(String) });
