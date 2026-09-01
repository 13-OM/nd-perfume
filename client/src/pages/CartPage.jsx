import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, Tag, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import QtySelector from '../components/QtySelector';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';
import { inr, shippingNote } from '../utils/format';
import { assetUrl } from '../utils/asset';

export default function CartPage() {
  const { items, counts, updateQty, removeItem } = useCart();
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState(null);
  const [applying, setApplying] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const shipping = shippingNote(counts.subtotal - (applied?.discount || 0));

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      const d = await api.post('/coupons/validate', { code: coupon, subtotal: counts.subtotal });
      setApplied(d.coupon);
      toast(`Coupon ${d.coupon.code} applied — you save ${inr(d.coupon.discount)}`);
    } catch (e) {
      toast(e.message, 'error');
      setApplied(null);
    } finally {
      setApplying(false);
    }
  };

  const couponDiscount = applied?.discount || 0;
  const subAfterCoupon = counts.subtotal - couponDiscount;
  const grand = subAfterCoupon + (subAfterCoupon >= 999 || subAfterCoupon === 0 ? 0 : shipping.cost);

  if (items.length === 0) {
    return (
      <>
        <div className="page-head"><span className="eyebrow">Your Cart</span><h1>SHOPPING CART</h1></div>
        <div className="container">
          <EmptyState
            icon="cart"
            title="Your cart is empty"
            subtitle="Your signature scent is waiting. Explore the collection and find it."
          >
            <Link to="/shop" className="btn btn-gold">Explore Fragrances <ArrowRight size={15} /></Link>
          </EmptyState>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Your Cart</span>
        <h1>SHOPPING CART</h1>
        <p>{counts.count} item{counts.count !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="container cart-layout">
        <div className="cart-items-panel">
          <ul className="cart-list">
            {items.map((i) => (
              <li key={i.productId} className="cart-row">
                <Link to={`/product/${i.slug}`} className="cart-img">
                  <img src={assetUrl(i.bottleImage)} alt={i.name} loading="lazy" />
                </Link>
                <div className="cart-info">
                  <Link to={`/product/${i.slug}`} className="cart-name">{i.name}</Link>
                  <span className="cart-cat">{i.slug.split('-').join(' ')}</span>
                  <div className="cart-price-line">
                    <strong>{inr(i.price)}</strong>
                    {i.mrp > i.price && <s className="muted">{inr(i.mrp)}</s>}
                  </div>
                </div>
                <div className="cart-controls">
                  <QtySelector quantity={i.quantity} onChange={(q) => updateQty(i.productId, q)} />
                  <button className="cart-remove" onClick={() => removeItem(i.productId)} aria-label={`Remove ${i.name}`}>
                    <Trash2 size={16} />
                  </button>
                  <span className="cart-line-total">{inr(i.price * i.quantity)}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/shop" className="btn btn-ghost">← Continue Shopping</Link>
        </div>

        <aside className="cart-summary-panel">
          <h3 className="h3">ORDER SUMMARY</h3>
          <div className="sum-row"><span>Subtotal</span><span>{inr(counts.subtotal)}</span></div>
          {counts.savings > 0 && (
            <div className="sum-row save"><span>MRP savings</span><span>− {inr(counts.savings)}</span></div>
          )}
          {couponDiscount > 0 && (
            <div className="sum-row save"><span>Coupon ({applied.code})</span><span>− {inr(couponDiscount)}</span></div>
          )}
          <div className="sum-row"><span>Shipping</span><span>{shipping.cost === 0 ? 'FREE' : inr(shipping.cost)}</span></div>
          <p className="sum-note">{shipping.note}</p>
          <div className="sum-total"><span>Grand Total</span><strong>{inr(grand)}</strong></div>

          <div className="coupon-box">
            <div className="coupon-row">
              <Tag size={15} />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                aria-label="Coupon code"
                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
              />
              {applied && <button onClick={() => { setApplied(null); setCoupon(''); }}><X size={15} /></button>}
            </div>
            <button className="btn btn-dark btn-block btn-sm" onClick={applyCoupon} disabled={applying || !coupon.trim()}>
              {applying ? 'Applying…' : applied ? 'Coupon Applied' : 'Apply Coupon'}
            </button>
            {!applied && <p className="sum-note">Try: WELCOME10 · FIRST15 · ND500</p>}
          </div>

          <button className="btn btn-gold btn-block" onClick={() => navigate('/checkout')} disabled={items.length === 0}>
            Proceed to Checkout <ArrowRight size={15} />
          </button>
          <p className="sum-trust"><ShieldCheck size={14} /> 100% secure checkout · COD available</p>
        </aside>
      </div>
    </>
  );
}
