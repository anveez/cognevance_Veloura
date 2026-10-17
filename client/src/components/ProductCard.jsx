import { Link, useNavigate } from 'react-router-dom';
import ProductImage from './ProductImage';
import Stars from './Stars';
import { inr } from '../utils/format';
import { useAuth } from '../store/auth';
import { useWishlist } from '../store/wishlist';
import { toast } from '../store/toast';

export default function ProductCard({ product }) {
  const user = useAuth((s) => s.user);
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const navigate = useNavigate();
  const liked = ids.includes(product._id);
  const soldOut = product.sizes?.every((s) => s.stock <= 0);

  const onHeart = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: '/shop' } });
    try {
      const added = await toggle(product._id);
      toast(added ? 'Saved to your wishlist' : 'Removed from your wishlist');
    } catch { toast('Could not update your wishlist', 'error'); }
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden border border-umber bg-gradient-to-b from-cocoa to-ink transition-colors duration-300 group-hover:border-gold/60">
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: `radial-gradient(60% 50% at 50% 62%, ${product.accent}, transparent 70%)` }}
        />
        <ProductImage product={product} className="relative h-full w-full p-8 transition-transform duration-500 group-hover:scale-[1.04]" />
        <button
          onClick={onHeart}
          aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center bg-ink/60 backdrop-blur transition-colors hover:bg-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#c9a45c' : 'none'} stroke="#c9a45c" strokeWidth="1.6">
            <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5 6.5 5c2 0 3.5 1.2 5.5 3.3C14 6.2 15.5 5 17.5 5 21 5 22.8 8.6 21.5 11.8 19.500 16.400 12 21 12 21z" />
          </svg>
        </button>
        {soldOut && <span className="absolute left-3 top-3 bg-ink/80 px-2.5 py-1 text-xs text-sand">Sold out</span>}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">{product.name}</h3>
          <p className="mt-0.5 text-sm text-sand">{product.family} · {product.gender}</p>
        </div>
        <p className="whitespace-nowrap pt-1 text-sm text-gold">from {inr(product.minPrice)}</p>
      </div>
      {product.numReviews > 0 && <div className="mt-2"><Stars value={product.rating} count={product.numReviews} /></div>}
    </Link>
  );
}
