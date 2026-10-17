import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart, lineKey, cartSubtotal, shippingFor, FREE_SHIPPING_ABOVE } from '../store/cart';
import ProductImage from './ProductImage';
import { inr } from '../utils/format';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove } = useCart();
  const navigate = useNavigate();
  const subtotal = cartSubtotal(items);
  const left = Math.max(FREE_SHIPPING_ABOVE - subtotal, 0);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog" aria-label="Your bag"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-umber bg-ink"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b border-umber px-6 py-5">
              <h2 className="text-2xl">Your bag</h2>
              <button onClick={() => setOpen(false)} className="btn-quiet text-sm">Close</button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="font-display text-2xl">Your bag is empty.</p>
                <p className="text-sand">Start with the collection and add something you like.</p>
                <Link to="/shop" onClick={() => setOpen(false)} className="btn btn-gold">Browse perfumes</Link>
              </div>
            ) : (
              <>
                <div className="border-b border-umber px-6 py-4 text-sm">
                  {left > 0 ? (
                    <p className="text-sand">Add <span className="text-gold">{inr(left)}</span> more for free shipping.</p>
                  ) : (
                    <p className="text-gold">Your order ships free.</p>
                  )}
                  <div className="mt-2 h-px bg-umber"><div className="h-px bg-gold transition-all" style={{ width: `${Math.min(subtotal / FREE_SHIPPING_ABOVE, 1) * 100}%` }} /></div>
                </div>
                <ul className="flex-1 divide-y divide-umber overflow-y-auto px-6">
                  {items.map((i) => (
                    <li key={lineKey(i)} className="flex gap-4 py-5">
                      <Link to={`/product/${i.slug}`} onClick={() => setOpen(false)} className="h-24 w-20 shrink-0 border border-umber bg-cocoa">
                        <ProductImage product={{ name: i.name, accent: i.accent, images: i.image ? [{ url: i.image }] : [] }} className="h-full w-full p-2" />
                      </Link>
                      <div className="flex-1">
                        <div className="flex justify-between gap-2">
                          <p className="font-display text-lg">{i.name}</p>
                          <p className="text-sm">{inr(i.price * i.qty)}</p>
                        </div>
                        <p className="text-sm text-sand">{i.size}ml · {inr(i.price)} each</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-umber">
                            <button aria-label="Decrease quantity" className="h-8 w-8 hover:bg-umber" onClick={() => setQty(lineKey(i), i.qty - 1)}>−</button>
                            <span className="w-8 text-center text-sm">{i.qty}</span>
                            <button aria-label="Increase quantity" className="h-8 w-8 hover:bg-umber" onClick={() => setQty(lineKey(i), i.qty + 1)}>+</button>
                          </div>
                          <button className="text-sm text-sand underline-offset-4 hover:text-parchment hover:underline" onClick={() => remove(lineKey(i))}>Remove</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-umber px-6 py-5">
                  <div className="flex justify-between text-sm"><span className="text-sand">Subtotal</span><span>{inr(subtotal)}</span></div>
                  <div className="mt-1 flex justify-between text-sm"><span className="text-sand">Shipping</span><span>{shippingFor(subtotal) === 0 ? 'Free' : inr(shippingFor(subtotal))}</span></div>
                  <button className="btn btn-gold mt-4 w-full" onClick={() => { setOpen(false); navigate('/checkout'); }}>Checkout</button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
