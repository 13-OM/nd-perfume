import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, Search, Check, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { inr, fmtDate } from '../utils/format';
import { assetUrl } from '../utils/asset';

const FLOW = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [mobile, setMobile] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const d = await api.post('/orders/track', { orderNumber, mobile: mobile || undefined });
      setResult(d.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = result ? Math.max(0, FLOW.indexOf(result.status)) : 0;

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Track Order</span>
        <h1>TRACK YOUR ORDER</h1>
        <p>Enter your Order ID and the mobile number used at checkout.</p>
      </div>

      <div className="container" style={{ maxWidth: 760 }}>
        <form className="track-form glass" onSubmit={search}>
          <div className="track-inputs">
            <div className="field">
              <label>Order ID</label>
              <input className="input" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. ND2409012345" />
            </div>
            <div className="field">
              <label>Mobile Number</label>
              <input className="input" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit mobile" inputMode="numeric" maxLength={10} />
            </div>
          </div>
          <button className="btn btn-gold" disabled={!orderNumber.trim() || loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />} Track Order
          </button>
        </form>

        {error && <p className="track-error">{error}</p>}

        {result && (
          <div className="track-result">
            <div className="tr-head">
              <div>
                <span className="eyebrow">Order #{result.orderNumber}</span>
                <h3 className="h3" style={{ marginTop: 6 }}>{result.statusLabel}</h3>
                <p className="muted">Placed on {fmtDate(result.createdAt)} · {result.items.reduce((s, i) => s + i.quantity, 0)} items · {inr(result.total)}</p>
              </div>
              <span className={`pay-state ${result.paymentStatus === 'paid' ? 'paid' : ''}`}>
                {result.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
              </span>
            </div>

            <div className="timeline">
              {result.timeline.map((t, i) => (
                <div key={t.status} className={`tl-item ${t.active ? 'active' : ''} ${t.current ? 'current' : ''}`}>
                  <span className="tl-dot">
                    {t.active ? <Check size={12} /> : null}
                  </span>
                  <div className="tl-body">
                    <strong>{t.label}</strong>
                    <span className="muted">{t.active ? fmtDate(t.timestamp) : '—'}</span>
                    {t.note && <small>{t.note}</small>}
                  </div>
                  {i < result.timeline.length - 1 && <span className="tl-line" />}
                </div>
              ))}
            </div>

            {currentIdx >= 5 && (
              <p className="tr-done">🎉 Your fragrance has been delivered. Enjoy your signature scent!</p>
            )}
            {currentIdx < 5 && currentIdx >= 3 && (
              <p className="tr-eta">Estimated delivery in 1–3 business days.</p>
            )}
          </div>
        )}

        {!result && !error && (
          <div className="track-tip">
            <PackageSearch size={30} strokeWidth={1.3} style={{ color: 'var(--gold-deep)' }} />
            <p>
              Prototype uses simulated tracking. In production this module connects to shipping
              partners such as Delhivery / Shiprocket for live updates.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
