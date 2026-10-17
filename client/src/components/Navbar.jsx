import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useCart, cartCount } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import api from '../api/client';
import SearchPalette from './SearchPalette';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?family=Woody', label: 'Woody' },
  { to: '/shop?family=Floral', label: 'Floral' },
  { to: '/shop?family=Oriental', label: 'Oriental' },
];

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const { user, clear } = useAuth();
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const resetWishlist = useWishlist((s) => s.reset);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clear(); resetWishlist(); setMenu(false); navigate('/');
  };

  const count = cartCount(items);
  const linkCls = ({ isActive }) => `text-sm transition-colors hover:text-gold ${isActive ? 'text-gold' : 'text-parchment'}`;

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-gold px-4 py-2 text-center text-xs text-ink">
        Free shipping on orders above ₹3,000. Use code <strong>WELCOME10</strong> for 10% off your first order.
      </div>
      <div className={`transition-colors duration-300 ${scrolled ? 'border-b border-umber bg-ink/95 backdrop-blur' : 'bg-ink'}`}>
        <div className="wrap flex h-16 items-center justify-between gap-6">
          <Link to="/" className="font-display text-2xl tracking-wide">Atelier</Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {links.map((l) => (<NavLink key={l.label} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setSearch(true)} aria-label="Search (Ctrl+K)" className="grid h-10 w-10 place-items-center hover:text-gold">
              <Icon d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3" />
            </button>
            {user ? (
              <div className="relative">
                <button onClick={() => setMenu((m) => !m)} aria-label="Account" aria-expanded={menu} className="grid h-10 w-10 place-items-center hover:text-gold">
                  <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                </button>
                {menu && (
                  <div className="absolute right-0 top-11 w-52 border border-umber bg-ink py-2 text-sm" onMouseLeave={() => setMenu(false)}>
                    <p className="truncate px-4 py-2 text-sand">{user.name}</p>
                    <Link onClick={() => setMenu(false)} to="/orders" className="block px-4 py-2 hover:bg-cocoa">My orders</Link>
                    <Link onClick={() => setMenu(false)} to="/wishlist" className="block px-4 py-2 hover:bg-cocoa">Wishlist</Link>
                    {user.role === 'admin' && <Link onClick={() => setMenu(false)} to="/admin" className="block px-4 py-2 text-gold hover:bg-cocoa">Admin dashboard</Link>}
                    <button onClick={logout} className="block w-full px-4 py-2 text-left hover:bg-cocoa">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-3 text-sm hover:text-gold">Sign in</Link>
            )}
            <button onClick={() => setOpen(true)} aria-label={`Open bag, ${count} items`} className="relative grid h-10 w-10 place-items-center hover:text-gold">
              <Icon d="M6 7h12l1 13H5L6 7zM9 7a3 3 0 016 0" />
              {count > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center bg-gold px-1 text-[10px] font-semibold text-ink">{count}</span>}
            </button>
          </div>
        </div>
        <nav className="wrap flex gap-6 overflow-x-auto pb-3 md:hidden" aria-label="Main mobile">
          {links.map((l) => (<NavLink key={l.label} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>))}
        </nav>
      </div>
      <SearchPalette open={search} onClose={() => setSearch(false)} />
    </header>
  );
}
