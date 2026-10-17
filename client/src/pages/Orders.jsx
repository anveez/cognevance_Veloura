import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../store/auth';
import { toast } from '../store/toast';
import { inr, dateShort, STATUS_LABEL } from '../utils/format';
import { payOrder } from '../utils/pay';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export function StatusTrack({ order }) {
  if (order.status === 'cancelled') return <p className="text-sm text-red-300">Cancelled</p>;
  const at = STEPS.indexOf(order.status);
  return (
    <ol className="flex items-center gap-2 text-xs">
      {STEPS.filter((s) => order.paymentMethod === 'razorpay' || s !== 'pending').map((s) => (
        <li key={s} className={`flex items-center gap-2 ${STEPS.indexOf(s) <= at ? 'text-gold' : 'text-sand/50'}`}>
          <span className={`h-2 w-2 rounded-full ${STEPS.indexOf(s) <= at ? 'bg-gold' : 'bg-umber'}`} />{STATUS_LABEL[s]}
        </li>
      ))}
    </ol>
  );
}

export default function Orders() {
  const user = useAuth((s) => s.user);
  const [orders, setOrders] = useState(null);
  const [busy, setBusy] = useState('');

  const load = () => api.get('/orders/mine').then((r) => setOrders(r.data)).catch((e) => toast(errMsg(e), 'error'));
  useEffect(() => { document.title = 'My orders | Atelier'; load(); }, []);

  const pay = async (o) => {
    setBusy(o._id);
    try { await payOrder(o, user); toast('Payment received. Thank you!'); await load(); }
    catch (e) { toast(e.message || errMsg(e), 'error'); }
    finally { setBusy(''); }
  };
  const cancel = async (o) => {
    if (!window.confirm('Cancel this order?')) return;
    try { await api.put(`/orders/${o._id}/cancel`); toast('Order cancelled'); await load(); }
    catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <div className="wrap max-w-4xl py-14">
      <h1 className="text-5xl">My orders</h1>
      {orders === null && <p className="mt-8 text-sand">Loading…</p>}
      {orders?.length === 0 && (
        <div className="mt-10 border border-umber p-10 text-center">
          <p className="font-display text-2xl">No orders yet.</p>
          <Link to="/shop" className="btn btn-gold mt-5">Find a perfume</Link>
        </div>
      )}
      <div className="mt-10 space-y-6">
        {orders?.map((o) => (
          <article key={o._id} className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">Order #{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-sand">{dateShort(o.createdAt)} · {o.paymentMethod === 'cod' ? 'Cash on delivery' : o.isPaid ? 'Paid online' : 'Awaiting payment'}</p>
              </div>
              <p className="text-lg text-gold">{inr(o.totalPrice)}</p>
            </div>
            <ul className="mt-4 divide-y divide-umber text-sm">
              {o.items.map((i) => <li key={`${i.product}${i.size}`} className="flex justify-between py-2"><span>{i.name} · {i.size}ml × {i.qty}</span><span>{inr(i.price * i.qty)}</span></li>)}
            </ul>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <StatusTrack order={o} />
              <div className="flex gap-2">
                {o.paymentMethod === 'razorpay' && !o.isPaid && o.status !== 'cancelled' && <button disabled={busy === o._id} onClick={() => pay(o)} className="btn btn-gold py-2">{busy === o._id ? 'Opening…' : 'Pay now'}</button>}
                {['pending', 'processing'].includes(o.status) && <button onClick={() => cancel(o)} className="btn btn-line py-2">Cancel order</button>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
