import { useEffect } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Ticket, FileText, LogOut, Store,
} from 'lucide-react';
import { getAdminToken, setAdminToken } from '../api/client';
import { useToast } from '../context/ToastContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/content', label: 'Content', icon: FileText },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const authed = !!getAdminToken();

  useEffect(() => {
    document.title = 'Admin — ND Perfume';
  }, []);

  if (!authed) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    setAdminToken(null);
    toast('Logged out of admin');
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="brand-mark">ND</span>
          <div>
            <strong>PERFUME</strong>
            <small>Admin Panel</small>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
              <n.icon size={17} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link to="/" className="admin-link"><Store size={17} /> View Storefront</Link>
          <button className="admin-link" onClick={logout}><LogOut size={17} /> Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
