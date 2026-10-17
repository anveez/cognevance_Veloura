import { create } from 'zustand';

// The access token lives in memory only. The refresh token is an httpOnly cookie.
export const useAuth = create((set) => ({
  user: null,
  accessToken: null,
  ready: false,
  setAuth: (user, accessToken) => set({ user, accessToken, ready: true }),
  clear: () => set({ user: null, accessToken: null, ready: true }),
}));
