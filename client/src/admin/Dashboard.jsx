import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errMsg } from '../api/client';
import { inr, dateShort, STATUS_LABEL } from '../utils/format';

const Stat = ({ label, value, hint }) => (
  <div className="panel p-5"><p className="text-sm text-sand">{label}</p><p className="mt-1 font-display text-3xl text-gold">{value}</p>{hint && <p className="mt-1 text-xs text-sand">{hint}</p>}</div>
);
const tip = { background: '#241810', border: '1px solid #3a281b', color: '#efe3cc', borderRadius: 0 };

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { document.title = 'Dashboard | Atelier'; api.get('/admin/stats').then((r) => setS(r.data)).catch((e) => setError(errMsg(e))); }, []);

  if (error) return <p className="text-red-200">{error}</p>;
  if (!s) return <p className="text-sand">Loading your numbers…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Revenue" value={inr(s.revenue)} hint={`${s.paidOrders} paid orders`} />
        <Stat label="Average order" value={inr(s.averageOrder)} />
        <Stat label="Customers" value={s.customers} />
        <Stat label="Products" value={s.products} />
      </div>

      <section className="panel p-5">
        <h2 className="mb-4 text-2xl">Revenue, last 30 days</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={s.salesByDay} margin={{ left: 0, right: 8, top: 8 }}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9a45c" stopOpacity={0.5} /><stop offset="1" stopColor="#c9a45c" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#3a281b" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="#b9a98c" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis stroke="#b9a98c" tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} width={40} />
              <Tooltip contentStyle={tip} formatter={(v, n) => [n === 'revenue' ? inr(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
              <Area type="monotone" dataKey="revenue" stroke="#c9a45c" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 text-2xl">Best sellers</h2>
          {s.topProducts.length === 0 ? <p className="text-sand">No paid orders yet.</p> : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={s.topProducts} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <CartesianGrid stroke="#3a281b" horizontal={false} />
                  <XAxis type="number" stroke="#b9a98c" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#b9a98c" tick={{ fontSize: 12 }} width={110} />
                  <Tooltip contentStyle={tip} cursor={{ fill: '#3a281b55' }} formatter={(v) => [v, 'Units sold']} />
                  <Bar dataKey="units" fill="#b5651d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 text-2xl">Orders by status</h2>
          <ul className="space-y-3">
            {s.statusCounts.length === 0 && <li className="text-sand">No orders yet.</li>}
            {s.statusCounts.map((c) => {
              const max = Math.max(...s.statusCounts.map((x) => x.count));
              return (
                <li key={c.status}>
                  <div className="mb-1 flex justify-between text-sm"><span>{STATUS_LABEL[c.status] || c.status}</span><span className="text-sand">{c.count}</span></div>
                  <div className="h-1.5 bg-umber"><div className="h-1.5 bg-gold" style={{ width: `${(c.count / max) * 100}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 text-2xl">Low stock</h2>
          {s.lowStock.length === 0 ? <p className="text-sand">Everything is well stocked.</p> : (
            <ul className="divide-y divide-umber text-sm">
              {s.lowStock.map((l, k) => <li key={k} className="flex justify-between py-2"><span>{l.name} · {l.ml}ml</span><span className={l.stock === 0 ? 'text-red-300' : 'text-gold'}>{l.stock === 0 ? 'Sold out' : `${l.stock} left`}</span></li>)}
            </ul>
          )}
        </section>
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl">Recent orders</h2><Link to="/admin/orders" className="text-sm text-gold underline-offset-4 hover:underline">View all</Link></div>
          {s.recentOrders.length === 0 ? <p className="text-sand">No orders yet.</p> : (
            <ul className="divide-y divide-umber text-sm">
              {s.recentOrders.map((o) => <li key={o._id} className="flex justify-between gap-3 py-2"><span>{o.user?.name || 'Customer'} <span className="text-sand">· {dateShort(o.createdAt)}</span></span><span>{inr(o.totalPrice)}</span></li>)}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
