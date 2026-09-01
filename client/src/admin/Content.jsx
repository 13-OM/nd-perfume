import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function AdminContent() {
  const [tab, setTab] = useState('faqs');
  const [faqs, setFaqs] = useState(null);
  const [banners, setBanners] = useState(null);
  const [faqForm, setFaqForm] = useState(null);
  const [bannerForm, setBannerForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    api.get('/admin/faqs', { isAdmin: true }).then((d) => setFaqs(d.faqs));
    api.get('/admin/banners', { isAdmin: true }).then((d) => setBanners(d.banners));
  };
  useEffect(load, []);

  const saveFaq = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/admin/faqs/${faqForm._id || 'new'}`, faqForm, { isAdmin: true });
      toast('FAQ saved'); setFaqForm(null); load();
    } catch (err) { toast(err.message, 'error'); } finally { setSaving(false); }
  };

  const saveBanner = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/admin/banners/${bannerForm._id || 'new'}`, bannerForm, { isAdmin: true });
      toast('Banner saved'); setBannerForm(null); load();
    } catch (err) { toast(err.message, 'error'); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="admin-head"><h1>Content Management</h1></div>
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'faqs' ? 'active' : ''}`} onClick={() => setTab('faqs')}>FAQs</button>
        <button className={`admin-tab ${tab === 'banners' ? 'active' : ''}`} onClick={() => setTab('banners')}>Banners</button>
      </div>

      {tab === 'faqs' && (
        <>
          <div className="admin-toolbar">
            <span className="muted">{faqs?.length || 0} FAQs</span>
            <button className="btn btn-gold btn-sm" onClick={() => setFaqForm({ question: '', answer: '', category: 'General', sortOrder: 0 })}><Plus size={14} /> Add FAQ</button>
          </div>
          <div className="admin-panel">
            {!faqs ? <div className="skeleton" style={{ height: 200 }} /> : faqs.map((f) => (
              <div key={f._id} className="content-row">
                <div>
                  <strong>{f.question}</strong>
                  <p className="muted">{f.answer}</p>
                </div>
                <div className="a-actions">
                  <button className="icon-btn" onClick={() => setFaqForm(f)} aria-label="Edit">✎</button>
                  <button className="icon-btn danger" onClick={async () => { await api.del(`/admin/faqs/${f._id}`, { isAdmin: true }); toast('FAQ deleted'); load(); }} aria-label="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'banners' && (
        <>
          <div className="admin-toolbar">
            <span className="muted">{banners?.length || 0} banners</span>
            <button className="btn btn-gold btn-sm" onClick={() => setBannerForm({ title: '', subtitle: '', ctaText: 'Shop Now', link: '/shop', position: 1 })}><Plus size={14} /> Add Banner</button>
          </div>
          <div className="admin-panel">
            {!banners ? <div className="skeleton" style={{ height: 200 }} /> : banners.map((b) => (
              <div key={b._id} className="content-row">
                <div>
                  <strong>{b.title || '(untitled)'}</strong>
                  <p className="muted">{b.subtitle}</p>
                </div>
                <div className="a-actions">
                  <button className="icon-btn" onClick={() => setBannerForm(b)} aria-label="Edit">✎</button>
                  <button className="icon-btn danger" onClick={async () => { await api.del(`/admin/banners/${b._id}`, { isAdmin: true }); toast('Banner deleted'); load(); }} aria-label="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {faqForm && (
        <div className="modal-backdrop" onClick={() => setFaqForm(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="a-order-head">
              <h3 className="h3">{faqForm._id ? 'Edit FAQ' : 'New FAQ'}</h3>
              <button className="icon-btn" onClick={() => setFaqForm(null)}><X size={18} /></button>
            </div>
            <form onSubmit={saveFaq} style={{ padding: '0 24px 24px' }}>
              <div className="field"><label>Question</label><input className="input" required value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} /></div>
              <div className="field"><label>Answer</label><textarea className="textarea" required value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} /></div>
              <div className="form-grid">
                <div className="field"><label>Category</label><input className="input" value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} /></div>
                <div className="field"><label>Sort Order</label><input className="input" type="number" value={faqForm.sortOrder} onChange={(e) => setFaqForm({ ...faqForm, sortOrder: Number(e.target.value) })} /></div>
              </div>
              <button className="btn btn-gold" disabled={saving}>{saving && <Loader2 size={15} className="spin" />} Save FAQ</button>
            </form>
          </div>
        </div>
      )}

      {bannerForm && (
        <div className="modal-backdrop" onClick={() => setBannerForm(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="a-order-head">
              <h3 className="h3">{bannerForm._id ? 'Edit Banner' : 'New Banner'}</h3>
              <button className="icon-btn" onClick={() => setBannerForm(null)}><X size={18} /></button>
            </div>
            <form onSubmit={saveBanner} style={{ padding: '0 24px 24px' }}>
              <div className="field"><label>Title</label><input className="input" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} /></div>
              <div className="field"><label>Subtitle</label><input className="input" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} /></div>
              <div className="form-grid">
                <div className="field"><label>CTA Text</label><input className="input" value={bannerForm.ctaText} onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })} /></div>
                <div className="field"><label>Link</label><input className="input" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} /></div>
              </div>
              <button className="btn btn-gold" disabled={saving}>{saving && <Loader2 size={15} className="spin" />} Save Banner</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
