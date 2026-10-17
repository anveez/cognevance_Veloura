import { create } from 'zustand';

let n = 0;
export const useToast = create((set) => ({
  items: [],
  push: (message, type = 'ok') => {
    const id = ++n;
    set((s) => ({ items: [...s.items, { id, message, type }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 3500);
  },
}));
export const toast = (m, t) => useToast.getState().push(m, t);
