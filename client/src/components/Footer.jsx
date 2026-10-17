import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-umber">
      <div className="wrap grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl">Atelier</p>
          <p className="mt-3 max-w-sm text-sand">Small-batch perfumes, blended in the dark and made to be worn in the light.</p>
        </div>
        <div>
          <p className="mb-3 font-display text-lg">Shop</p>
          <ul className="space-y-2 text-sm text-sand">
            <li><Link className="hover:text-parchment" to="/shop">All perfumes</Link></li>
            <li><Link className="hover:text-parchment" to="/shop?family=Woody">Woody</Link></li>
            <li><Link className="hover:text-parchment" to="/shop?family=Floral">Floral</Link></li>
            <li><Link className="hover:text-parchment" to="/shop?family=Oriental">Oriental</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-display text-lg">Your account</p>
          <ul className="space-y-2 text-sm text-sand">
            <li><Link className="hover:text-parchment" to="/orders">My orders</Link></li>
            <li><Link className="hover:text-parchment" to="/wishlist">Wishlist</Link></li>
            <li><Link className="hover:text-parchment" to="/login">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-umber py-5 text-center text-xs text-sand">© {new Date().getFullYear()} Atelier. A demo store built with the MERN stack.</div>
    </footer>
  );
}
