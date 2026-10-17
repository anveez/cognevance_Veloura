import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { inr } from '../utils/format';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Order placed | Atelier';
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <div className="wrap py-32 text-center text-sand">{error}</div>;
  if (!order) return <div className="wrap py-32 text-sand">Loading…</div>;

  return (
    <div className="wrap max-w-2xl py-24 text-center">
      <h1 className="text-5xl">Thank you, {order.shippingAddress.fullName.split(' ')[0]}.</h1>
      <p className="mt-4 text-sand">
        Order <span className="text-parchment">#{order._id.slice(-8).toUpperCase()}</span> is {order.isPaid ? 'paid and' : 'confirmed and'} being prepared. We will ship it to {order.shippingAddress.city}.
      </p>
      <div className="panel mt-10 p-6 text-left">
        <ul className="divide-y divide-umber">
          {order.items.map((i) => (
            <li key={`${i.product}${i.size}`} className="flex justify-between py-3 text-sm"><span>{i.name} · {i.size}ml × {i.qty}</span><span>{inr(i.price * i.qty)}</span></li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-umber pt-3"><span>Total {order.paymentMethod === 'cod' ? '(pay on delivery)' : ''}</span><span className="text-gold">{inr(order.totalPrice)}</span></div>
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/orders" className="btn btn-gold">View my orders</Link>
        <Link to="/shop" className="btn btn-line">Keep browsing</Link>
      </div>
    </div>
  );
}
