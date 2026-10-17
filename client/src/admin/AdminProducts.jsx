import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/client';
import ProductImage from '../components/ProductImage';
import { toast } from '../store/toast';
import { inr } from '../utils/format';

const FAMILIES = ['Woody', 'Floral', 'Oriental', 'Fresh', 'Citrus', 'Gourmand'];
const blank = {
  name: '', brand: 'Atelier', description: '', family: 'Woody', gender: 'Unisex', accent: '#c47a1c', featured: false,
  top: '', heart: '', base: '', sizes: [{ ml: 50, price: 4000, stock: 10 }], images: [],
};

const toForm = (p) => ({
  name: p.name, brand: p.brand, description: p.description, family: p.family, gender: p.gender, accent: p.accent, featured: p.featured,
  top: (p.notes?.top || []).join(', '), heart: (p.notes?.heart || []).join(', '), base: (p.notes?.base || []).join(', '),
  sizes: p.sizes.map((s) => ({ ...s })), images: p.images || [],
});

export default function AdminProducts() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // { id|null, form }
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => api.get('/products', { params: { limit: 60 } }).then((r) => setItems(r.data.items)).catch((e) => toast(errMsg(e), 'error'));
  useEffect(() => { document.title = 'Products | Atelier'; load(); }, []);

  const setF = (patch) => setEditing((e) => ({ ...e, form: { ...e.form, ...patch } }));
  const setSize = (i, patch) => setF({ sizes: editing.form.sizes.map((s, k) => (k === i ? { ...s, ...patch } : s)) });

  const upload = async (files) => {
    setUploading(true);
    try {
      const added = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        const { data } = await api.post('/products/upload', fd);
        added.push(data);
      }
      setF({ images: [...editing.form.images, ...added] });
    } catch (e) { toast(errMsg(e, 'Upload failed. Images must be under 5 MB.'), 'error'); } finally { setUploading(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    const f = editing.form;
    const payload = {
      name: f.name, brand: f.brand, description: f.description, family: f.family, gender: f.gender, accent: f.accent, featured: f.featured,
      notes: { top: f.top, heart: f.heart, base: f.base }, sizes: f.sizes, images: f.images,
    };
    setBusy(true);
    try {
      if (editing.id) await api.put(`/products/${editing.id}`, payload); else await api.post('/products', payload);
      toast(editing.id ? 'Product updated' : 'Product created');
      setEditing(null); load();
    } catch (err) { toast(errMsg(err), 'error'); } finally { setBusy(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    try { await api.delete(`/products/${p._id}`); toast('Product deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-4xl">Products</h1>
        <button className="btn btn-gold" onClick={() => setEditing({ id: null, form: blank })}>Add product</button>
      </div>

      {items === null ? <p className="text-sand">Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-umber text-sand"><tr><th className="py-3 pr-3 font-normal">Product</th><th className="font-normal">Family</th><th className="font-normal">From</th><th className="font-normal">Stock</th><th /></tr></thead>
            <tbody className="divide-y divide-umber">
              {items.map((p) => (
                <tr key={p._id}>
                  <td className="py-3 pr-3"><div className="flex items-center gap-3"><div className="h-14 w-12 shrink-0 border border-umber bg-cocoa"><ProductImage product={p} className="h-full w-full p-1" /></div><div><p className="font-display text-lg">{p.name}</p>{p.featured && <p className="text-xs text-gold">Featured</p>}</div></div></td>
                  <td>{p.family}</td><td>{inr(p.minPrice)}</td>
                  <td>{p.sizes.reduce((a, s) => a + s.stock, 0)}</td>
                  <td className="space-x-4 whitespace-nowrap text-right">
                    <button className="text-gold underline-offset-4 hover:underline" onClick={() => setEditing({ id: p._id, form: toForm(p) })}>Edit</button>
                    <button className="text-red-300 underline-offset-4 hover:underline" onClick={() => remove(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-label="Product form">
          <form onSubmit={save} className="my-8 w-full max-w-3xl space-y-5 border border-umber bg-ink p-6 sm:p-8">
            <div className="flex items-center justify-between"><h2 className="text-3xl">{editing.id ? 'Edit product' : 'Add product'}</h2><button type="button" className="btn-quiet text-sm" onClick={() => setEditing(null)}>Close</button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="pn">Name</label><input id="pn" required className="field" value={editing.form.name} onChange={(e) => setF({ name: e.target.value })} /></div>
              <div><label className="label" htmlFor="pb">Brand</label><input id="pb" className="field" value={editing.form.brand} onChange={(e) => setF({ brand: e.target.value })} /></div>
              <div><label className="label" htmlFor="pf">Family</label><select id="pf" className="field" value={editing.form.family} onChange={(e) => setF({ family: e.target.value })}>{FAMILIES.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div><label className="label" htmlFor="pg">For</label><select id="pg" className="field" value={editing.form.gender} onChange={(e) => setF({ gender: e.target.value })}>{['Unisex', 'Women', 'Men'].map((f) => <option key={f}>{f}</option>)}</select></div>
            </div>
            <div><label className="label" htmlFor="pd">Description</label><textarea id="pd" rows={3} className="field" value={editing.form.description} onChange={(e) => setF({ description: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              {['top', 'heart', 'base'].map((k) => (
                <div key={k}><label className="label" htmlFor={`n${k}`}>{k[0].toUpperCase() + k.slice(1)} notes (comma separated)</label><input id={`n${k}`} className="field" value={editing.form[k]} onChange={(e) => setF({ [k]: e.target.value })} /></div>
              ))}
            </div>

            <div>
              <p className="label">Sizes, prices and stock</p>
              <div className="space-y-2">
                {editing.form.sizes.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
                    <div><label className="label" htmlFor={`ml${i}`}>ml</label><input id={`ml${i}`} type="number" min="1" required className="field" value={s.ml} onChange={(e) => setSize(i, { ml: e.target.value })} /></div>
                    <div><label className="label" htmlFor={`pr${i}`}>Price (₹)</label><input id={`pr${i}`} type="number" min="0" required className="field" value={s.price} onChange={(e) => setSize(i, { price: e.target.value })} /></div>
                    <div><label className="label" htmlFor={`st${i}`}>Stock</label><input id={`st${i}`} type="number" min="0" required className="field" value={s.stock} onChange={(e) => setSize(i, { stock: e.target.value })} /></div>
                    <button type="button" disabled={editing.form.sizes.length === 1} className="h-[46px] px-3 text-sm text-red-300 disabled:opacity-30" onClick={() => setF({ sizes: editing.form.sizes.filter((_, k) => k !== i) })}>Remove</button>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-3 text-sm text-gold underline-offset-4 hover:underline" onClick={() => setF({ sizes: [...editing.form.sizes, { ml: 100, price: 0, stock: 0 }] })}>Add a size</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="pa">Bottle colour (used when there is no photo)</label><div className="flex gap-2"><input id="pa" type="color" className="h-[46px] w-16 border border-umber bg-cocoa" value={editing.form.accent} onChange={(e) => setF({ accent: e.target.value })} /><input aria-label="Colour hex" className="field" value={editing.form.accent} onChange={(e) => setF({ accent: e.target.value })} /></div></div>
              <label className="flex items-center gap-3 pt-6 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#c9a45c]" checked={editing.form.featured} onChange={(e) => setF({ featured: e.target.checked })} />Show on the home page</label>
            </div>

            <div>
              <label className="label" htmlFor="pi">Photos</label>
              <input id="pi" type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => e.target.files.length && upload([...e.target.files])} className="block w-full text-sm text-sand file:mr-4 file:border-0 file:bg-gold file:px-4 file:py-2 file:text-ink" />
              {uploading && <p className="mt-2 text-sm text-sand">Uploading…</p>}
              <div className="mt-3 flex flex-wrap gap-3">
                {editing.form.images.map((im, k) => (
                  <div key={im.url} className="relative h-24 w-24 border border-umber">
                    <img src={im.url} alt="" className="h-full w-full object-cover" />
                    <button type="button" aria-label="Remove photo" className="absolute right-0 top-0 bg-ink/80 px-1.5 text-sm" onClick={() => setF({ images: editing.form.images.filter((_, i) => i !== k) })}>×</button>
                    {k === 0 && <span className="absolute bottom-0 left-0 bg-gold px-1 text-[10px] text-ink">Main</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-umber pt-5">
              <button type="button" className="btn btn-line" onClick={() => setEditing(null)}>Cancel</button>
              <button disabled={busy || uploading} className="btn btn-gold">{busy ? 'Saving…' : 'Save product'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
