import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { api, setAdminToken } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const d = await api.post('/auth/admin-login', { email, password });
      setAdminToken(d.token);
      toast('Welcome back, Admin');
      navigate('/admin');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <span className="admin-shield"><ShieldCheck size={30} /></span>
        <h1 className="h3" style={{ textAlign: 'center' }}>ND PERFUME — ADMIN</h1>
        <p className="muted center" style={{ fontSize: 13.5, marginBottom: 24 }}>
          Manage products, orders, customers and content.
        </p>
        <form onSubmit={submit}>
          <div className="field"><label>Admin Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@ndperfume.in" /></div>
          <div className="field"><label>Password</label><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
          <button className="btn btn-gold btn-block" disabled={loading}>
            {loading ? <Loader2 size={15} className="spin" /> : <ShieldCheck size={15} />} Login to Dashboard
          </button>
        </form>
        <p className="center muted" style={{ fontSize: 12.5, marginTop: 18 }}>
          Demo admin: <code>admin@ndperfume.in</code> / <code>Admin@123</code>
        </p>
        <Link to="/" className="btn btn-ghost btn-block"><ArrowLeft size={14} /> Back to store</Link>
      </div>
    </div>
  );
}
