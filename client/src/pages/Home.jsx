import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import ScentFinder from '../components/ScentFinder';

// The 3D story is a separate chunk so the rest of the site loads fast.
const CinematicStory = lazy(() => import('../components/CinematicStory'));

const families = [
  { name: 'Woody', text: 'Cedar, oud, vetiver and smoke.' },
  { name: 'Floral', text: 'Iris, rose and night jasmine.' },
  { name: 'Oriental', text: 'Amber, resin and warm spice.' },
  { name: 'Citrus', text: 'Peel, sunlight and clean musk.' },
  { name: 'Gourmand', text: 'Vanilla, almond and cocoa.' },
  { name: 'Fresh', text: 'Sea salt, linen and green leaves.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [no3d, setNo3d] = useState(false);

  useEffect(() => {
    document.title = 'Atelier | Fine perfume';
    api.get('/products', { params: { featured: true, limit: 4 } })
      .then((r) => setFeatured(r.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {no3d ? <Hero /> : (
        <Suspense fallback={<div className="grid min-h-[70vh] place-items-center text-sand">Loading the story…</div>}>
          <CinematicStory onFail={() => setNo3d(true)} />
        </Suspense>
      )}

      <section className="wrap pt-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="text-4xl sm:text-5xl">The house favourites</h2>
          <Link to="/shop" className="hidden text-sm text-gold underline-offset-4 hover:underline sm:block">See everything</Link>
        </div>
        {loading ? (
          <p className="text-sand">Loading the collection…</p>
        ) : featured.length === 0 ? (
          <p className="text-sand">No perfumes yet. Run <code>npm run seed</code> in the server folder to add sample products.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">{featured.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </section>

      <section className="wrap pt-28">
        <h2 className="mb-10 text-4xl sm:text-5xl">Browse by family</h2>
        <ul className="divide-y divide-umber border-y border-umber">
          {families.map((f) => (
            <li key={f.name}>
              <Link to={`/shop?family=${f.name}`} className="group flex items-baseline justify-between gap-6 py-6 transition-colors hover:bg-cocoa sm:px-4">
                <span className="font-display text-3xl transition-colors group-hover:text-gold sm:text-5xl">{f.name}</span>
                <span className="hidden text-sand sm:block">{f.text}</span>
                <span className="text-gold transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ScentFinder />

      <section className="wrap">
        <div className="grid gap-px border border-umber bg-umber md:grid-cols-3">
          {[
            ['Ships free above ₹3,000', 'Below that, shipping is a flat ₹99 anywhere in India.'],
            ['Pay your way', 'Cards, UPI and net banking through Razorpay, or cash on delivery.'],
            ['Change your mind', 'Cancel any order before it ships and the stock goes straight back.'],
          ].map(([t, d]) => (
            <div key={t} className="bg-ink p-8"><h3 className="text-2xl">{t}</h3><p className="mt-2 text-sand">{d}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}