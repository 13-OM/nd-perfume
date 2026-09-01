import { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { api } from '../api/client';
import { inr, fmtDate } from '../utils/format';

export default function AdminCustomers() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setData(null);
      api.get(`/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`, { isAdmin: true })
        .then((d) => setData(d))
        .catch(() => setData({ customers: [], total: 0 }));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const view = async (c) => {
    const d = await api.get(`/admin/customers/${c._id}`, { isAdmin: true });
    setSelected({ ...d.customer, orders: d.orders });
  };

  return (
    <div>
      <div className="admin-head"><h1>Customers</h1></div>
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, mobile…" />
        </div>
        <span className="muted">{data?.total || 0} customers</span>
      </div>

      {!data ? (
        <div className="admin-panel"><div className="skeleton" style={{ height: 280 }} /></div>
      ) : (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr><th>Customer</th><th>Contact</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {data.customers.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.fullName}</strong></td>
                  <td>{c.email}<br /><small className="muted">{c.mobile || '—'}</small></td>
                  <td>{c.orderCount}</td>
                  <td>{inr(c.orderValue)}</td>
                  <td>{fmtDate(c.createdAt)}</td>
                  <td><button className="icon-btn" onClick={() => view(c)} aria-label="View customer"><Eye size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="a-order-head">
              <div>
                <h3 className="h3">{selected.fullName}</h3>
                <p className="muted" style={{ fontSize: 13 }}>{selected.email} · {selected.mobile || 'no mobile'}</p>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <h4 style={{ margin: '10px 0', color: 'var(--gold-2)', fontSize: 13, letterSpacing: '0.12em' }}>ORDERS</h4>
            {selected.orders.length === 0 ? (
              <p className="muted">No orders yet.</p>
            ) : (
              <ul className="a-order-items">
                {selected.orders.map((o) => (
                  <li key={o._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>#{o.orderNumber}<small> · {fmtDate(o.createdAt)}</small></span>
                    <b>{inr(o.total)}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
