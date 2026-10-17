import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import ProductImage from './ProductImage';
import { inr } from '../utils/format';

export default function SearchPalette({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) { setQ(''); setResults([]); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/products', { params: { q: q.trim(), limit: 6 } });
        setResults(data.items);
      } finally { setLoading(false); }
    }, 220);
    return () => clearTimeout(t);
  }, [q, open]);

  if (!open) return null;
  const go = (e) => { e.preventDefault(); if (q.trim()) { onClose(); navigate(`/shop?q=${encodeURIComponent(q.trim())}`); } };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 pt-[12vh]" onClick={onClose} role="dialog" aria-label="Search">
      <div className="w-full max-w-xl border border-umber bg-ink" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={go} className="border-b border-umber">
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="Search by name, note or family: oud, rose, citrus…"
            className="w-full bg-transparent px-5 py-4 text-base outline-none placeholder:text-sand/50"
          />
        </form>
        <div className="max-h-[50vh] overflow-y-auto">
          {q.trim().length < 2 && <p className="px-5 py-6 text-sm text-sand">Type at least two letters. Press Esc to close.</p>}
          {q.trim().length >= 2 && !loading && results.length === 0 && <p className="px-5 py-6 text-sm text-sand">Nothing matches “{q}”. Try a note like amber or jasmine.</p>}
          {results.map((p) => (
            <Link key={p._id} to={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-4 px-5 py-3 hover:bg-cocoa">
              <div className="h-14 w-12 shrink-0 border border-umber bg-cocoa"><ProductImage product={p} className="h-full w-full p-1" /></div>
              <div className="flex-1"><p className="font-display text-lg">{p.name}</p><p className="text-xs text-sand">{p.family} · {(p.notes?.heart || []).join(', ')}</p></div>
              <span className="text-sm text-gold">{inr(p.minPrice)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
