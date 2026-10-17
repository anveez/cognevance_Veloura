import { NavLink, Outlet } from 'react-router-dom';

const items = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
];

export default function AdminLayout() {
  return (
    <div className="wrap grid gap-8 py-10 lg:grid-cols-[200px_1fr]">
      <aside>
        <p className="mb-4 font-display text-2xl">Admin</p>
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Admin">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `whitespace-nowrap border px-4 py-2.5 text-sm transition-colors ${isActive ? 'border-gold bg-gold text-ink' : 'border-umber hover:border-gold'}`}>{i.label}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0"><Outlet /></div>
    </div>
  );
}
