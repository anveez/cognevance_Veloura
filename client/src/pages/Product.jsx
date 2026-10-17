import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import Stars from '../components/Stars';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { toast } from '../store/toast';
import { inr, dateShort } from '../utils/format';

function NoteRow({ title, notes = [] }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4 border-t border-umber py-4">
      <p className="font-display text-lg">{title}</p>
      <p className="text-sand">{notes.length ? notes.join(', ') : '-'}</p>
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const add = useCart((s) => s.add);
  const user = useAuth((s) => s.user);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setP(null); setError(''); setImg(0); setQty(1);
    api.get(`/products/${slug}`)
      .then((r) => {
        setP(r.data);
        const firstInStock = r.data.sizes.find((s) => s.stock > 0) || r.data.sizes[0];
        setSize(firstInStock.ml);
        document.title = `${r.data.name} | Atelier`;
        return api.get('/products', { params: { family: r.data.family, limit: 5 } });
      })
      .then((r) => setRelated(r.data.items.filter((x) => x.slug !== slug).slice(0, 4)))
      .catch((e) => setError(e?.response?.status === 404 ? 'We could not find that perfume.' : errMsg(e)));
  }, [slug]);

  if (error) return <div className="wrap py-32 text-center"><p className="font-display text-3xl">{error}</p><Link to="/shop" className="btn btn-gold mt-6">Back to the shop</Link></div>;
  if (!p) return <div className="wrap py-32 text-sand">Loading…</div>;

  const current = p.sizes.find((s) => s.ml === size);
  const out = !current || current.stock <= 0;

  const addToBag = () => {
    add({ productId: p._id, slug: p.slug, name: p.name, size: current.ml, price: current.price, qty, stock: current.stock, accent: p.accent, image: p.images?.[0]?.url || '' });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post(`/products/${p._id}/reviews`, { rating, comment });
      setP(data); setComment(''); toast('Thanks for your review');
    } catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="wrap py-12">
      <nav className="mb-8 text-sm text-sand" aria-label="Breadcrumb">
        <Link to="/shop" className="hover:text-parchment">Shop</Link> / <Link to={`/shop?family=${p.family}`} className="hover:text-parchment">{p.family}</Link> / {p.name}
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden border border-umber bg-gradient-to-b from-cocoa to-ink">
            <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(55% 50% at 50% 65%, ${p.accent}, transparent 70%)` }} />
            <ProductImage product={p} index={img} className="relative h-full w-full p-10" />
          </div>
          {p.images?.length > 1 && (
            <div className="mt-3 flex gap-3">
              {p.images.map((im, k) => (
                <button key={im.url} onClick={() => setImg(k)} aria-label={`Show image ${k + 1}`} className={`h-20 w-20 border ${k === img ? 'border-gold' : 'border-umber'}`}>
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-sand">{p.brand} · {p.family} · {p.gender}</p>
          <h1 className="mt-2 text-5xl sm:text-6xl">{p.name}</h1>
          <div className="mt-4"><Stars value={p.rating} count={p.numReviews} /></div>
          <p className="mt-6 max-w-xl text-lg text-parchment/90">{p.description}</p>

          <div className="mt-8">
            <p className="mb-3 text-sm text-sand">Size</p>
            <div className="flex flex-wrap gap-3">
              {p.sizes.map((s) => (
                <button
                  key={s.ml} disabled={s.stock <= 0} onClick={() => { setSize(s.ml); setQty(1); }}
                  className={`min-w-28 border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${s.ml === size ? 'border-gold bg-umber/60' : 'border-umber hover:border-gold'}`}
                >
                  <span className="block font-display text-xl">{s.ml}ml</span>
                  <span className="text-sm text-gold">{inr(s.price)}</span>
                  {s.stock <= 0 && <span className="block text-xs text-sand">Sold out</span>}
                </button>
              ))}
            </div>
            {current && current.stock > 0 && current.stock <= 5 && <p className="mt-3 text-sm text-gold">Only {current.stock} left in {current.ml}ml.</p>}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center border border-umber">
              <button aria-label="Decrease quantity" className="h-12 w-12 hover:bg-umber" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="w-10 text-center">{qty}</span>
              <button aria-label="Increase quantity" className="h-12 w-12 hover:bg-umber" onClick={() => setQty((q) => Math.min(q + 1, Math.min(current?.stock || 1, 10)))}>+</button>
            </div>
            <button disabled={out} onClick={addToBag} className="btn btn-gold h-12 flex-1 sm:flex-none sm:px-12">
              {out ? 'Sold out' : `Add to bag · ${inr((current?.price || 0) * qty)}`}
            </button>
          </div>

          <div className="mt-12">
            <h2 className="mb-4 text-2xl">Scent notes</h2>
            <NoteRow title="Top" notes={p.notes?.top} />
            <NoteRow title="Heart" notes={p.notes?.heart} />
            <NoteRow title="Base" notes={p.notes?.base} />
            <div className="border-t border-umber" />
          </div>
        </div>
      </div>

      <section className="mt-24 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl">Reviews</h2>
          {p.reviews?.length === 0 && <p className="mt-4 text-sand">No reviews yet. Be the first to share how it wears.</p>}
          <ul className="mt-6 divide-y divide-umber">
            {p.reviews?.map((r) => (
              <li key={r._id} className="py-5">
                <div className="flex items-center justify-between"><Stars value={r.rating} /><span className="text-xs text-sand">{dateShort(r.createdAt)}</span></div>
                <p className="mt-2 text-sm text-sand">{r.name}</p>
                {r.comment && <p className="mt-1">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl">Write a review</h2>
          {user ? (
            <form onSubmit={submitReview} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="rating">Your rating</label>
                <select id="rating" className="field" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'star' : 'stars'}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="comment">Your thoughts</label>
                <textarea id="comment" rows={4} className="field" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="How does it wear? How long does it last?" />
              </div>
              <button disabled={busy} className="btn btn-line">{busy ? 'Posting…' : 'Post review'}</button>
            </form>
          ) : (
            <p className="mt-4 text-sand"><Link className="text-gold underline underline-offset-4" to="/login" state={{ from: `/product/${p.slug}` }}>Sign in</Link> to leave a review.</p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-3xl">More {p.family.toLowerCase()} perfumes</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">{related.map((r) => <ProductCard key={r._id} product={r} />)}</div>
        </section>
      )}
    </div>
  );
}
