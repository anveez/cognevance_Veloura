import Coupon from '../models/Coupon.js';
import { HttpError } from './http.js';

export const FREE_SHIPPING_ABOVE = 3000;
export const SHIPPING_FEE = 99;

export const shippingFor = (itemsPrice) => (itemsPrice >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE);

export async function applyCoupon(code, subtotal) {
  if (!code) return { coupon: null, discount: 0 };
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true });
  if (!coupon) throw new HttpError(400, 'This coupon code is not valid');
  if (subtotal < coupon.minOrder) {
    throw new HttpError(400, `This coupon needs a minimum order of ₹${coupon.minOrder}`);
  }
  const discount = Math.round((subtotal * coupon.percent) / 100);
  return { coupon, discount };
}
