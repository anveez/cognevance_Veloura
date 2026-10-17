import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../store/wishlist';

export default function Wishlist() {
  const [items, setItems] = useState(null);
  const ids = useWishlist((s) => s.ids);

  useEffect(() => { document.title = 'Wishlist | Atelier'; api.get('/auth/wishlist').then((r) => setItems(r.data)).catch(() => setItems([])); }, []);
  const visible = items?.filter((p) => ids.includes(p._id));

  return (
    <div className="wrap py-14">
      <h1 className="text-5xl">Wishlist</h1>
      {items === null && <p className="mt-8 text-sand">Loading…</p>}
      {visible?.length === 0 && (
        <div className="mt-10 border border-umber p-10 text-center"><p className="font-display text-2xl">Nothing saved yet.</p><p className="mt-2 text-sand">Tap the heart on any perfume to keep it here.</p><Link to="/shop" className="btn btn-gold mt-5">Browse perfumes</Link></div>
      )}
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">{visible?.map((p) => <ProductCard key={p._id} product={p} />)}</div>
    </div>
  );
}
