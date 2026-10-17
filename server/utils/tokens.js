import jwt from 'jsonwebtoken';

export const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

export const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const prod = process.env.NODE_ENV === 'production';
export const refreshCookieOptions = {
  httpOnly: true,
  secure: prod,
  sameSite: prod ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};
