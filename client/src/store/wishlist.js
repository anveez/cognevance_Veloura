import { create } from 'zustand';
import api from '../api/client';

export const useWishlist = create((set) => ({
  ids: [],
  load: async () => {
    try {
      const { data } = await api.get('/auth/wishlist/ids');
      set({ ids: data.wishlist });
    } catch { /* not signed in */ }
  },
  reset: () => set({ ids: [] }),
  toggle: async (productId) => {
    const { data } = await api.put(`/auth/wishlist/${productId}`);
    set({ ids: data.wishlist });
    return data.added;
  },
}));
