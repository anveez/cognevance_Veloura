import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const FREE_SHIPPING_ABOVE = 3000;
export const SHIPPING_FEE = 99;
export const lineKey = (l) => `${l.productId}:${l.size}`;
const maxFor = (l) => Math.min(l.stock ?? 10, 10);

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (line) =>
        set((s) => {
          const key = lineKey(line);
          const existing = s.items.find((i) => lineKey(i) === key);
          if (existing) {
            return {
              open: true,
              items: s.items.map((i) =>
                lineKey(i) === key ? { ...i, stock: line.stock, price: line.price, qty: Math.min(i.qty + line.qty, maxFor(line)) } : i
              ),
            };
          }
          return { open: true, items: [...s.items, { ...line, qty: Math.min(line.qty, maxFor(line)) }] };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items.map((i) => (lineKey(i) === key ? { ...i, qty: Math.max(1, Math.min(qty, maxFor(i))) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => lineKey(i) !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'atelier-bag', partialize: (s) => ({ items: s.items }) }
  )
);

export const cartSubtotal = (items) => items.reduce((a, i) => a + i.price * i.qty, 0);
export const cartCount = (items) => items.reduce((a, i) => a + i.qty, 0);
export const shippingFor = (amount) => (amount >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE);
