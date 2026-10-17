import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../store/auth';
import { useWishlist } from '../store/wishlist';

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const { user, setAuth } = useAuth();
  const loadWishlist = useWishlist((s) => s.load);
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = `${isLogin ? 'Sign in' : 'Create account'} | Atelier`; }, [isLogin]);

  if (user) return <Navigate to={from} replace />;

  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { data } = await api.post(isLogin ? '/auth/login' : '/auth/register', form);
      setAuth(data.user, data.accessToken);
      loadWishlist();
      navigate(from, { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="wrap grid max-w-5xl gap-12 py-20 md:grid-cols-2">
      <div className="hidden md:block">
        <h1 className="text-5xl">{isLogin ? 'Welcome back.' : 'Join Atelier.'}</h1>
        <p className="mt-4 max-w-sm text-sand">{isLogin ? 'Sign in to see your orders, wishlist and saved details.' : 'Create an account to track orders, save favourites and check out faster.'}</p>
        {isLogin && <p className="mt-8 border border-umber p-4 text-sm text-sand">Demo accounts after seeding:<br />Customer: customer@atelier.com / Customer@123<br />Admin: admin@atelier.com / Admin@12345</p>}
      </div>
      <form onSubmit={submit} className="panel space-y-5 p-8">
        <h2 className="text-3xl md:hidden">{isLogin ? 'Sign in' : 'Create account'}</h2>
        {!isLogin && <div><label className="label" htmlFor="name">Full name</label><input id="name" required minLength={2} className="field" value={form.name} onChange={on('name')} autoComplete="name" /></div>}
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="field" value={form.email} onChange={on('email')} autoComplete="email" /></div>
        <div><label className="label" htmlFor="password">Password {!isLogin && <span className="text-sand/60">(at least 8 characters)</span>}</label><input id="password" type="password" required minLength={isLogin ? 1 : 8} className="field" value={form.password} onChange={on('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} /></div>
        {error && <p role="alert" className="border border-red-400/50 p-3 text-sm text-red-200">{error}</p>}
        <button disabled={busy} className="btn btn-gold w-full">{busy ? 'One moment…' : isLogin ? 'Sign in' : 'Create account'}</button>
        <p className="text-center text-sm text-sand">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <Link className="text-gold underline underline-offset-4" to={isLogin ? '/register' : '/login'} state={loc.state}>{isLogin ? 'Create an account' : 'Sign in'}</Link>
        </p>
      </form>
    </div>
  );
}
