import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { inr, fmtDate } from '../utils/format';

const EMPTY = { code: '', type: 'percent', value: '', minOrderAmount: 0, maxDiscount: 0, expiryDate: '', isActive: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    api.get('/admin/coupons', { isAdmin: true }).then((d) => setCoupons(d.coupons)).catch((e) => toast(e.message, 'error'));
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        expiryDate: form.expiryDate || null,
      };
      if (form._id) await api.put(`/admin/coupons/${form._id}`, payload, { isAdmin: true });
      else await api.post('/admin/coupons', payload, { isAdmin: true });
      toast(form._id ? 'Coupon updated' : 'Coupon created');
      setForm(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    await api.del(`/admin/coupons/${c._id}`, { isAdmin: true });
    toast('Coupon deleted');
    load();
  };

  const toggle = async (c) => {
    await api.put(`/admin/coupons/${c._id}`, { ...c, isActive: !c.isActive }, { isAdmin: true });
    load();
  };

  return (
    <div>
      <div className="admin-head">
        <h1>Coupons</h1>
        <button className="btn btn-gold btn-sm" onClick={() => setForm({ ...EMPTY })}><Plus size={15} /> New Coupon</button>
      </div>

      {!coupons ? (
        <div className="admin-panel"><div className="skeleton" style={{ height: 200 }} /></div>
      ) : (
        <div className="admin-panel">
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Max Disc</th><th>Expiry</th><th>Used</th><th>Status</th><th style={{ width: 90 }}>Actions</th></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.type === 'percent' ? '% off' : '₹ off'}</td>
                  <td>{c.type === 'percent' ? `${c.value}%` : inr(c.value)}</td>
                  <td>{inr(c.minOrderAmount)}</td>
                  <td>{c.maxDiscount ? inr(c.maxDiscount) : '—'}</td>
                  <td>{c.expiryDate ? fmtDate(c.expiryDate) : 'Never'}</td>
                  <td>{c.usedCount}</td>
                  <td>
                    <button className={`toggle-pill ${c.isActive ? 'on' : ''}`} onClick={() => toggle(c)}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <div className="a-actions">
                      <button className="icon-btn" onClick={() => setForm({ ...c, expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : '' })} aria-label="Edit">✎</button>
                      <button className="icon-btn danger" onClick={() => remove(c)} aria-label="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="modal-backdrop" onClick={() => setForm(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="a-order-head">
              <h3 className="h3">{form._id ? 'Edit Coupon' : 'New Coupon'}</h3>
              <button className="icon-btn" onClick={() => setForm(null)}><X size={18} /></button>
            </div>
            <form onSubmit={save} style={{ padding: '0 24px 24px' }}>
              <div className="form-grid">
                <div className="field"><label>Code *</label><input className="input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" /></div>
                <div className="field"><label>Type</label>
                  <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div className="field"><label>Value *</label><input className="input" type="number" required min={1} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
                <div className="field"><label>Min Order ₹</label><input className="input" type="number" min={0} value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} /></div>
                <div className="field"><label>Max Discount ₹</label><input className="input" type="number" min={0} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} /></div>
                <div className="field"><label>Expiry</label><input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
              </div>
              <label className="toggle" style={{ marginBottom: 18 }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span>Active</span>
              </label>
              <button className="btn btn-gold" disabled={saving}>{saving && <Loader2 size={15} className="spin" />} Save Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
