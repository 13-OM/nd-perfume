import { useEffect, useState } from 'react';
import { Search, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { inr, fmtDate } from '../utils/format';
import { assetUrl } from '../utils/asset';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  const load = (p = page, st = status, q = search) => {
    setData(null);
    const qs = new URLSearchParams({ page: p, limit: '15' });
    if (st) qs.set('status', st);
    if (q) qs.set('search', q);
    api.get(`/admin/orders?${qs}`, { isAdmin: true })
      .then((d) => setData(d))
      .catch((e) => toast(e.message, 'error'));
  };

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1, status, search); }, 300);
    return () => clearTimeout(t);
  }, [search, status]);

  const changeStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus }, { isAdmin: true });
      toast('Order status updated');
      setSelected((s) => (s ? { ...s, status: newStatus } : s));
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <div>
      <div className="admin-head">
        <h1>Orders</h1>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, mobile, email…" />
        </div>
        <select className="select" style={{ width: 190 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {!data ? (
        <div className="admin-panel"><div className="skeleton" style={{ height: 320 }} /></div>
      ) : data.orders.length === 0 ? (
        <div className="admin-panel"><p className="muted center" style={{ padding: 40 }}>No orders found.</p></div>
      ) : (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o._id}>
                  <td><strong>#{o.orderNumber}</strong></td>
                  <td>{o.user?.fullName || o.guestEmail || 'Guest'}<br /><small className="muted">{o.address?.mobile}</small></td>
                  <td>{o.items.length}</td>
                  <td>{inr(o.total)}</td>
                  <td>
                    <span className={`pay-state ${o.paymentStatus === 'paid' ? 'paid' : ''}`}>
                      {o.paymentStatus === 'paid' ? 'Paid' : o.paymentStatus === 'pending' && o.paymentMethod === 'cod' ? 'COD' : o.paymentStatus}
                    </span>
                  </td>
                  <td><span className={`os-dot ${o.status}`} /> {o.status.replace(/_/g, ' ')}</td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td><button className="icon-btn" onClick={() => setSelected(o)} aria-label="View order"><Eye size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.pages > 1 && (
            <div className="admin-pager">
              <button disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}><ChevronLeft size={15} /></button>
              <span>{page} / {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => { setPage(page + 1); load(page + 1); }}><ChevronRight size={15} /></button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="a-order-head">
              <div>
                <h3 className="h3">#{selected.orderNumber}</h3>
                <p className="muted" style={{ fontSize: 13 }}>{fmtDate(selected.createdAt)} · {selected.items.reduce((s, i) => s + i.quantity, 0)} items</p>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>

            <ul className="a-order-items">
              {selected.items.map((i) => (
                <li key={i.product}>
                  <img src={assetUrl(i.bottleImage)} alt={i.name} />
                  <span>{i.name} <small>× {i.quantity}</small></span>
                  <b>{inr(i.price * i.quantity)}</b>
                </li>
              ))}
            </ul>

            <div className="a-order-meta">
              <div><span>Subtotal</span><b>{inr(selected.subtotal)}</b></div>
              <div><span>Coupon</span><b>− {inr(selected.couponDiscount || 0)}</b></div>
              <div><span>Shipping</span><b>{inr(selected.shipping || 0)}</b></div>
              <div><span>Total</span><b className="gold-text">{inr(selected.total)}</b></div>
            </div>

            <div className="a-order-addr">
              <strong>Delivery to</strong>
              <p>{selected.address?.fullName} · {selected.address?.mobile}<br />
                {selected.address?.address}, {selected.address?.city}, {selected.address?.state} — {selected.address?.pincode}</p>
            </div>

            <div className="a-order-status">
              <label>Update Order Status</label>
              <select className="select" value={selected.status} onChange={(e) => changeStatus(selected._id, e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
