import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

export default function Auth() {
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'login';
  const next = params.get('next') || '/account';
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        if (form.password !== form.confirm) {
          toast('Passwords do not match', 'error');
          return;
        }
        if (form.password.length < 6) {
          toast('Password must be at least 6 characters', 'error');
          return;
        }
        await register({ fullName: form.fullName, email: form.email, mobile: form.mobile, password: form.password });
      } else {
        await login(form.email, form.password);
      }
      navigate(next);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const d = await api.post('/auth/forgot-password', { email: form.email });
      setResetInfo(d);
      toast('Reset token generated (prototype)');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-glow" />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="auth-brand">
          <span className="brand-mark">ND</span>
          <span className="brand-word">PERFUME<small>ND Lifestyle Pvt. Ltd.</small></span>
        </Link>

        {forgot ? (
          <>
            <h1 className="h3" style={{ textAlign: 'center' }}>RESET PASSWORD</h1>
            <p className="muted center" style={{ fontSize: 14, margin: '8px 0 22px' }}>
              Enter your registered email — we'll send a reset link.
            </p>
            {resetInfo ? (
              <div className="auth-info">
                <p>Prototype mode — here is your reset token:</p>
                <code>{resetInfo.resetToken}</code>
                <p className="muted" style={{ fontSize: 13 }}>In production this is emailed securely.</p>
              </div>
            ) : (
              <form onSubmit={sendReset}>
                <div className="field"><label>Email</label><input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" /></div>
                <button className="btn btn-gold btn-block" disabled={loading}>
                  {loading && <Loader2 size={15} className="spin" />} Send Reset Link
                </button>
              </form>
            )}
            <button className="btn btn-ghost btn-block mt-24" onClick={() => { setForgot(false); setResetInfo(null); }}>
              ← Back to login
            </button>
          </>
        ) : (
          <>
            <h1 className="h3" style={{ textAlign: 'center' }}>
              {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </h1>
            <p className="muted center" style={{ fontSize: 14, margin: '8px 0 22px' }}>
              {mode === 'login' ? 'Login to continue your fragrance journey.' : 'Join the ND fragrance journey.'}
            </p>

            <form onSubmit={submit}>
              {mode === 'register' && (
                <>
                  <div className="field"><label>Full Name</label><input className="input" required value={form.fullName} onChange={set('fullName')} placeholder="Your name" /></div>
                  <div className="field"><label>Mobile (optional)</label><input className="input" value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" inputMode="numeric" maxLength={10} /></div>
                </>
              )}
              <div className="field"><label>Email</label><input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" /></div>
              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input className="input" type={showPw ? 'text' : 'password'} required value={form.password} onChange={set('password')} placeholder="••••••••" minLength={6} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {mode === 'register' && (
                <div className="field"><label>Confirm Password</label><input className="input" type="password" required value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" /></div>
              )}
              {mode === 'login' && (
                <div className="auth-forgot">
                  <button type="button" onClick={() => setForgot(true)}>Forgot password?</button>
                </div>
              )}
              <button className="btn btn-gold btn-block" disabled={loading}>
                {loading ? <Loader2 size={15} className="spin" /> : mode === 'login' ? <><LogIn size={15} /> Login</> : <><UserPlus size={15} /> Register</>}
              </button>
            </form>

            <p className="auth-switch center">
              {mode === 'login' ? (
                <>New here? <Link to="/auth?mode=register">Create an account</Link></>
              ) : (
                <>Already have an account? <Link to="/auth?mode=login">Login</Link></>
              )}
            </p>
            <p className="auth-demo center muted">
              Demo customer: <code>demo@ndperfume.in</code> / <code>Demo@123</code>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
