import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Heart, User, ShoppingBag, Menu, X, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?gender=Men', label: 'Men' },
  { to: '/shop?gender=Women', label: 'Women' },
  { to: '/shop?gender=Unisex', label: 'Unisex' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar({ onSearchOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const { counts, openDrawer } = useCart();
  const { ids } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [mobileOpen]);

  const go = (p) => {
    setMobileOpen(false);
    setAcctOpen(false);
    navigate(p);
  };

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" aria-label="ND Perfume home">
          <span className="brand-mark">ND</span>
          <span className="brand-word">
            PERFUME
            <small>ND Lifestyle Pvt. Ltd.</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive && l.to === '/shop' ? 'active' : ''}`}
              end={l.to === '/'}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={onSearchOpen} aria-label="Search">
            <Search size={19} />
          </button>
          <button className="icon-btn" onClick={() => go('/wishlist')} aria-label="Wishlist">
            <Heart size={19} />
            {ids.length > 0 && <span className="count-dot">{ids.length}</span>}
          </button>

          <div className="acct-wrap">
            <button className="icon-btn" onClick={() => setAcctOpen((v) => !v)} aria-label="Account">
              <User size={19} />
            </button>
            <AnimatePresence>
              {acctOpen && (
                <motion.div
                  className="acct-menu"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  {user ? (
                    <>
                      <div className="acct-head">
                        <strong>{user.fullName}</strong>
                        <span>{user.email}</span>
                      </div>
                      <button onClick={() => go('/account')}><User size={15} /> My Account</button>
                      <button onClick={() => go('/account?tab=orders')}><Package size={15} /> My Orders</button>
                      <button onClick={() => go('/account?tab=wishlist')}><Heart size={15} /> Wishlist</button>
                      <button
                        onClick={() => {
                          logout();
                          setAcctOpen(false);
                        }}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => go('/auth?mode=login')}><User size={15} /> Login</button>
                      <button onClick={() => go('/auth?mode=register')}><User size={15} /> Register</button>
                      <button onClick={() => go('/track-order')}><Package size={15} /> Track Order</button>
                      <div className="acct-divider" />
                      <button className="acct-admin" onClick={() => go('/admin')}><LayoutDashboard size={15} /> Admin Login</button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="icon-btn" onClick={openDrawer} aria-label="Cart">
            <ShoppingBag size={19} />
            {counts.count > 0 && <span className="count-dot">{counts.count}</span>}
          </button>

          <button className="icon-btn hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mm-head">
              <span className="brand-mark">ND</span>
              <button className="icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="mm-links">
              {LINKS.map((l, i) => (
                <motion.button
                  key={l.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  onClick={() => go(l.to)}
                >
                  {l.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + LINKS.length * 0.04 }}
                onClick={() => go('/track-order')}
              >
                Track Order
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + (LINKS.length + 1) * 0.04 }}
                onClick={() => go(user ? '/account' : '/auth?mode=login')}
              >
                {user ? 'My Account' : 'Login / Register'}
              </motion.button>
            </nav>
            <div className="mm-foot">
              <span>Marketed by ND Lifestyle Pvt. Ltd.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
