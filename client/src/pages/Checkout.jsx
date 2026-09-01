import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, MapPin, ClipboardList, CreditCard, Check, ArrowLeft, ArrowRight,
  Lock, Loader2, PackageCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { inr, shippingNote } from '../utils/format';
import { assetUrl } from '../utils/asset';

const STEPS = [
  { id: 1, label: 'Details', icon: User },
  { id: 2, label: 'Address', icon: MapPin },
  { id: 3, label: 'Summary', icon: ClipboardList },
  { id: 4, label: 'Payment', icon: CreditCard },
];

const INITIAL = {
  fullName: '', mobile: '', email: '',
  address: '', city: '', state: '', pincode: '',
};

export default function Checkout() {
  const { items, counts, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [payment, setPayment] = useState('online');
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user) {
      const a = user.addresses?.find((x) => x.isDefault) || user.addresses?.[0];
      setForm((f) => ({
        ...f,
        fullName: f.fullName || user.fullName || '',
        email: f.email || user.email || '',
        mobile: f.mobile || user.mobile || '',
        ...(a
          ? { fullName: a.fullName || user.fullName, mobile: a.mobile || user.mobile, address: a.address, city: a.city, state: a.state, pincode: a.pincode }
          : {}),
      }));
    }
  }, [user]);

  const shipping = shippingNote(counts.subtotal - (applied?.discount || 0));
  const couponDiscount = applied?.discount || 0;
  const subAfterCoupon = counts.subtotal - couponDiscount;
  const grand = subAfterCoupon + (subAfterCoupon >= 999 || subAfterCoupon === 0 ? 0 : shipping.cost);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const required = ['fullName', 'mobile', 'email', 'address', 'city', 'state', 'pincode'];
  const addressValid = required.every((k) => (form[k] || '').trim().length > 0) && /^\d{6}$/.test(form.pincode);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const d = await api.post('/coupons/validate', { code: coupon, subtotal: counts.subtotal });
      setApplied(d.coupon);
      toast(`Coupon applied — save ${inr(d.coupon.discount)}`);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const body = {
        address: form,
        paymentMethod: payment,
        // Always send items explicitly — the cart lives in the browser
        // (localStorage mirror) and is synced to the server when available.
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ...(coupon ? { couponCode: coupon } : {}),
      };
      const d = await api.post('/orders/checkout', body);
      clearCart();
      navigate('/order-confirmation', { state: { order: d.order } });
    } catch (e) {
      toast(e.message, 'error');
      setPlacing(false);
    }
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0 && step !== 4) {
    return (
      <div className="container center" style={{ paddingTop: 160, paddingBottom: 80 }}>
        <PackageCheck size={44} style={{ color: 'var(--gold-2)', margin: '0 auto 18px' }} />
        <h1 className="h2">Nothing to check out</h1>
        <p className="muted mt-16">Your cart is empty. Add a fragrance first.</p>
        <Link to="/shop" className="btn btn-gold mt-24">Shop Fragrances</Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Secure Checkout</span>
        <h1>CHECKOUT</h1>
      </div>

      <div className="container checkout-layout">
        <div className="checkout-main">
          {/* stepper */}
          <div className="stepper">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`step ${step >= s.id ? 'done' : ''} ${step === s.id ? 'current' : ''}`}>
                <span className="step-ic">
                  {step > s.id ? <Check size={15} /> : <s.icon size={15} />}
                </span>
                <span className="step-label">{s.label}</span>
                {i < STEPS.length - 1 && <span className="step-line" />}
              </div>
            ))}
          </div>

          {/* step 1 — details */}
          {step === 1 && (
            <div className="checkout-panel">
              <h3 className="h3">Customer Details</h3>
              <div className="form-grid">
                <div className="field"><label>Full Name *</label><input className="input" value={form.fullName} onChange={set('fullName')} placeholder="e.g. Aarav Sharma" /></div>
                <div className="field"><label>Mobile Number *</label><input className="input" value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" inputMode="numeric" maxLength={10} /></div>
                <div className="field" style={{ gridColumn: '1 / -1' }}><label>Email *</label><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" /></div>
              </div>
              <button className="btn btn-gold" onClick={() => setStep(2)}>Continue <ArrowRight size={15} /></button>
            </div>
          )}

          {/* step 2 — address */}
          {step === 2 && (
            <div className="checkout-panel">
              <h3 className="h3">Delivery Address</h3>
              <div className="form-grid">
                <div className="field" style={{ gridColumn: '1 / -1' }}><label>Full Address *</label><textarea className="textarea" value={form.address} onChange={set('address')} placeholder="House no, street, area, landmark" /></div>
                <div className="field"><label>City *</label><input className="input" value={form.city} onChange={set('city')} placeholder="City" /></div>
                <div className="field"><label>State *</label><input className="input" value={form.state} onChange={set('state')} placeholder="State" /></div>
                <div className="field"><label>Pincode *</label><input className="input" value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" inputMode="numeric" maxLength={6} /></div>
              </div>
              <div className="checkout-nav">
                <button className="btn btn-dark" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button>
                <button className="btn btn-gold" disabled={!addressValid} onClick={() => setStep(3)}>
                  {!addressValid ? 'Complete all fields' : 'Continue'} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* step 3 — summary */}
          {step === 3 && (
            <div className="checkout-panel">
              <h3 className="h3">Order Summary</h3>
              <ul className="co-items">
                {items.map((i) => (
                  <li key={i.productId}>
                    <img src={assetUrl(i.bottleImage)} alt={i.name} loading="lazy" />
                    <div>
                      <strong>{i.name}</strong>
                      <span>{i.size} · Qty {i.quantity}</span>
                    </div>
                    <b>{inr(i.price * i.quantity)}</b>
                  </li>
                ))}
              </ul>
              <div className="co-sum">
                <div><span>Items ({itemCount})</span><span>{inr(counts.subtotal)}</span></div>
                {couponDiscount > 0 && <div><span>Coupon ({applied.code})</span><span style={{ color: 'var(--success)' }}>− {inr(couponDiscount)}</span></div>}
                <div><span>Shipping</span><span>{shipping.cost === 0 ? 'FREE' : inr(shipping.cost)}</span></div>
                <div className="co-grand"><span>Grand Total</span><b>{inr(grand)}</b></div>
              </div>
              <div className="checkout-nav">
                <button className="btn btn-dark" onClick={() => setStep(2)}><ArrowLeft size={15} /> Back</button>
                <button className="btn btn-gold" onClick={() => setStep(4)}>Continue to Payment <ArrowRight size={15} /></button>
              </div>
            </div>
          )}

          {/* step 4 — payment */}
          {step === 4 && (
            <div className="checkout-panel">
              <h3 className="h3">Payment</h3>
              <p className="muted" style={{ marginBottom: 18, fontSize: 14 }}>
                Prototype — payments are simulated. No real charge is made.
              </p>
              <div className="pay-options">
                <label className={`pay-opt ${payment === 'online' ? 'active' : ''}`}>
                  <input type="radio" name="pay" checked={payment === 'online'} onChange={() => setPayment('online')} />
                  <span className="pay-ic"><CreditCard size={20} /></span>
                  <span><strong>Online Payment</strong><small>UPI · Card · Netbanking · Wallet</small></span>
                  <span className="pay-badge">Recommended</span>
                </label>
                <label className={`pay-opt ${payment === 'cod' ? 'active' : ''}`}>
                  <input type="radio" name="pay" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                  <span className="pay-ic"><PackageCheck size={20} /></span>
                  <span><strong>Cash on Delivery</strong><small>Pay when your order arrives</small></span>
                </label>
              </div>
              <div className="checkout-nav">
                <button className="btn btn-dark" onClick={() => setStep(3)}><ArrowLeft size={15} /> Back</button>
                <button className="btn btn-gold" onClick={placeOrder} disabled={placing}>
                  {placing ? <><Loader2 size={16} className="spin" /> Placing Order…</> : <><Lock size={15} /> Place Order · {inr(grand)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* sticky summary */}
        <aside className="co-side">
          <h4>SUMMARY</h4>
          <div className="co-side-row"><span>Items</span><b>{itemCount}</b></div>
          <div className="co-side-row"><span>Subtotal</span><b>{inr(counts.subtotal)}</b></div>
          {couponDiscount > 0 && <div className="co-side-row save"><span>Coupon</span><b>− {inr(couponDiscount)}</b></div>}
          <div className="co-side-row"><span>Shipping</span><b>{shipping.cost === 0 ? 'FREE' : inr(shipping.cost)}</b></div>
          <div className="co-side-total"><span>Total</span><b>{inr(grand)}</b></div>

          <div className="co-coupon">
            <input className="input" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <button className="btn btn-dark btn-sm" onClick={applyCoupon}>{applied ? 'Applied ✓' : 'Apply'}</button>
          </div>
          <p className="co-coupon-hint">Try WELCOME10 or FIRST15</p>
          <p className="co-secure"><Lock size={13} /> 100% secure · Data is never shared</p>
        </aside>
      </div>
    </>
  );
}
