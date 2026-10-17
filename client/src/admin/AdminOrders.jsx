import { Fragment, useEffect, useState } from 'react';
import api, { errMsg } from '../api/client';
import { toast } from '../store/toast';
import { inr, dateShort, STATUS_LABEL } from '../utils/format';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  const load = () => api.get('/orders/admin/all', { params: { status, page } }).then((r) => setData(r.data)).catch((e) => toast(errMsg(e), 'error'));
  useEffect(() => { document.title = 'Orders | Atelier'; load(); /* eslint-disable-next-line */ }, [status, page]);

  const update = async (o, next) => {
    try { await api.put(`/orders/admin/${o._id}/status`, { status: next }); toast(`Order marked ${STATUS_LABEL[next].toLowerCase()}`); load(); }
    catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Orders</h1>
        <select aria-label="Filter by status" className="field w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      {!data ? <p className="text-sand">Loading…</p> : data.items.length === 0 ? <p className="text-sand">No orders match this filter.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-umber text-sand"><tr><th className="py-3 font-normal">Order</th><th className="font-normal">Customer</th><th className="font-normal">Date</th><th className="font-normal">Total</th><th className="font-normal">Payment</th><th className="font-normal">Status</th></tr></thead>
            <tbody className="divide-y divide-umber">
              {data.items.map((o) => (
                <Fragment key={o._id}>
                  <tr>
                    <td className="py-3"><button className="text-gold underline-offset-4 hover:underline" onClick={() => setOpen(open === o._id ? null : o._id)}>#{o._id.slice(-8).toUpperCase()}</button></td>
                    <td>{o.user?.name}<br /><span className="text-xs text-sand">{o.user?.email}</span></td>
                    <td>{dateShort(o.createdAt)}</td><td>{inr(o.totalPrice)}</td>
                    <td>{o.paymentMethod === 'cod' ? 'COD' : 'Online'} · {o.isPaid ? <span className="text-gold">Paid</span> : <span className="text-sand">Unpaid</span>}</td>
                    <td>
                      <select aria-label={`Status for order ${o._id.slice(-8)}`} className="field w-auto py-2" value={o.status} disabled={o.status === 'cancelled'} onChange={(e) => update(o, e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                  {open === o._id && (
                    <tr><td colSpan={6} className="bg-cocoa p-4">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <ul className="space-y-1">{o.items.map((i) => <li key={`${i.product}${i.size}`}>{i.name} · {i.size}ml × {i.qty} <span className="text-sand">({inr(i.price * i.qty)})</span></li>)}</ul>
                        <div className="text-sand"><p className="text-parchment">{o.shippingAddress.fullName} · {o.shippingAddress.phone}</p><p>{o.shippingAddress.line1}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.postalCode}</p>{o.couponCode && <p className="mt-2">Coupon {o.couponCode}: − {inr(o.discount)}</p>}</div>
                      </div>
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data?.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button className="btn btn-line" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="text-sm text-sand">Page {page} of {data.pages}</span>
          <button className="btn btn-line" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
