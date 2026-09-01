import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingCart, Users, IndianRupee, Clock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { api } from '../api/client';
import { inr, fmtDate } from '../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/admin/stats', { isAdmin: true })
      .then((d) => {
        setStats(d.stats);
        setRecent(d.recentOrders);
      })
      .catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Total Products', value: String(stats.totalProducts), icon: Package, tint: 'var(--aqua)' },
    { label: 'Total Orders', value: String(stats.totalOrders), icon: ShoppingCart, tint: 'var(--gold-2)' },
    { label: 'Total Customers', value: String(stats.totalCustomers), icon: Users, tint: 'var(--amber)' },
    { label: 'Total Revenue', value: inr(stats.totalRevenue), icon: IndianRupee, tint: 'var(--success)' },
    { label: 'Pending Orders', value: String(stats.pendingOrders), icon: Clock, tint: 'var(--warn)' },
    { label: 'Low Stock', value: String(stats.lowStock), icon: AlertTriangle, tint: 'var(--danger)' },
  ] : [];

  return (
    <div>
      <div className="admin-head">
        <h1>Dashboard</h1>
        <p>Overview of your ND Perfume store.</p>
      </div>

      {!stats ? (
        <div className="admin-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => <div className="skeleton" key={i} style={{ height: 110 }} />)}
        </div>
      ) : (
        <div className="admin-grid">
          {cards.map((c) => (
            <div key={c.label} className="stat-card">
              <span className="stat-ic" style={{ color: c.tint, background: `${c.tint}14` }}><c.icon size={20} /></span>
              <div>
                <strong>{c.value}</strong>
                <span>{c.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-panel" style={{ marginTop: 26 }}>
        <div className="admin-panel-head">
          <h3>Recent Orders</h3>
          <Link to="/admin/orders">View all <ArrowRight size={14} /></Link>
        </div>
        {recent.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o._id}>
                  <td><strong>#{o.orderNumber}</strong></td>
                  <td>{o.user?.fullName || o.guestEmail || 'Guest'}</td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td>{inr(o.total)}</td>
                  <td><span className={`os-dot ${o.status}`} /> {o.status.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
