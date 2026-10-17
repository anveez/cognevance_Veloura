import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/client';
import { inr, dateShort } from '../utils/format';

export default function AdminCustomers() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { document.title = 'Customers | Atelier'; api.get('/admin/customers').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e))); }, []);

  return (
    <div>
      <h1 className="mb-6 text-4xl">Customers</h1>
      {error && <p className="text-red-200">{error}</p>}
      {!rows && !error && <p className="text-sand">Loading…</p>}
      {rows?.length === 0 && <p className="text-sand">No customers have signed up yet.</p>}
      {rows?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-umber text-sand"><tr><th className="py-3 font-normal">Name</th><th className="font-normal">Email</th><th className="font-normal">Joined</th><th className="font-normal">Orders</th><th className="font-normal">Spent</th></tr></thead>
            <tbody className="divide-y divide-umber">
              {rows.map((c) => <tr key={c.id}><td className="py-3">{c.name}</td><td className="text-sand">{c.email}</td><td>{dateShort(c.joined)}</td><td>{c.orders}</td><td>{inr(c.spent)}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
