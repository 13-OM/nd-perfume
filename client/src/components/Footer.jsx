import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle, Mail, MapPin, Phone, Send, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Please enter a valid email', 'error');
    setEmail('');
    toast('Welcome to the ND fragrance journey! 🎉');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-news">
          <div>
            <h3 className="h3">JOIN THE ND FRAGRANCE JOURNEY</h3>
            <p className="muted">Be the first to know about new launches, offers and stories.</p>
          </div>
          <form className="news-form" onSubmit={subscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Email address"
            />
            <button className="btn btn-gold btn-sm" type="submit">
              <Send size={14} /> Subscribe
            </button>
          </form>
        </div>

        <div className="footer-grid">
          <div className="f-col f-brand">
            <Link to="/" className="nav-brand">
              <span className="brand-mark">ND</span>
              <span className="brand-word">
                PERFUME
                <small>ND Lifestyle Pvt. Ltd.</small>
              </span>
            </Link>
            <p className="muted">
              Premium fragrances crafted to leave a lasting impression. Scent your signature with
              ND Perfume — luxury without complexity.
            </p>
            <div className="f-social">
              <a href="#" aria-label="Instagram"><Instagram size={17} /></a>
              <a href="#" aria-label="Facebook"><Facebook size={17} /></a>
              <a href="#" aria-label="WhatsApp"><MessageCircle size={17} /></a>
            </div>
          </div>

          <div className="f-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
            </ul>
          </div>

          <div className="f-col">
            <h4>Customer Support</h4>
            <ul>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/faq#shipping">Shipping Policy</a></li>
              <li><a href="/faq#returns">Return Policy</a></li>
              <li><a href="/faq#privacy">Privacy Policy</a></li>
              <li><a href="/faq#terms">Terms &amp; Conditions</a></li>
            </ul>
          </div>

          <div className="f-col">
            <h4>Get in Touch</h4>
            <ul className="f-contact">
              <li><MapPin size={15} /> Rajkot, Gujarat, India</li>
              <li><Phone size={15} /> +91 98765 43210</li>
              <li><Mail size={15} /> care@ndperfume.in</li>
            </ul>
            <Link to="/shop" className="f-cta">
              Shop the collection <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ND Perfume · Marketed by ND Lifestyle Pvt. Ltd.</span>
          <span className="f-pay">UPI · Cards · Netbanking · COD</span>
        </div>
      </div>
    </footer>
  );
}
