import axios from 'axios';
import { useAuth } from '../store/auth';

const baseURL = (import.meta.env.VITE_API_URL || '') + '/api';

const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;
export const refreshAccess = () => {
  if (!refreshing) {
    refreshing = axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((r) => {
        useAuth.getState().setAuth(r.data.user, r.data.accessToken);
        return r.data.accessToken;
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
};

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const url = original?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        const token = await refreshAccess();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        useAuth.getState().clear();
      }
    }
    return Promise.reject(error);
  }
);

export const errMsg = (e, fallback = 'Something went wrong. Please try again.') =>
  e?.response?.data?.message || fallback;

export default api;
