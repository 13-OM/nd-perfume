import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, Loader2, ArrowLeft, Save, X } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { assetUrl } from '../utils/asset';

const EMPTY = {
  name: '', shortDescription: '', description: '',
  price: '', mrp: '', size: '50 ML', stock: 100,
  category: 'Unisex', gender: 'Unisex', fragranceType: 'Aquatic',
  bottleImage: '', descriptionImage: '', galleryImages: [],
  topNotes: [], heartNotes: [], baseNotes: [],
  perfectFor: [], fragranceCharacter: '', usage: '', story: '',
  longevity: '', sillage: '',
  featured: false, bestseller: false, newArrival: false, isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const editing = id && id !== 'new';
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (editing) {
      api.get(`/admin/products/${id}`, { isAdmin: true })
        .then((d) => {
          const p = d.product;
          setForm({
            ...EMPTY, ...p,
            price: p.price, mrp: p.mrp, stock: p.stock,
            topNotes: p.topNotes || [], heartNotes: p.heartNotes || [], baseNotes: p.baseNotes || [],
            perfectFor: p.perfectFor || [],
          });
        })
        .catch((e) => toast(e.message, 'error'));
    }
  }, [editing, id, toast]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setList = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }));
  const setBool = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const upload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const d = await api.post('/upload', fd, { isAdmin: true, formData: true });
      setForm((f) => ({ ...f, [field]: d.url }));
      toast('Image uploaded');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading('');
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) {
        await api.put(`/admin/products/${id}`, payload, { isAdmin: true });
        toast('Product updated');
      } else {
        await api.post('/admin/products', payload, { isAdmin: true });
        toast('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-head">
        <h1>{editing ? 'Edit Product' : 'Add Product'}</h1>
        <button className="btn btn-dark btn-sm" onClick={() => navigate('/admin/products')}><ArrowLeft size={14} /> Back</button>
      </div>

      <form className="admin-form" onSubmit={save}>
        {/* images */}
        <div className="admin-panel">
          <h3>Product Images</h3>
          <p className="muted" style={{ fontSize: 13 }}>
            <strong style={{ color: 'var(--gold-2)' }}>Bottle image</strong> shows in the shop grid ·{' '}
            <strong style={{ color: 'var(--gold-2)' }}>Description image</strong> shows on the product page. These are independent fields.
          </p>
          <div className="img-upload-grid">
            <ImageField label="Bottle Image (shop grid)" field="bottleImage" value={form.bottleImage} uploading={uploading === 'bottleImage'} onUpload={upload} onClear={() => setForm((f) => ({ ...f, bottleImage: '' }))} />
            <ImageField label="Description Image (product page)" field="descriptionImage" value={form.descriptionImage} uploading={uploading === 'descriptionImage'} onUpload={upload} onClear={() => setForm((f) => ({ ...f, descriptionImage: '' }))} />
          </div>
        </div>

        {/* basics */}
        <div className="admin-panel">
          <h3>Basics</h3>
          <div className="form-grid">
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Product Name *</label><input className="input" required value={form.name} onChange={set('name')} placeholder="e.g. Aqua Veil" /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Short Description</label><textarea className="textarea" value={form.shortDescription} onChange={set('shortDescription')} placeholder="One-liner shown on cards" /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Full Description</label><textarea className="textarea" value={form.description} onChange={set('description')} placeholder="Story, character, notes narrative" /></div>
            <div className="field"><label>Price (₹) *</label><input className="input" type="number" required min={1} value={form.price} onChange={set('price')} /></div>
            <div className="field"><label>MRP (₹)</label><input className="input" type="number" min={0} value={form.mrp} onChange={set('mrp')} /></div>
            <div className="field"><label>Size</label><input className="input" value={form.size} onChange={set('size')} placeholder="50 ML" /></div>
            <div className="field"><label>Stock</label><input className="input" type="number" min={0} value={form.stock} onChange={set('stock')} /></div>
            <div className="field">
              <label>Category</label>
              <select className="select" value={form.category} onChange={set('category')}>
                {['Men', 'Women', 'Unisex', 'Aquatic', 'Woody', 'Amber', 'Fresh', 'Oriental'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Gender</label>
              <select className="select" value={form.gender} onChange={set('gender')}>
                {['Men', 'Women', 'Unisex'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Fragrance Type</label>
              <select className="select" value={form.fragranceType} onChange={set('fragranceType')}>
                {['Aquatic', 'Woody', 'Amber', 'Fresh', 'Oriental', 'Floral', 'Spicy'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Longevity</label><input className="input" value={form.longevity} onChange={set('longevity')} placeholder="6–8 hours" /></div>
            <div className="field"><label>Sillage</label><input className="input" value={form.sillage} onChange={set('sillage')} placeholder="Moderate" /></div>
            <div className="field"><label>Fragrance Character</label><input className="input" value={form.fragranceCharacter} onChange={set('fragranceCharacter')} placeholder="Crisp · Clean · Serene" /></div>
          </div>

          <div className="toggle-row">
            {[['featured', 'Featured'], ['bestseller', 'Bestseller'], ['newArrival', 'New Arrival'], ['isActive', 'Active']].map(([k, label]) => (
              <label key={k} className="toggle">
                <input type="checkbox" checked={form[k]} onChange={setBool(k)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* fragrance profile */}
        <div className="admin-panel">
          <h3>Fragrance Profile & Story</h3>
          <div className="form-grid">
            <div className="field"><label>Top Notes (comma separated)</label><input className="input" value={form.topNotes.join(', ')} onChange={setList('topNotes')} placeholder="Marine Accord, Bergamot" /></div>
            <div className="field"><label>Heart Notes</label><input className="input" value={form.heartNotes.join(', ')} onChange={setList('heartNotes')} placeholder="Water Lily, Jasmine" /></div>
            <div className="field"><label>Base Notes</label><input className="input" value={form.baseNotes.join(', ')} onChange={setList('baseNotes')} placeholder="White Musk, Driftwood" /></div>
            <div className="field"><label>Perfect For (comma separated)</label><input className="input" value={form.perfectFor.join(', ')} onChange={setList('perfectFor')} placeholder="Daily wear, Summer days" /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>How to Use</label><textarea className="textarea" value={form.usage} onChange={set('usage')} /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Story</label><textarea className="textarea" value={form.story} onChange={set('story')} /></div>
          </div>
        </div>

        <button className="btn btn-gold" disabled={saving}>
          {saving && <Loader2 size={15} className="spin" />} <Save size={15} /> {editing ? 'Save Changes' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}

function ImageField({ label, value, uploading, onUpload, onClear }) {
  return (
    <div className="img-field">
      <span className="img-field-label">{label}</span>
      <div className="img-drop">
        {value ? (
          <div className="img-preview">
            <img src={assetUrl(value)} alt={label} />
            <button type="button" className="img-x" onClick={onClear} aria-label="Remove image"><X size={14} /></button>
          </div>
        ) : (
          <label className="img-upload">
            <UploadCloud size={22} />
            <span>{uploading ? 'Uploading…' : 'Click to upload'}</span>
            <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e, 'image')} />
          </label>
        )}
      </div>
    </div>
  );
}
