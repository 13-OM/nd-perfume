import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, PackageSearch, MapPin, CreditCard } from 'lucide-react';
import { inr, fmtDate } from '../utils/format';
import { assetUrl } from '../utils/asset';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="container center" style={{ paddingTop: 180, paddingBottom: 100 }}>
        <h1 className="h2">No order to confirm</h1>
        <p className="muted mt-16">Complete a checkout to see your confirmation.</p>
        <Link to="/shop" className="btn btn-gold mt-24">Shop Fragrances</Link>
      </div>
    );
  }

  return (
    <div className="container oc-wrap">
      <div className="oc-card">
        <div className="oc-check">
          <CheckCircle2 size={52} strokeWidth={1.4} />
        </div>
        <span className="eyebrow">Thank you</span>
        <h1 className="h2">ORDER PLACED SUCCESSFULLY</h1>
        <p className="muted">
          Order <strong style={{ color: 'var(--gold-2)' }}>#{order.orderNumber}</strong> · {fmtDate(order.createdAt)}
        </p>
        <p className="oc-note">A confirmation has been sent to {order.address?.email || 'your email'}.</p>

        <div className="oc-grid">
          <div className="oc-block">
            <h4><PackageSearch size={16} /> Items</h4>
            <ul className="oc-items">
              {order.items.map((i) => (
                <li key={i.product}>
                  <img src={assetUrl(i.bottleImage)} alt={i.name} />
                  <span>{i.name} <small>× {i.quantity}</small></span>
                  <b>{inr(i.price * i.quantity)}</b>
                </li>
              ))}
            </ul>
            <div className="oc-total">
              <span>Total ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <strong>{inr(order.total)}</strong>
            </div>
          </div>

          <div className="oc-block">
            <h4><CreditCard size={16} /> Payment</h4>
            <p>
              {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
              <span className={`pay-state ${order.paymentStatus === 'paid' ? 'paid' : ''}`}>
                {order.paymentStatus === 'paid' ? '· Paid' : '· Pending'}
              </span>
            </p>
            <h4 style={{ marginTop: 22 }}><MapPin size={16} /> Delivery Address</h4>
            <p className="oc-addr">
              {order.address.fullName}<br />
              {order.address.address}, {order.address.city}<br />
              {order.address.state} — {order.address.pincode}<br />
              {order.address.mobile}
            </p>
          </div>
        </div>

        <div className="oc-actions">
          <Link to={`/track-order?order=${order.orderNumber}`} className="btn btn-gold">
            <PackageSearch size={15} /> Track Order
          </Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
