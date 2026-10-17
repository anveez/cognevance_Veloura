import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useCart, lineKey, cartSubtotal, shippingFor } from '../store/cart';
import { useAuth } from '../store/auth';
import { toast } from '../store/toast';
import { inr } from '../utils/format';
import { payOrder } from '../utils/pay';

const empty = { fullName: '', phone: '', line1: '', city: '', state: '', postalCode: '', country: 'India' };

export default function Checkout() {
  const { items, clear } = useCart();
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [addr, setAddr] = useState({ ...empty, fullName: user?.name || '' });
  const [method, setMethod] = useState('razorpay');
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cartSubtotal(items);
  const discount = coupon?.discount || 0;
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;

  const on = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });

  const applyCoupon = async () => {
    if (!code.trim()) return;
    try {
      const { data } = await api.post('/orders/coupon', { code, subtotal });
      setCoupon(data); toast(`${data.code} applied: ${data.percent}% off`);
    } catch (e) { setCoupon(null); toast(errMsg(e), 'error'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    let order;
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product: i.productId, size: i.size, qty: i.qty })),
        shippingAddress: addr, paymentMethod: method, couponCode: coupon?.code,
      });
      order = data;
    } catch (err) { setError(errMsg(err)); setBusy(false); return; }

    clear();
    if (method === 'cod') { navigate(`/order/${order._id}/success`); return; }
    try {
      await payOrder(order, user);
      navigate(`/order/${order._id}/success`);
    } catch (err) {
      toast(err.message, 'error');
      navigate('/orders');
    }
  };

  if (items.length === 0) {
    return <div className="wrap py-32 text-center"><p className="font-display text-3xl">Your bag is empty.</p><Link to="/shop" className="btn btn-gold mt-6">Browse perfumes</Link></div>;
  }

  return (
    <form onSubmit={submit} className="wrap grid gap-12 py-14 lg:grid-cols-[1fr_400px]">
      <div className="space-y-10">
        <h1 className="text-5xl">Checkout</h1>

        <section>
          <h2 className="mb-5 text-2xl">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="fullName">Full name</label><input id="fullName" required className="field" value={addr.fullName} onChange={on('fullName')} autoComplete="name" /></div>
            <div><label className="label" htmlFor="phone">Phone</label><input id="phone" required className="field" value={addr.phone} onChange={on('phone')} autoComplete="tel" inputMode="tel" /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="line1">Address</label><input id="line1" required className="field" value={addr.line1} onChange={on('line1')} autoComplete="street-address" /></div>
            <div><label className="label" htmlFor="city">City</label><input id="city" required className="field" value={addr.city} onChange={on('city')} autoComplete="address-level2" /></div>
            <div><label className="label" htmlFor="state">State</label><input id="state" required className="field" value={addr.state} onChange={on('state')} autoComplete="address-level1" /></div>
            <div><label className="label" htmlFor="postalCode">PIN code</label><input id="postalCode" required className="field" value={addr.postalCode} onChange={on('postalCode')} autoComplete="postal-code" inputMode="numeric" /></div>
            <div><label className="label" htmlFor="country">Country</label><input id="country" required className="field" value={addr.country} onChange={on('country')} autoComplete="country-name" /></div>
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-2xl">Payment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[['razorpay', 'Pay online', 'Cards, UPI and net banking'], ['cod', 'Cash on delivery', 'Pay when it arrives']].map(([v, t, d]) => (
              <label key={v} className={`cursor-pointer border p-4 transition-colors ${method === v ? 'border-gold bg-umber/50' : 'border-umber hover:border-gold/60'}`}>
                <input type="radio" name="method" value={v} checked={method === v} onChange={() => setMethod(v)} className="sr-only" />
                <span className="block font-display text-xl">{t}</span><span className="text-sm text-sand">{d}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className="panel h-fit space-y-5 p-6 lg:sticky lg:top-32">
        <h2 className="text-2xl">Your order</h2>
        <ul className="divide-y divide-umber">
          {items.map((i) => (
            <li key={lineKey(i)} className="flex justify-between gap-3 py-3 text-sm">
              <span>{i.name} <span className="text-sand">· {i.size}ml × {i.qty}</span></span><span>{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input className="field" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Coupon code" />
          <button type="button" className="btn btn-line" onClick={applyCoupon}>Apply</button>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-sand">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-gold"><dt>Discount ({coupon.code})</dt><dd>− {inr(discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-sand">Shipping</dt><dd>{shipping === 0 ? 'Free' : inr(shipping)}</dd></div>
          <div className="flex justify-between border-t border-umber pt-3 text-lg"><dt>Total</dt><dd className="text-gold">{inr(total)}</dd></div>
        </dl>
        {error && <p role="alert" className="border border-red-400/50 p-3 text-sm text-red-200">{error}</p>}
        <button disabled={busy} className="btn btn-gold w-full">{busy ? 'Placing your order…' : method === 'cod' ? 'Place order' : `Pay ${inr(total)}`}</button>
        <p className="text-xs text-sand">Final prices are confirmed by our server when you place the order.</p>
      </aside>
    </form>
  );
}
