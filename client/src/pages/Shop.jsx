import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const FAMILIES = ['Woody', 'Floral', 'Oriental', 'Fresh', 'Citrus', 'Gourmand'];
const PRICES = [
  { label: 'Any price', min: '', max: '' },
  { label: 'Under ₹2,500', min: '', max: '2499' },
  { label: '₹2,500 to ₹3,500', min: '2500', max: '3500' },
  { label: 'Above ₹3,500', min: '3501', max: '' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const q = params.get('q') || '';
  const family = params.get('family') || '';
  const gender = params.get('gender') || '';
  const sort = params.get('sort') || 'new';
  const price = params.get('price') || '0';
  const page = Number(params.get('page') || 1);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    document.title = 'Shop | Atelier';
    setLoading(true); setError('');
    const p = PRICES[Number(price)] || PRICES[0];
    api.get('/products', { params: { q, family, gender, sort, page, limit: 12, minPrice: p.min, maxPrice: p.max } })
      .then((r) => setData(r.data))
      .catch(() => setError('We could not load the perfumes. Please try again.'))
      .finally(() => setLoading(false));
  }, [q, family, gender, sort, price, page]);

  const chip = (active) => `border px-4 py-2 text-sm transition-colors ${active ? 'border-gold bg-gold text-ink' : 'border-umber hover:border-gold'}`;

  return (
    <div className="wrap py-14">
      <h1 className="text-5xl">{family ? `${family} perfumes` : q ? `Results for “${q}”` : 'All perfumes'}</h1>
      <p className="mt-2 text-sand">{loading ? 'Loading…' : `${data.total} ${data.total === 1 ? 'perfume' : 'perfumes'}`}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-8">
          <div>
            <p className="mb-3 font-display text-lg">Family</p>
            <div className="flex flex-wrap gap-2">
              <button className={chip(!family)} onClick={() => set('family', '')}>All</button>
              {FAMILIES.map((f) => <button key={f} className={chip(family === f)} onClick={() => set('family', f)}>{f}</button>)}
            </div>
          </div>
          <div>
            <p className="mb-3 font-display text-lg">For</p>
            <div className="flex flex-wrap gap-2">
              {['', 'Women', 'Men', 'Unisex'].map((g) => <button key={g || 'any'} className={chip(gender === g)} onClick={() => set('gender', g)}>{g || 'Anyone'}</button>)}
            </div>
          </div>
          <div>
            <label className="mb-3 block font-display text-lg" htmlFor="price">Price</label>
            <select id="price" className="field" value={price} onChange={(e) => set('price', e.target.value === '0' ? '' : e.target.value)}>
              {PRICES.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-3 block font-display text-lg" htmlFor="sort">Sort by</label>
            <select id="sort" className="field" value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
              <option value="new">Newest</option>
              <option value="price_asc">Price, low to high</option>
              <option value="price_desc">Price, high to low</option>
              <option value="rating">Best rated</option>
            </select>
          </div>
          {(q || family || gender || price !== '0') && <button className="btn-quiet text-sm underline underline-offset-4" onClick={() => setParams({})}>Clear all filters</button>}
        </aside>

        <div>
          {error && <p className="border border-red-400/50 p-4 text-red-200">{error}</p>}
          {!loading && !error && data.items.length === 0 && (
            <div className="border border-umber p-10 text-center">
              <p className="font-display text-2xl">Nothing matches those filters.</p>
              <button className="btn btn-line mt-5" onClick={() => setParams({})}>Clear filters</button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3">{data.items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          {data.pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button className="btn btn-line" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Previous</button>
              <span className="text-sm text-sand">Page {page} of {data.pages}</span>
              <button className="btn btn-line" disabled={page >= data.pages} onClick={() => set('page', String(page + 1))}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
