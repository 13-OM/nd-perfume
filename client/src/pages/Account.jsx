import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Package, Heart, MapPin, LogOut, Loader2, Plus, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../api/client';
import { inr, fmtDate } from '../utils/format';
import { assetUrl } from '../utils/asset';
import EmptyState from '../components/EmptyState';

export default function Account() {
  const { user, logout, refreshUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'profile';
  const [orders, setOrders] = useState(null);
  const [addrForm, setAddrForm] = useState({ fullName: '', mobile: '', address: '', city: '', state: '', pincode: '' });
  const [savingAddr, setSavingAddr] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { ids, remove } = useWishlist();

  useEffect(() => {
    if (tab === 'orders') {
      api.get('/users/orders').then((d) => setOrders(d.orders)).catch((e) => toast(e.message, 'error'));
    }
  }, [tab, toast]);

  if (!user) return null;

  const setTab = (t) => setParams({ tab: t }, { replace: true });

  const saveAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      await api.post('/users/addresses', addrForm);
      await refreshUser();
      setAddrForm({ fullName: '', mobile: '', address: '', city: '', state: '', pincode: '' });
      toast('Address saved');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSavingAddr(false);
    }
  };

  const delAddress = async (id) => {
    try {
      await api.del(`/users/addresses/${id}`);
      await refreshUser();
      toast('Address removed');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const MENU = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  ];

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">My Account</span>
        <h1>HELLO, {user.fullName.toUpperCase().split(' ')[0]}</h1>
      </div>

      <div className="container acct-layout">
        <aside className="acct-menu">
          {MENU.map((m) => (
            <button key={m.id} className={`acct-link ${tab === m.id ? 'active' : ''}`} onClick={() => setTab(m.id)}>
              <m.icon size={16} /> {m.label}
            </button>
          ))}
          <button className="acct-link" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} /> Logout
          </button>
        </aside>

        <div className="acct-panel">
          {tab === 'profile' && (
            <div className="checkout-panel">
              <h3 className="h3">Profile</h3>
              <div className="kv">
                <div><span>Name</span><strong>{user.fullName}</strong></div>
                <div><span>Email</span><strong>{user.email}</strong></div>
                <div><span>Mobile</span><strong>{user.mobile || '—'}</strong></div>
                <div><span>Member since</span><strong>{fmtDate(user.createdAt)}</strong></div>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="checkout-panel">
              <h3 className="h3">My Orders</h3>
              {!orders ? (
                <div className="skeleton" style={{ height: 120 }} />
              ) : orders.length === 0 ? (
                <EmptyState icon="box" title="No orders yet" subtitle="Your orders will appear here once you place one.">
                  <Link to="/shop" className="btn btn-gold btn-sm">Shop Now</Link>
                </EmptyState>
              ) : (
                <ul className="orders-list">
                  {orders.map((o) => (
                    <li key={o._id}>
                      <Link to={`/track-order?order=${o.orderNumber}`} className="order-row">
                        <div className="or-id">
                          <strong>#{o.orderNumber}</strong>
                          <span>{fmtDate(o.createdAt)}</span>
                        </div>
                        <div className="or-items">
                          {o.items.slice(0, 3).map((i) => (
                            <img key={i.product} src={assetUrl(i.bottleImage)} alt={i.name} loading="lazy" />
                          ))}
                          {o.items.length > 3 && <span>+{o.items.length - 3}</span>}
                        </div>
                        <div className="or-status">
                          <span className={`os-dot ${o.status}`} />
                          {o.status.replace(/_/g, ' ')}
                        </div>
                        <div className="or-amt">
                          <strong>{inr(o.total)}</strong>
                          <span className={o.paymentStatus === 'paid' ? 'ok' : ''}>
                            {o.paymentStatus === 'paid' ? 'Paid' : 'COD pending'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'wishlist' && (
            <div className="checkout-panel">
              <h3 className="h3">Wishlist</h3>
              {ids.length === 0 ? (
                <EmptyState icon="heart" title="Wishlist empty" subtitle="Products you heart will show up here.">
                  <Link to="/shop" className="btn btn-gold btn-sm">Explore</Link>
                </EmptyState>
              ) : (
                <ul className="wish-mini">
                  {ids.map((id) => (
                    <WishMini key={id} id={id} onRemove={remove} />
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'addresses' && (
            <div className="checkout-panel">
              <h3 className="h3">Saved Addresses</h3>
              <div className="addr-grid">
                {(user.addresses || []).map((a) => (
                  <div key={a._id} className="addr-card">
                    <strong>{a.fullName}</strong>
                    <p>{a.address}, {a.city}, {a.state} — {a.pincode}</p>
                    <span>{a.mobile}{a.isDefault ? ' · Default' : ''}</span>
                    <button className="addr-del" onClick={() => delAddress(a._id)} aria-label="Delete address"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <h4 style={{ margin: '24px 0 12px', color: 'var(--gold-2)', letterSpacing: '0.1em', fontSize: 13 }}>ADD NEW ADDRESS</h4>
              <form className="form-grid" onSubmit={saveAddress}>
                <div className="field"><label>Full Name</label><input className="input" required value={addrForm.fullName} onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} /></div>
                <div className="field"><label>Mobile</label><input className="input" required value={addrForm.mobile} onChange={(e) => setAddrForm({ ...addrForm, mobile: e.target.value })} /></div>
                <div className="field" style={{ gridColumn: '1 / -1' }}><label>Address</label><textarea className="textarea" required value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} /></div>
                <div className="field"><label>City</label><input className="input" required value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                <div className="field"><label>State</label><input className="input" required value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} /></div>
                <div className="field"><label>Pincode</label><input className="input" required value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} /></div>
                <button className="btn btn-gold btn-sm" disabled={savingAddr}>
                  {savingAddr && <Loader2 size={14} className="spin" />} <Plus size={14} /> Save Address
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function WishMini({ id, onRemove }) {
  const [p, setP] = useState(null);
  useEffect(() => {
    api.get(`/products/${id}`).then((d) => setP(d.product)).catch(() => {});
  }, [id]);
  if (!p) return null;
  return (
    <li>
      <Link to={`/product/${p.slug}`}><img src={assetUrl(p.bottleImage)} alt={p.name} /></Link>
      <div><strong>{p.name}</strong><span>{inr(p.price)}</span></div>
      <button onClick={() => onRemove(id)} aria-label="Remove"><Trash2 size={15} /></button>
    </li>
  );
}
